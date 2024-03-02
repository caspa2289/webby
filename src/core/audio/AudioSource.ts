import { GameObject, GameObjectProps } from '../GameObject'
import { ENTITY_TYPES } from '../types'
import { AudioItem } from './AudioItem'
import { Webby } from '../Webby'

export type AudioSourceProps = GameObjectProps & {
    audioItem: AudioItem
}

export class AudioSource extends GameObject {
    private _context: AudioContext
    private _panningModel: PanningModelType = 'HRTF'
    private _innerCone = 60
    private _outerCone = 90
    private _outerGain = 0.3
    private _distanceModel: DistanceModelType = 'linear'
    private _maxDistance = 100
    private _referenceDistance = 1
    private _rollOffFactor = 10
    private _node: PannerNode
    private _audioItem: AudioItem

    constructor(props: AudioSourceProps) {
        super(props)
        this.type = ENTITY_TYPES.AudioSource
        this._context = new window.AudioContext()

        const worldPosition = this.worldPosition
        const worldRotation = this.worldRotation

        this._node = new PannerNode(this._context, {
            panningModel: this._panningModel,
            distanceModel: this._distanceModel,
            positionX: worldPosition[0],
            positionY: worldPosition[1],
            positionZ: worldPosition[2],
            orientationX: worldRotation[0],
            orientationY: worldRotation[1],
            orientationZ: worldRotation[2],
            refDistance: this._referenceDistance,
            maxDistance: this._maxDistance,
            rolloffFactor: this._rollOffFactor,
            coneInnerAngle: this._innerCone,
            coneOuterAngle: this._outerCone,
            coneOuterGain: this._outerGain,
        })

        this._audioItem = props.audioItem

        const track = new MediaElementAudioSourceNode(this._context, {
            mediaElement: props.audioItem.element,
        })
        track.connect(this._node).connect(this._context.destination)
    }

    play() {
        this._audioItem.play()
    }

    update(_: number): void {
        const webby = Webby.getInstance()
        if (!webby) {
            throw new Error('Webby is not initialized')
        }

        const listenerState = webby.audioListener?.state

        if (!listenerState) {
            throw new Error('AudioListener not found')
        }

        const worldPosition = this.worldPosition
        const worldRotation = this.worldRotation

        this._node.positionX.value = worldPosition[0]
        this._node.positionY.value = worldPosition[1]
        this._node.positionZ.value = worldPosition[2]

        this._node.orientationX.value = worldRotation[0]
        this._node.orientationY.value = worldRotation[1]
        this._node.orientationZ.value = worldRotation[2]

        this._context.listener.forwardX.value = listenerState.forwardX
        this._context.listener.forwardY.value = listenerState.forwardY
        this._context.listener.forwardZ.value = listenerState.forwardZ

        this._context.listener.positionX.value = listenerState.positionX
        this._context.listener.positionY.value = listenerState.positionY
        this._context.listener.positionZ.value = listenerState.positionZ

        this._context.listener.upX.value = listenerState.upX
        this._context.listener.upY.value = listenerState.upY
        this._context.listener.upZ.value = listenerState.upZ
    }
}
