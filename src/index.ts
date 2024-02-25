import { vec3 } from 'wgpu-matrix'
import { Webby } from './core/Webby'
import { GameObject } from './core/GameObject'
import { ObjLoader } from './modules/ObjLoader'
import { PerspectiveCamera } from './modules/PerspectiveCamera'

class Teapot extends GameObject {
    readonly testNumber = 42

    update(deltaTime: number): void {
        this.transform.rotation = vec3.add(
            this.transform.rotation,
            vec3.create(0, 1 * deltaTime, 1 * deltaTime)
        )

        console.log(this.testNumber)
    }
}

const start = async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const webby = new Webby(canvas)
    await webby.init()

    webby.camera = new PerspectiveCamera({
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
    })

    const teapot = new Teapot()

    const cubeMesh = await ObjLoader.loadFromUrl('blerp')

    webby.addEntities([teapot, cubeMesh])
    teapot.attachChildren([cubeMesh.id])
}

start()
