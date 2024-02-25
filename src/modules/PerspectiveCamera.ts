import { Mat4 } from 'wgpu-matrix'
import { CameraBase, CameraProps } from '../core/CameraBase'

export type PerspectiveCameraProps = CameraProps

export class PerspectiveCamera extends CameraBase {
    constructor(props: PerspectiveCameraProps) {
        super(props)
    }

    update(delta_time: number): Mat4 {
        return super.view
    }
}
