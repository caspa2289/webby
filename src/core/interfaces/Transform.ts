import { Vec3 } from 'wgpu-matrix'
import { Entity } from './Entity'

export interface Transform extends Entity {
    rotation: Vec3
    position: Vec3
    scale: Vec3
}
