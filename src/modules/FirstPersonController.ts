import { Vec3, vec3 } from 'wgpu-matrix'
import { GameObject, GameObjectProps } from '../core/GameObject'
import { InputManagerProps, InputManager } from './InputManager'
import { PerspectiveCamera } from './PerspectiveCamera'
import { Utils } from './Utils'

export type FirstPersonControllerProps = {
    inputConfig?: InputManagerProps
    gameObjectConfig?: GameObjectProps
    config?: {
        movementSpeed?: number
        rotationSpeed?: number
        frictionCoefficient?: number
    }
}

export class FirstPersonController extends GameObject {
    private _inputManager: InputManager
    private _camera?: PerspectiveCamera
    private _velocity: Vec3

    public movementSpeed: number = 5
    public rotationSpeed: number = 1
    public frictionCoefficient: number = 0.99

    constructor(props?: FirstPersonControllerProps) {
        super(props?.gameObjectConfig)

        this._inputManager = new InputManager(props?.inputConfig)
        this._velocity = vec3.create(0, 0, 0)
    }

    get velocity() {
        return this._velocity
    }

    set velocity(value) {
        vec3.copy(value, this._velocity)
    }

    set camera(camera: PerspectiveCamera) {
        this._camera = camera
    }

    update(deltaTime: number): void {
        if (!this._camera) {
            throw new Error(
                'Failed to update FirstPersonController, camera not found'
            )
        }
        const pointerStateSnapshot = this._inputManager.pointerStateSnapshot

        const sign = (positive: boolean, negative: boolean) =>
            (positive ? 1 : 0) - (negative ? 1 : 0)

        const deltaRight = sign(
            this._inputManager.isActive('MoveRight'),
            this._inputManager.isActive('MoveLeft')
        )
        const targetVelocity = vec3.create()
        const deltaBack = sign(
            this._inputManager.isActive('MoveBack'),
            this._inputManager.isActive('MoveForward')
        )
        vec3.addScaled(
            targetVelocity,
            this._camera.right,
            deltaRight,
            targetVelocity
        )
        vec3.addScaled(
            targetVelocity,
            this._camera.back,
            deltaBack,
            targetVelocity
        )
        vec3.normalize(targetVelocity, targetVelocity)
        vec3.mulScalar(targetVelocity, this.movementSpeed, targetVelocity)

        this.velocity = Utils.lerp(
            targetVelocity,
            this.velocity,
            Math.pow(1 - this.frictionCoefficient, deltaTime)
        )

        this.localPosition = vec3.addScaled(
            this.localPosition,
            this.velocity,
            deltaTime
        )

        if (pointerStateSnapshot.isPointerDown) {
            this._camera.yaw -=
                pointerStateSnapshot.deltaX * deltaTime * this.rotationSpeed
            this._camera.pitch -=
                pointerStateSnapshot.deltaY * deltaTime * this.rotationSpeed
        }
    }
}
