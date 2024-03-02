export interface AudioItemProps {
    audioURL: string
}

export class AudioItem {
    private _element: HTMLAudioElement

    constructor({ audioURL }: AudioItemProps) {
        this._element = document.createElement('audio')
        this._element.setAttribute('src', audioURL)
        this._element.setAttribute('crossorigin', 'anonymous')
        this._element.setAttribute('type', 'audio/mpeg')
        // this._element.autoplay = true
        document.body.appendChild(this._element)
    }

    get element() {
        return this._element
    }

    play() {
        this._element.play()
    }
}
