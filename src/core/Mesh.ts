import { EntityBase } from './EntityBase'
import { ENTITY_TYPES } from './types'

export class Mesh extends EntityBase {
    verts: Float32Array
    uvs?: Float32Array
    //FIXME: мультитекстурирование
    textureBitMap?: ImageBitmap

    constructor(
        verts: Float32Array,
        uvs?: Float32Array,
        textureBitMap?: ImageBitmap
    ) {
        super(ENTITY_TYPES.Mesh)

        this.textureBitMap = textureBitMap
        this.verts = verts
        this.uvs = uvs
    }
}
