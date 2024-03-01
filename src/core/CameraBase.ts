import { Mat3, mat4, Mat4, Vec3, vec3, Vec4 } from 'wgpu-matrix'
import { ENTITY_TYPES } from './types'
import { GameObject, GameObjectProps } from './GameObject'

export interface Camera extends GameObject {
    update(delta_time: number): Mat4
    matrix: Mat3 // This is the inverse of the view matrix.
    view: Mat4
    right: Vec4
    up: Vec4
    back: Vec4
    aspectRatio: number
    zFar: number
    zNear: number
    projectionMatrix: Mat4
}

export interface CameraProps
    extends Partial<Pick<Camera, 'zFar' | 'zNear'>>,
        GameObjectProps {
    canvasWidth: number
    canvasHeight: number
}

export abstract class CameraBase extends GameObject implements Camera {
    private readonly _view = mat4.create()

    private _matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0])
    private _right = new Float32Array(this._matrix.buffer, 4 * 0, 4)
    private _up = new Float32Array(this._matrix.buffer, 4 * 4, 4)
    private _back = new Float32Array(this._matrix.buffer, 4 * 8, 4)

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
        super({ type: ENTITY_TYPES.Camera, position })
        this._zFar = zFar ?? 1000
        this._zNear = zNear ?? 0.1
        this._aspectRatio = canvasWidth / canvasHeight
        this._projectionMatrix = mat4.perspective(
            (2 * Math.PI) / 5,
            this._aspectRatio,
            this._zNear,
            this._zFar
        )
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

    get matrix() {
        return mat4.create(...this._matrix, ...this.worldPosition, 1)
    }

    set matrix(mat: Mat4) {
        mat4.copy([...mat.slice(0, 12), ...this.worldPosition, 1], this._matrix)
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

    abstract update(delta_time: number): Mat4
}
