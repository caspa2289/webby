import { EntityBase } from './EntityBase'
import { TransformDefault } from './TransformDefault'
import { Transform } from './interfaces/Transform'
import { ENTITY_TYPES, EntityID } from './types'
import { Entities } from './EntityManager'

type GameObjectProps = Partial<Transform>

export abstract class GameObject extends EntityBase {
    private _children: EntityID[] = []
    private _transform: Transform

    constructor(props?: GameObjectProps) {
        super(ENTITY_TYPES.GameObject)

        this._transform = new TransformDefault({
            position: props?.position,
            rotation: props?.rotation,
            scale: props?.scale,
        })
    }

    //FIXME: можно добавлять меши из недобавленных геймобджектов, оставить только метод attach
    addChildren(values: Entities[]) {
        values.forEach((item, index) => {
            if (!this._children.includes(item.id)) {
                this._children.push(item.id)
            }
            values[index].parentId = this.id
        })

        this._entityManager.addEntities(values)
    }

    removeChildren(value: EntityID[]) {
        this._children = this._children.filter((item) => {
            !value.includes(item)
        })

        this._entityManager.removeEntities(value)
    }

    attachChildren(values: EntityID[]) {
        const failedList: EntityID[] = []
        values.forEach((item) => {
            if (!this._children.includes(item)) {
                this._children.push(item)
            } else {
                failedList.push(`Failed to attach ${item}`)
            }
        })

        if (failedList.length) {
            throw new Error(failedList.join(';\n'))
        }
    }

    detachChildren(value: EntityID[]) {
        const detachedChildren: EntityID[] = []

        this._children = this._children.filter((item) => {
            const isValueKept = !value.includes(item)

            if (!isValueKept) {
                detachedChildren.push(item)
            }

            return isValueKept
        })

        this._entityManager.getByIds(detachedChildren).forEach((item) => {
            if (item) {
                item.parentId = undefined
            }
        })
    }

    get localPosition() {
        return this._transform.position
    }

    get localRotation() {
        return this._transform.rotation
    }

    set localPosition(value) {
        this._transform.position = value
    }

    set localRotation(value) {
        this._transform.rotation = value
    }

    get childrenIds() {
        return this._children
    }

    get transform() {
        return this._transform
    }

    //FIXME: это надо считать не здесь
    // get worldPosition() {
    //     let result = this._transform.position
    //     if (this.parentId) {
    //         const parentObject = this._entityManager.getById(this.parentId)
    //         if (parentObject?.worldPosition) {
    //             result = vec3.add(
    //                 parentObject.worldPosition,
    //                 this.localPosition
    //             )
    //         }
    //     }

    //     return result
    // }

    abstract update(deltaTime: number): void
}
