import { Vec3, vec3 } from 'wgpu-matrix'
import { EntityBase } from './EntityBase'
import { Transform } from './interfaces/Transform'
import { ENTITY_TYPES } from './types'

export class TransformDefault extends EntityBase implements Transform {
    _rotation: Vec3
    _position: Vec3
    _scale: Vec3

    constructor({ rotation, position, scale }: Partial<Transform>) {
        super(ENTITY_TYPES.Transform)

        this._rotation = rotation ?? vec3.create()
        this._position = position ?? vec3.create()
        this._scale = scale ?? vec3.create(1, 1, 1)
    }

    get rotation() {
        return this._rotation
    }

    set rotation(value) {
        this._rotation = value
    }

    get position() {
        return this._position
    }

    set position(value) {
        this._position = value
    }

    get scale() {
        return this._scale
    }

    set scale(value) {
        this._scale = value
    }
}
