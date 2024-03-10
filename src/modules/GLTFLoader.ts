import { load } from '@loaders.gl/core'
import { GLTFLoader as Loader } from '@loaders.gl/gltf'
export class GLTFLoader {
    public static async loadFromURL(url: string) {
        const gltf = await load(url, Loader)

        console.log(gltf)
    }
}
