export class State {
    private _value: Record<string, any> = {}
    private static _instance: State

    constructor() {
        if (State._instance) {
            return State._instance
        }
        State._instance = this
    }

    get(keys?: string[]) {
        if (!keys || keys.length === 0) {
            return { ...this._value }
        }

        let result: Record<string, any> = {}

        keys.forEach((key) => {
            result[key] = this._value[key]
        })

        return result
    }

    set(key: string, value: any) {
        this._value[key] = value
    }

    clear() {
        this._value = {}
    }
}
