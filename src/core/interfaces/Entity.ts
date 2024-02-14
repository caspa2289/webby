import { EntityTypes, EntityID } from '../types'

export interface Entity {
    id: EntityID
    type: EntityTypes
    parentId?: EntityID
}
