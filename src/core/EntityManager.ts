import { EntityID, EntityTypes } from './types'
import { Mesh } from './Mesh'
import { Transform } from './interfaces/Transform'
import { GameObject } from './GameObject'
import { Camera } from './CameraBase'

//FIXME: отвязаться от имплементаций
export type Entities = Mesh | Camera | Transform | GameObject

export class EntityManager {
    private static _instance: EntityManager
    private _entities: Map<EntityID, Entities> = new Map()

    constructor() {
        if (EntityManager._instance) {
            return EntityManager._instance
        }
        EntityManager._instance = this
    }

    addEntities(entities: Entities[]) {
        let errors: string[] = []
        entities.forEach((entity) => {
            if (!this._entities.has(entity.id)) {
                this._entities.set(entity.id, entity)
            } else {
                errors.push(`Entity ${entity.id} is already registered`)
            }
        })

        if (errors.length) {
            throw new Error(errors.join(';\n'))
        }
    }

    removeEntities(ids: EntityID[]) {
        let errors: string[] = []
        ids.forEach((id) => {
            const error = this._entities.delete(id)
            if (error) {
                errors.push(`Failed to remove ${id}`)
            }
        })

        if (errors.length) {
            throw new Error(errors.join(';\n'))
        }
    }

    getAllByTypes(types: EntityTypes[]) {
        return [...this._entities.values()].filter((entity) =>
            types.includes(entity.type)
        )
    }

    getFirstOfType(type: EntityTypes) {
        return [...this._entities.values()].find((item) => {
            item.type === type
        })
    }

    getByIds(ids: EntityID[]) {
        return ids.map((id) => this._entities.get(id))
    }

    getById(id: EntityID) {
        return this._entities.get(id)
    }

    clear() {
        this._entities = new Map()
    }
}
