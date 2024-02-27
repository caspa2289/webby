import { Mat4, Vec3, vec3, mat4 } from 'wgpu-matrix'
import { CameraBase, CameraProps } from '../core/CameraBase'
import { Utils } from './Utils'

export type PerspectiveCameraProps = CameraProps & {
    target?: Vec3
    forward?: Vec3
}

export class PerspectiveCamera extends CameraBase {
    private _pitch = 0
    private _yaw = 0

    constructor(props: PerspectiveCameraProps) {
        super(props)
        this.position =
            props.position ?? (vec3.create(0, 0, -5) as Float32Array)
        const target = props.target ?? vec3.create(0, 0, 0)
        const forward = vec3.normalize(vec3.sub(target, this.position))
        this._recalculateAngles(forward)
    }

    private _recalculateAngles(direction: Vec3) {
        this.yaw = Math.atan2(direction[0], direction[2])
        this.pitch = -Math.asin(direction[1])
    }

    get matrix() {
        return super.matrix
    }

    set matrix(matrix: Mat4) {
        super.matrix = matrix
        this._recalculateAngles(this.back)
    }

    get pitch() {
        return this._pitch
    }

    get yaw() {
        return this._yaw
    }

    set pitch(value) {
        this._pitch = value
    }

    set yaw(value) {
        this._yaw = value
    }

    update(_: number): Mat4 {
        this.yaw = Utils.mod(this.yaw, Math.PI * 2)
        this.pitch = Utils.clamp(this.pitch, -Math.PI / 2, Math.PI / 2)

        super.matrix = mat4.rotateX(mat4.rotationY(this.yaw), this.pitch)
        super.view = mat4.invert(super.matrix)

        return super.view
    }
}
