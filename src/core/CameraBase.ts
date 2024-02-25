import { mat4, Mat4, Vec3, vec3, Vec4 } from 'wgpu-matrix'
import { ENTITY_TYPES } from './types'
import { Entity } from './interfaces/Entity'

export interface Camera extends Entity {
    update(delta_time: number): Mat4
    matrix: Mat4 // This is the inverse of the view matrix.
    right: Vec4
    up: Vec4
    back: Vec4
    position: Float32Array
    aspectRatio: number
    zFar: number
    zNear: number
    projectionMatrix: Mat4
}

export interface CameraProps
    extends Partial<Pick<Camera, 'zFar' | 'zNear' | 'position'>> {
    canvasWidth: number
    canvasHeight: number
}

export abstract class CameraBase implements Camera {
    private readonly _id = String(Math.random())
    private readonly _type = ENTITY_TYPES.Camera
    private readonly _view = mat4.create()

    private _matrix = new Float32Array([
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ])
    private _right = new Float32Array(this._matrix.buffer, 4 * 0, 4)
    private _up = new Float32Array(this._matrix.buffer, 4 * 4, 4)
    private _back = new Float32Array(this._matrix.buffer, 4 * 8, 4)
    private _position = new Float32Array(this._matrix.buffer, 4 * 12, 4)

    private _zFar: number
    private _zNear: number
    private _aspectRatio: number
    private _projectionMatrix

    constructor({
        zFar,
        zNear,
        position,
        canvasWidth,
        canvasHeight,
    }: CameraProps) {
        this._zFar = zFar ?? 1000
        this._zNear = zNear ?? 0.1
        this._aspectRatio = canvasWidth / canvasHeight
        this._projectionMatrix = mat4.perspective(
            (2 * Math.PI) / 5,
            this._aspectRatio,
            this._zNear,
            this._zFar
        )
        if (position) {
            this._position = position
        }
    }

    get aspectRatio() {
        return this._aspectRatio
    }

    get zFar() {
        return this._zFar
    }

    get zNear() {
        return this._zNear
    }

    get projectionMatrix() {
        return this._projectionMatrix
    }

    get id() {
        return this._id
    }

    get type() {
        return this._type
    }

    get matrix() {
        return this._matrix
    }

    set matrix(mat: Mat4) {
        mat4.copy(mat, this._matrix)
    }

    get view() {
        return this._view
    }

    set view(mat: Mat4) {
        mat4.copy(mat, this._view)
    }

    get right() {
        return this._right
    }

    set right(vec: Vec3) {
        vec3.copy(vec, this._right)
    }

    get up() {
        return this._up
    }

    set up(vec: Vec3) {
        vec3.copy(vec, this._up)
    }

    get back() {
        return this._back
    }

    set back(vec: Vec3) {
        vec3.copy(vec, this._back)
    }

    get position() {
        return this._position
    }

    set position(vec: Float32Array) {
        vec3.copy(vec, this._position)
    }

    abstract update(delta_time: number): Mat4
}
