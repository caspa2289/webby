type KeyName = string
type EventName = string

export type KeyboardInputConfig = Record<KeyName, EventName>

export type InputManagerProps = Partial<{
    config: KeyboardInputConfig
    canvas: HTMLCanvasElement
}>

const defaultConfig: KeyboardInputConfig = {
    KeyA: 'MoveLeft',
    ArrowLeft: 'MoveLeft',
    KeyD: 'MoveRight',
    ArrowRight: 'MoveRight',
    KeyW: 'MoveForward',
    ArrowUp: 'MoveForward',
    KeyS: 'MoveBack',
    ArrowDown: 'MoveBack',
}

//TODO: поддержка мультитача
const defaultAnalogState = {
    deltaX: 0,
    deltaY: 0,
    isPointerDown: false,
    isContextClicked: false,
}

export class InputManager {
    private _config: KeyboardInputConfig
    private _state: Record<string, boolean>
    private _analogState: Record<string, number | boolean | string>
    private _canvas: HTMLCanvasElement | null = null

    constructor(props?: InputManagerProps) {
        this._config = props?.config ?? defaultConfig
        this._state = {}
        this._analogState = defaultAnalogState
        this._canvas = props?.canvas ?? null
        this._init()
    }

    get config() {
        return this._config
    }

    set config(value) {
        this._config = value
    }

    private _init() {
        this._initializeState()
        this._addListeners()
    }

    private _initializeState() {
        Object.values(this.config).forEach((action) => {
            this._state[action] = false
        })
    }

    private _addListeners() {
        //FIXME: it is better to set up all events in one listener
        Object.keys(this.config).forEach((key) => {
            window.addEventListener('keydown', (evt) => {
                if (evt.code === key) {
                    this._state[this.config[key]] = true
                }
            })
            window.addEventListener('keyup', (evt) => {
                if (evt.code === key) {
                    this._state[this.config[key]] = false
                }
            })
        })

        if (this._canvas) {
            this._addPointerListeners(this._canvas)
        } else {
            console.warn(
                'Analog input manager failed to initialize, canvas reference was not provided'
            )
        }
    }

    private _addPointerListeners(canvas: HTMLCanvasElement) {
        canvas.addEventListener('pointerdown', () => {})
    }

    isActive(eventName: string): boolean {
        if (this._state[eventName] === undefined)
            throw new Error(`Event ${eventName} was not provided in the config`)

        return this._state[eventName]
    }

    get pointer() {
        return this._analogState
    }
}
