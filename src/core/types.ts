export enum ENTITY_TYPES {
    Mesh = 'Mesh',
    GameObject = 'GameObject',
    Entity = 'Entity',
    Camera = 'Camera',
    Transform = 'Transform',
}

export type EntityTypes = keyof typeof ENTITY_TYPES

export type EntityID = string
