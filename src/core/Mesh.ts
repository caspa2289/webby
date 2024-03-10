import { EntityBase } from './EntityBase'
// import { VERTEX_SIZE } from './constants'
import { IMesh } from './interfaces/IMesh'
import { ENTITY_TYPES } from './types'
import { GLTFPrimitiveImpl } from '../modules/GLTFLoader'

export class Mesh extends EntityBase {
    // implements IMesh
    // verts: Float32Array
    // texture?: GPUTexture
    // vertexBuffer: GPUBuffer
    // uniformBindGroup: GPUBindGroup
    // renderPassDescriptor: GPURenderPassDescriptor
    primitives: Array<GLTFPrimitiveImpl>
    isPipelineBuilt: boolean = false
    name?: string

    constructor(
        // verts: Float32Array,
        // vertexBuffer: GPUBuffer,
        // uniformBindGroup: GPUBindGroup,
        // renderPassDescriptor: GPURenderPassDescriptor,
        primitives: Array<GLTFPrimitiveImpl>,
        name?: string
    ) {
        super(ENTITY_TYPES.Mesh)

        this.primitives = primitives
        this.name = name
        // this.vertexBuffer = vertexBuffer
        // this.uniformBindGroup = uniformBindGroup
        // this.renderPassDescriptor = renderPassDescriptor
        // this.texture = texture
        // this.verts = verts
    }

    // get vertexCount() {
    //     return this.verts.byteLength / VERTEX_SIZE
    // }

    buildRenderPipeline(
        device: GPUDevice,
        shaderModule: GPUShaderModule,
        colorFormat: GPUTextureFormat,
        depthFormat: GPUTextureFormat,
        uniformsBGLayout: GPUBindGroupLayout
    ) {
        //FIXME: that`s fucking stupid
        for (let item of this.primitives) {
            item.buildRenderPipeline(
                device,
                shaderModule,
                colorFormat,
                depthFormat,
                uniformsBGLayout
            )
        }

        this.isPipelineBuilt = true
    }

    render(
        renderPassEncoder: GPURenderPassEncoder,
        uniformsBindGroup: GPUBindGroup
    ) {
        //FIXME: that`s fucking stupid
        for (let item of this.primitives) {
            item.render(renderPassEncoder, uniformsBindGroup)
        }
    }
}
