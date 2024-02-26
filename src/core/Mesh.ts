import { EntityBase } from './EntityBase'
import { VERTEX_SIZE } from './constants'
import { ENTITY_TYPES } from './types'

export class Mesh extends EntityBase {
    verts: Float32Array
    //FIXME: мультитекстурирование
    texture?: GPUTexture
    vertexBuffer: GPUBuffer
    uniformBindGroup: GPUBindGroup
    renderPassDescriptor: GPURenderPassDescriptor

    constructor(
        verts: Float32Array,
        vertexBuffer: GPUBuffer,
        uniformBindGroup: GPUBindGroup,
        renderPassDescriptor: GPURenderPassDescriptor,
        texture?: GPUTexture
    ) {
        super(ENTITY_TYPES.Mesh)

        this.vertexBuffer = vertexBuffer
        this.uniformBindGroup = uniformBindGroup
        this.renderPassDescriptor = renderPassDescriptor
        this.texture = texture
        this.verts = verts
    }

    get vertexCount() {
        return this.verts.byteLength / VERTEX_SIZE
    }
}
