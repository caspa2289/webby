import { GameObject } from './GameObject'
import { Mesh } from './Mesh'
import { mat4, vec3 } from 'wgpu-matrix'
import { Webby } from './Webby'

export class Renderer {
    static render(meshes: Mesh[], gameObject: GameObject, engine: Webby) {
        const viewMatrix = mat4.create()

        const gameObjectPosition = gameObject.worldPosition
        const gameObjectRotation = gameObject.worldRotation

        mat4.copy(engine.camera!.matrix, viewMatrix)
        mat4.translate(viewMatrix, gameObjectPosition, viewMatrix)
        mat4.rotate(
            viewMatrix,
            vec3.fromValues(1, 0, 0),
            gameObjectRotation[0],
            viewMatrix
        )
        mat4.rotate(
            viewMatrix,
            vec3.fromValues(0, 1, 0),
            gameObjectRotation[1],
            viewMatrix
        )
        mat4.rotate(
            viewMatrix,
            vec3.fromValues(0, 0, 1),
            gameObjectRotation[2],
            viewMatrix
        )

        mat4.scale(viewMatrix, gameObject.scale, viewMatrix)

        const modelViewProjection = mat4.multiply(
            engine.camera!.projectionMatrix,
            viewMatrix
        ) as Float32Array

        meshes.forEach((mesh) => {
            engine.device!.queue.writeBuffer(
                engine.uniformBuffer!,
                0,
                modelViewProjection.buffer,
                modelViewProjection.byteOffset,
                modelViewProjection.byteLength
            )

            //@ts-ignore
            mesh.renderPassDescriptor.colorAttachments[0].view = engine
                .context!.getCurrentTexture()
                .createView()

            const commandEncoder = engine.device!.createCommandEncoder()
            const passEncoder = commandEncoder.beginRenderPass(
                mesh.renderPassDescriptor
            )
            passEncoder.setPipeline(engine.pipeline!)
            passEncoder.setBindGroup(0, mesh.uniformBindGroup)
            passEncoder.setVertexBuffer(0, mesh.vertexBuffer)
            passEncoder.draw(mesh.vertexCount)
            passEncoder.end()
            engine.device!.queue.submit([commandEncoder.finish()])
        })
    }
}
