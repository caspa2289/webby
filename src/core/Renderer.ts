import { GameObject } from './GameObject'
import { Mesh } from './Mesh'
import { mat4, vec3 } from 'wgpu-matrix'
import { Webby } from './Webby'
import shader from '../shaders/test.wgsl'

export class Renderer {
    static render(meshes: Mesh[], gameObject: GameObject, engine: Webby) {
        const viewMatrix = mat4.create()

        const gameObjectPosition = gameObject.worldPosition
        const gameObjectRotation = gameObject.worldRotation

        mat4.copy(engine.camera!.view, viewMatrix)
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

        const commandEncoder = engine.device!.createCommandEncoder()

        const passEncoder = commandEncoder.beginRenderPass({
            //@ts-ignore
            colorAttachments: [
                {
                    view: engine.context?.getCurrentTexture().createView(), // Assigned later
                    clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: engine.depthTexture!.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        })

        const bindGroupLayout = engine.device!.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' },
                },
            ],
        })

        const uniformBindGroup = engine.device!.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: engine.uniformBuffer!,
                    },
                },
            ],
        })

        const shaderModule = engine.device!.createShaderModule({ code: shader })

        meshes.forEach((mesh) => {
            if (!mesh.isPipelineBuilt) {
                mesh.buildRenderPipeline(
                    engine.device!,
                    shaderModule,
                    engine.canvasFormat!,
                    'depth24plus-stencil8',
                    bindGroupLayout
                )
            }
            mesh.render(passEncoder, uniformBindGroup)
        })
    }
}
