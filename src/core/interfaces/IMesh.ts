import { GLTFPrimitiveImpl } from '../../modules/GLTFLoader'

export interface IMesh {
    name?: string
    verts: Float32Array
    texture?: GPUTexture
    vertexBuffer: GPUBuffer
    uniformBindGroup: GPUBindGroup
    renderPassDescriptor: GPURenderPassDescriptor
    vertexCount: number
    primitives: Array<GLTFPrimitiveImpl>
}
