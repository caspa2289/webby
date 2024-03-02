import { EntityManager } from './EntityManager'
import { Entity } from './interfaces/Entity'
import { EntityID, EntityTypes } from './types'

export class EntityBase implements Entity {
    //FIXME: uuid
    private readonly _id: string = String(Math.random())
    private _type: EntityTypes
    private _parentId?: EntityID
    protected _entityManager = new EntityManager()

    constructor(type: EntityTypes) {
        this._type = type
    }

    get id() {
        return this._id
    }

    get type() {
        return this._type
    }

    set type(value) {
        this._type = value
    }

    get parentId() {
        return this._parentId
    }

    set parentId(value) {
        this._parentId = value
    }
}
