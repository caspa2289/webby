import { Entities, EntityManager } from './EntityManager'
import { State } from './State'
import shader from '../shaders/test.wgsl'
import {
    POSITION_OFFSET,
    UV_OFFSET,
    VERTEX_SIZE,
    UNIFORM_BUFFER_SIZE,
} from './constants'
import { ENTITY_TYPES } from './types'
import { GameObject } from './GameObject'
import { Mesh } from './Mesh'
import { Camera } from './CameraBase'
import { Renderer } from './Renderer'
import { AudioListenerImpl } from './audio/AudioListenerImpl'

export class Webby {
    private static _instance?: Webby

    private _entityManager = new EntityManager()
    private _state = new State()
    private _camera?: Camera
    private _canvas: HTMLCanvasElement
    private _adapter?: GPUAdapter | null
    private _device?: GPUDevice | null
    private _context?: GPUCanvasContext | null
    private _elapsedTime: number = 0
    private _previousTime: number = 0
    private _audioListener?: AudioListenerImpl
    //FIXME: это всё надо перенести в renderer
    private _pipeline?: GPURenderPipeline
    private _depthTexture?: GPUTexture
    private _uniformBuffer?: GPUBuffer

    readonly _dpr = window.devicePixelRatio
    private readonly _canvasFormat = navigator?.gpu?.getPreferredCanvasFormat()

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        this._tick = this._tick.bind(this)

        if (Webby._instance) {
            return Webby._instance
        }
        Webby._instance = this
    }

    get canvasFormat() {
        return this._canvasFormat
    }

    public static getInstance() {
        return Webby._instance
    }

    get context() {
        return this._context
    }

    get camera() {
        return this._camera
    }

    set camera(value) {
        this._camera = value
    }

    get deltaTime() {
        return this._elapsedTime - this._previousTime
    }

    get device() {
        return this._device
    }

    get pipeline() {
        return this._pipeline
    }

    get depthTexture() {
        return this._depthTexture
    }

    get uniformBuffer() {
        return this._uniformBuffer
    }

    addEntities(objects: Entities[]) {
        this._entityManager.addEntities(objects)
    }

    get audioListener() {
        return this._audioListener
    }

    set audioListener(value) {
        this._audioListener = value
    }

    async init() {
        this._adapter = await navigator.gpu.requestAdapter()
        this._device = await this._adapter?.requestDevice()
        this._context = this._canvas.getContext('webgpu')

        if (this._adapter && this._device && this._context) {
            this._canvas.width = this._canvas.clientWidth * this._dpr
            this._canvas.height = this._canvas.clientHeight * this._dpr
            this._context.configure({
                device: this._device,
                format: this._canvasFormat,
                alphaMode: 'premultiplied',
            })

            // this._pipeline = this._device.createRenderPipeline({
            //     layout: 'auto',
            //     vertex: {
            //         module: this._device.createShaderModule({
            //             code: shader,
            //         }),
            //         entryPoint: 'vertex_main',
            //         buffers: [
            //             {
            //                 arrayStride: 0,
            //                 attributes: [
            //                     {
            //                         shaderLocation: 0,
            //                         offset: 0,
            //                         format: 'float32x4',
            //                     },
            //                     // {
            //                     //     shaderLocation: 1,
            //                     //     offset: UV_OFFSET,
            //                     //     format: 'float32x2',
            //                     // },
            //                 ],
            //             },
            //         ],
            //     },
            //     fragment: {
            //         module: this._device.createShaderModule({
            //             code: shader,
            //         }),
            //         entryPoint: 'fragment_main',
            //         targets: [
            //             {
            //                 format: this._canvasFormat,
            //             },
            //         ],
            //     },
            //     primitive: {
            //         topology: 'triangle-list',
            //         cullMode: 'back',
            //     },
            //     depthStencil: {
            //         depthWriteEnabled: true,
            //         depthCompare: 'less',
            //         format: 'depth24plus',
            //     },
            // })

            this._depthTexture = this._device.createTexture({
                size: [this._canvas.width, this._canvas.height],
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            })

            this._uniformBuffer = this._device.createBuffer({
                size: UNIFORM_BUFFER_SIZE,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })

            requestAnimationFrame(this._tick)
        } else {
            throw new Error('Webby has failed to initialize')
        }
    }

    private _tick(time: number) {
        if (!this._camera) {
            throw new Error('Camera is not set')
        }
        this._previousTime = this._elapsedTime
        this._elapsedTime = time
        const dt = this.deltaTime / 1000

        this.camera!.update(dt)

        const gameObjects = this._entityManager.getAllByTypes([
            ENTITY_TYPES.GameObject,
        ]) as GameObject[]

        const audio = this._entityManager.getAllByTypes([
            ENTITY_TYPES.AudioSource,
            ENTITY_TYPES.AudioListener,
        ]) as AudioListenerImpl[]

        // if (!this._device || !this.pipeline || !this._uniformBuffer) {
        //     throw new Error('GPU is inaccessible')
        // }

        gameObjects.forEach((gameObject) => {
            const meshes = this._entityManager
                .getByIds(gameObject.childrenIds)
                .filter((item) => item?.type === ENTITY_TYPES.Mesh) as Mesh[]

            Renderer.render(meshes, gameObject, this)

            gameObject.update(dt)
        })

        audio.forEach((item) => {
            item.update(dt)
        })

        requestAnimationFrame(this._tick)
    }
}
