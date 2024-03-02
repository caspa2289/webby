import { Camera } from '../CameraBase'
import { GameObject, GameObjectProps } from '../GameObject'

export interface AudioListenerState {
    positionX: number
    positionY: number
    positionZ: number
    forwardX: number
    forwardY: number
    forwardZ: number
    upX: number
    upY: number
    upZ: number
}

export interface AudioListenerProps extends GameObjectProps {
    camera: Camera
}

export class AudioListenerImpl extends GameObject {
    private _state: AudioListenerState
    private _parent: Camera

    constructor({ camera, ...props }: AudioListenerProps) {
        super(props)
        this._parent = camera

        const cameraPosition = this._parent.worldPosition

        this._state = {
            positionX: cameraPosition[0],
            positionY: cameraPosition[1],
            positionZ: cameraPosition[2],
            forwardX: -camera.back[0],
            forwardY: -camera.back[1],
            forwardZ: -camera.back[2],
            upX: camera.up[0],
            upY: camera.up[1],
            upZ: camera.up[2],
        }
    }

    update(_: number): void {
        const cameraPosition = this._parent.worldPosition

        this._state = {
            positionX: cameraPosition[0],
            positionY: cameraPosition[1],
            positionZ: cameraPosition[2],
            forwardX: -this._parent.back[0],
            forwardY: -this._parent.back[1],
            forwardZ: -this._parent.back[2],
            upX: this._parent.up[0],
            upY: this._parent.up[1],
            upZ: this._parent.up[2],
        }
    }

    get state() {
        return this._state
    }
}
