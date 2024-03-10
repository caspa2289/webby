//https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

/**
 * Entities of a glTF asset are referenced by their indices in corresponding arrays,
 * e.g., a bufferView refers to a buffer by specifying the buffer’s index in buffers array.
 
 * Whereas indices are used for internal glTF references,
 * optional names are used for application-specific uses such as display.
 * Any top-level glTF object MAY have a name string property for this purpose.
 * These property values are not guaranteed to be unique
 * as they are intended to contain values created when the asset was authored.

 * glTF uses a right-handed coordinate system.
 * glTF defines +Y as up, +Z as forward, and -X as right; the front of a glTF asset faces +Z.
 * The units for all linear distances are meters.
 * All angles are in radians.
 * Positive rotation is counterclockwise.
 */

//Element size, in bytes, is (size in bytes of the 'componentType') * (number of components defined by 'type').
/** COMPONENT TYPE
 * 5120 signed byte     8bits
 * 5121 unsigned byte   8bits
 * 5122 signed short    16bits
 * 5123 unsigned short  16bits
 * 5125 unsigned int    32bits
 * 5126 signed float    32bits
 */

/** TYPE
 * "SCALAR"   1 component
 * "VEC2"     2 components
 * "VEC3"     3 components
 * "VEC4"     4
 * "MAT2"     4
 * "MAT3"     9
 * "MAT4"     16
 */
import { load } from '@loaders.gl/core'
import { GLTFBufferView, GLTFLoader as loader } from '@loaders.gl/gltf'
import { IMesh } from '../core/interfaces/IMesh'
import { Mesh } from '../core/Mesh'
import { Webby } from '../core/Webby'

export class GLTFLoader {
    static async loadFromUrl(url: string): Promise<Mesh[]> {
        const gltf = await load(url, loader)

        const {
            accessors,
            buffers: jsonBuffers,
            bufferViews,
            images: jsonImages,
            materials,
            meshes,
            nodes,
            scenes,
            textures,
        } = gltf.json

        const { buffers, images } = gltf

        if (scenes?.length && scenes.length > 1) {
            throw new Error(
                'Webby can`t handle models with multiple scenes (yet)'
            )
        }

        const device = Webby.getInstance()!.device!

        const parsedBufferViews: GLTFBufferViewImpl[] = []
        const parsedAccessors: GLTFAccessorImpl[] = []

        for (let bufferView of bufferViews ?? []) {
            const { byteLength, byteStride = 0, byteOffset = 0 } = bufferView

            const buffer = buffers[bufferView.buffer].arrayBuffer

            const parsedBufferView = new GLTFBufferViewImpl(
                new GLTFBufferImpl(buffer, byteOffset, byteLength),
                byteLength,
                byteStride,
                byteOffset
            )

            parsedBufferView.usage = GPUBufferUsage.COPY_SRC
            parsedBufferView.upload(device)

            parsedBufferViews.push(parsedBufferView)
        }

        for (let accessor of accessors ?? []) {
            const {
                count,
                componentType,
                bufferView: viewID,
                type: gltfType,
                byteOffset = 0,
            } = accessor

            const bufferView = parsedBufferViews![viewID!]

            const parsedAccessor = new GLTFAccessorImpl(
                bufferView,
                count,
                componentType,
                gltfType,
                byteOffset
            )

            parsedAccessor.view.upload(device)

            parsedAccessors.push(parsedAccessor)
        }

        const parsedMeshes = (scenes ?? [])[0].nodes?.map((nodeIndex) => {
            //FIXME: handle exceptions properly
            const node = (nodes ?? [])[nodeIndex]
            //FIMXE: handle node children
            const mesh = (meshes ?? [])[node.mesh ?? 0]
            const meshName = mesh.name

            const parsedPrimitives: GLTFPrimitiveImpl[] = []

            for (let primitive of mesh.primitives) {
                //default to triangle-list
                let topology = primitive.mode ?? 4
                if (
                    //if not triangle-list or triangle-strip, fuck it
                    topology != 4 &&
                    topology != 5
                ) {
                    throw new Error(
                        `Unsupported primitive mode ${primitive.mode}`
                    )
                }

                const indices =
                    primitive.indices !== undefined
                        ? parsedAccessors[primitive.indices]
                        : undefined

                //FIXME: handle all attributes
                //Find position attribute
                let positions = null
                for (let attribute in primitive.attributes) {
                    if (attribute !== 'POSITION') {
                        continue
                    }
                    let accessor =
                        parsedAccessors[primitive.attributes[attribute]]
                    positions = accessor
                }

                if (!positions) {
                    throw new Error('Positions not found')
                }

                // Add the primitive to the mesh's list of primitives
                parsedPrimitives.push(
                    new GLTFPrimitiveImpl(positions, topology, indices)
                )
            }

            return new Mesh(parsedPrimitives, meshName)
        })

        return parsedMeshes ?? []
    }
}

export class GLTFBufferImpl {
    buffer: Uint8Array

    constructor(buffer: ArrayBufferLike, offset: number, size: number) {
        this.buffer = new Uint8Array(buffer, offset, size)
    }
}

export class GLTFBufferViewImpl {
    private readonly _length: number
    private readonly _byteStride: number
    private _view: Uint8Array
    private _usage: GPUFlagsConstant = 0
    private _shouldUpload: boolean = false
    private _gpuBuffer?: GPUBuffer

    constructor(
        buffer: GLTFBufferImpl,
        byteLength: number,
        byteStride = 0,
        byteOffset = 0
    ) {
        this._length = byteLength
        this._byteStride = byteStride
        const viewOffset = byteOffset
        this._view = buffer.buffer.subarray(
            viewOffset,
            viewOffset + this.length
        )
    }

    get view() {
        return this._view
    }

    get gpuBuffer() {
        return this._gpuBuffer
    }

    get length() {
        return this._length
    }

    get byteStride() {
        return this._byteStride
    }

    get shouldUpload() {
        return this._shouldUpload
    }

    set shouldUpload(value) {
        this._shouldUpload = value
    }

    get usage() {
        return this._usage
    }

    set usage(value) {
        this._usage = value
    }

    upload(device: GPUDevice) {
        console.log(this)

        const buffer = device.createBuffer({
            size: Math.floor((this.view.byteLength + 3) / 4) * 4,
            usage: this.usage,
            mappedAtCreation: true,
        })
        new Uint8Array(buffer.getMappedRange()).set(this.view)
        buffer.unmap()
        this._gpuBuffer = buffer
    }
}

export class GLTFAccessorImpl {
    private readonly _count: number
    private readonly _componentType: number
    private readonly _gltfType: string
    private readonly _view: GLTFBufferViewImpl
    private readonly _byteOffset: number

    constructor(
        view: GLTFBufferViewImpl,
        count: number,
        componentType: number,
        gltfType: string,
        byteOffset: number
    ) {
        this._count = count
        this._componentType = componentType
        this._gltfType = gltfType
        this._view = view
        this._byteOffset = byteOffset
    }

    get count() {
        return this._count
    }

    get byteOffset() {
        return this._byteOffset
    }

    get view() {
        return this._view
    }

    get byteStride() {
        const elementSize = getGLTFTypeSize(this._componentType, this._gltfType)
        return Math.max(elementSize, this._view.byteStride)
    }

    get byteLength() {
        return this._count * this.byteStride
    }

    get elementType() {
        return getGLTFVertexType(this._componentType, this._gltfType)
    }
}

export class GLTFPrimitiveImpl {
    private _positions: GLTFAccessorImpl
    private _indices?: GLTFAccessorImpl
    private _topology: number
    private _renderPipeline?: GPURenderPipeline

    constructor(
        positions: GLTFAccessorImpl,
        topology: number,
        indices?: GLTFAccessorImpl
    ) {
        this._positions = positions
        this._indices = indices
        this._topology = topology
        this._positions.view.usage = GPUBufferUsage.VERTEX

        if (this._indices) {
            this._indices.view.usage = GPUBufferUsage.INDEX
            this._indices.view.upload(Webby.getInstance()!.device!)
        }
    }

    buildRenderPipeline(
        device: GPUDevice,
        shaderModule: GPUShaderModule,
        colorFormat: GPUTextureFormat,
        depthFormat: GPUTextureFormat,
        uniformsBGLayout: GPUBindGroupLayout
    ) {
        const vertexState = {
            module: shaderModule,
            entryPoint: 'vertex_main',
            buffers: [
                {
                    arrayStride: this._positions.byteStride,
                    attributes: [
                        {
                            format: this._positions.elementType,
                            offset: 0,
                            shaderLocation: 0,
                        },
                    ],
                },
            ],
        }

        const fragmentState = {
            module: shaderModule,
            entryPoint: 'fragment_main',
            targets: [{ format: colorFormat }],
        }

        const primitive: GPUPrimitiveState =
            this._topology === 5
                ? {
                      topology: 'triangle-strip',
                      stripIndexFormat: this._indices
                          ?.elementType as GPUIndexFormat,
                  }
                : { topology: 'triangle-list' }

        const layout = device.createPipelineLayout({
            bindGroupLayouts: [uniformsBGLayout],
        })

        this._renderPipeline = device.createRenderPipeline({
            layout,
            vertex: vertexState as GPUVertexState,
            fragment: fragmentState,
            primitive,
            depthStencil: {
                format: depthFormat,
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        })
    }

    render(
        renderPassEncoder: GPURenderPassEncoder,
        uniformsBindGroup: GPUBindGroup
    ) {
        if (!this._renderPipeline) {
            throw new Error('Render pipeline is not initialized')
        }
        renderPassEncoder.setPipeline(this._renderPipeline)
        renderPassEncoder.setBindGroup(0, uniformsBindGroup)

        renderPassEncoder.setVertexBuffer(
            0,
            this._positions.view.gpuBuffer ?? null,
            this._positions.byteOffset,
            this._positions.byteLength
        )

        if (this._indices) {
            renderPassEncoder.setIndexBuffer(
                this._indices.view.gpuBuffer!,
                this._indices.elementType as GPUIndexFormat,
                this._indices.byteOffset,
                this._indices.byteLength
            )
            renderPassEncoder.drawIndexed(this._indices.count)
        } else {
            renderPassEncoder.draw(this._positions.count)
        }
    }
}

const getGLTFVertexType = (componentType: number, type: string) => {
    let typeStr: string

    switch (componentType) {
        case 5120:
            typeStr = 'sint8'
            break
        case 5121:
            typeStr = 'uint8'
            break
        case 5122:
            typeStr = 'sint16'
            break
        case 5123:
            typeStr = 'uint16'
            break
        case 5125:
            typeStr = 'uint32'
            break
        case 5126:
            typeStr = 'float32'
            break
        default:
            throw Error(
                `Unrecognized or unsupported glTF type ${componentType}`
            )
    }

    switch (COMPONENTS_AMOUNT_BY_TYPE[type]) {
        case 1:
            return typeStr
        case 2:
            return `${typeStr}x2`
        case 3:
            return `${typeStr}x3`
        case 4:
            return `${typeStr}x4`
        default:
            throw new Error(
                `Invalid number of components for gltfType: ${type}`
            )
    }
}

const getGLTFTypeSize = (componentType: number, type: string) => {
    let componentSize = 0
    switch (componentType) {
        case 5120:
            componentSize = 1
            break
        case 5121:
            componentSize = 1
            break
        case 5122:
            componentSize = 2
            break
        case 5123:
            componentSize = 2
            break
        case 5125:
            componentSize = 4
            break
        case 5126:
            componentSize = 4
            break
        default:
            throw new Error(`Unknown component type ${componentType}`)
    }

    return COMPONENTS_AMOUNT_BY_TYPE[type] * componentSize
}

const COMPONENTS_AMOUNT_BY_TYPE: Record<string, number> = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
}
