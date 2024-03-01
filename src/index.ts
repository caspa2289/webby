import { vec3 } from 'wgpu-matrix'
import { Webby } from './core/Webby'
import { GameObject, GameObjectProps } from './core/GameObject'
import { ObjLoader } from './modules/ObjLoader'
import { PerspectiveCamera } from './modules/PerspectiveCamera'
import { FirstPersonController } from './modules/FirstPersonController'

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

    webby.camera = camera

    const fpsController = new FirstPersonController({
        inputConfig: { canvas },
    })

    const teapot = new Teapot({
        position: vec3.create(0, 0, -4),
    })

    const cubeMesh = await ObjLoader.loadFromUrl('todo')

    webby.addEntities([camera, teapot, cubeMesh, fpsController])

    fpsController.camera = camera
    fpsController.attachChildren([camera.id])
    teapot.attachChildren([cubeMesh.id])
}

start()
