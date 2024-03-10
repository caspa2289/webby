import { vec3 } from 'wgpu-matrix'
import { Webby } from './core/Webby'
import { GameObject, GameObjectProps } from './core/GameObject'
import { PerspectiveCamera } from './modules/PerspectiveCamera'
import { FirstPersonController } from './modules/FirstPersonController'
import { AudioListenerImpl } from './core/audio/AudioListenerImpl'
import { AudioItem } from './core/audio/AudioItem'
import { AudioSource } from './core/audio/AudioSource'
import { GLTFLoader } from './modules/GLTFLoader'

type TeapotProps = GameObjectProps

class Teapot extends GameObject {
    constructor(props?: TeapotProps) {
        super(props)
    }

    update(deltaTime: number): void {
        // this.transform.rotation = vec3.add(
        //     this.transform.rotation,
        //     vec3.create(deltaTime, 0, deltaTime)
        // )
    }
}

const start = async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const webby = new Webby(canvas)
    await webby.init()

    const camera = new PerspectiveCamera({
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
    })

    const testAudio = new AudioItem({
        audioURL: '/static/audio/test.mp3',
    })
    const audioListener = new AudioListenerImpl({ camera })
    const audioSource = new AudioSource({ audioItem: testAudio })

    webby.camera = camera
    webby.audioListener = audioListener

    const fpsController = new FirstPersonController({
        inputConfig: { canvas },
    })

    const teapot = new Teapot({
        position: vec3.create(0, 0, -4),
    })

    const testMeshes = await GLTFLoader.loadFromUrl('static/models/fish.glb')
    const testMesh = testMeshes[0]

    webby.addEntities([
        camera,
        teapot,
        testMesh,
        fpsController,
        audioListener,
        audioSource,
    ])

    fpsController.camera = camera
    fpsController.attachChildren([camera.id])
    teapot.attachChildren([testMesh.id, audioSource.id])

    //audioSource.play()
}

start()
