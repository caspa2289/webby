import { load } from '@loaders.gl/core'
import {
    GLTFAccessor,
    GLTFBufferView,
    GLTFLoader as Loader,
} from '@loaders.gl/gltf'
import {
    GLTFExternalBuffer,
    GLTFImage,
    GLTFSampler,
    GLTFTexture,
} from '@loaders.gl/gltf/dist/lib/types/gltf-types'

//https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

export class GLTFLoader {
    public static async loadFromURL(url: string) {
        const { json, buffers } = await load(url, Loader)

        if (json.scenes && json.scenes.length > 1) {
            throw new Error(
                'Webby can`t handle models with more than one scene (yet)'
            )
        }

        const {
            scenes: jsonScenes = [],
            accessors: jsonAccessors = [],
            textures: jsonTextures = [],
            bufferViews: jsonBufferViews = [],
            buffers: jsonBuffers = [],
            images: jsonImages = [],
            materials: jsonMaterials = [],
            meshes: jsonMeshes = [],
            nodes: jsonNodes = [],
            samplers: jsonSamplers = [],
        } = json

        const sceneName = jsonScenes[0]?.name ?? 'Scene'

        const parsedNodes = []
        for (const nodeData of jsonNodes) {
            //TODO: handle node children
            const nodeName = nodeData.name
            const nodeMesh =
                nodeData.mesh !== undefined ? jsonMeshes[nodeData.mesh] : null

            const parsedMesh = nodeMesh?.primitives.map((primitiveData) => {
                const { indices, attributes, material } = primitiveData

                const parsedAttributes = Object.entries(attributes).reduce(
                    (result, [key, value]) => {
                        const { componentType, type } = jsonAccessors[value]

                        const bufferBinaryData = getBinarySlice(
                            jsonAccessors,
                            jsonBufferViews,
                            buffers,
                            value
                        )

                        const component = {
                            size: BIT_SIZES_BY_COMPONENT_TYPE[componentType],
                            amount: COMPONENT_AMOUNT_BY_COMPONENT_TYPE[type],
                            type: componentType,
                        }

                        const data = {
                            component,
                            type,
                            bufferBinaryData,
                        }

                        return { ...result, ...{ [key]: data } }
                    },
                    {}
                )

                const parsedIndices = getBinarySlice(
                    jsonAccessors,
                    jsonBufferViews,
                    buffers,
                    indices
                )

                const materialData =
                    material !== undefined ? jsonMaterials[material] : null

                let parsedMaterial = null

                if (materialData) {
                    //TODO: handle normal textures
                    const {
                        doubleSided = false,
                        name,
                        normalTexture,
                        pbrMetallicRoughness,
                    } = materialData

                    let parsedPBR = undefined

                    if (pbrMetallicRoughness) {
                        //TODO: handle all types of pbr textures
                        const {
                            baseColorFactor = null,
                            metallicFactor = null,
                            roughnessFactor = null,
                            baseColorTexture = null,
                            metallicRoughnessTexture = null,
                        } = pbrMetallicRoughness

                        parsedPBR = {
                            baseColorFactor,
                            metallicFactor,
                            roughnessFactor,
                            baseColorTexture: getTextureData(
                                jsonTextures,
                                jsonSamplers,
                                jsonImages,
                                jsonBufferViews,
                                buffers,
                                baseColorTexture?.index
                            ),
                            metallicRoughnessTexture: getTextureData(
                                jsonTextures,
                                jsonSamplers,
                                jsonImages,
                                jsonBufferViews,
                                buffers,
                                metallicRoughnessTexture?.index
                            ),
                        }
                    }

                    parsedMaterial = {
                        doubleSided,
                        name,
                        pbrMetallicRoughness: parsedPBR,
                    }
                }

                return {
                    attributes: parsedAttributes,
                    indices: parsedIndices,
                    material: parsedMaterial,
                }
            })

            console.log(parsedMesh)
        }
    }
}

const getTextureData = (
    textures: GLTFTexture[],
    samplers: GLTFSampler[],
    images: GLTFImage[],
    bufferViews: GLTFBufferView[],
    buffers: GLTFExternalBuffer[],
    index?: number
) => {
    if (index === undefined) {
        return null
    }

    const { sampler, source } = textures[index]

    let parsedSampler = null

    if (sampler !== undefined) {
        parsedSampler = samplers[sampler]
    }

    let parsedSource = null

    if (source !== undefined) {
        const bufferViewIndex = images[source].bufferView
        if (bufferViewIndex !== undefined) {
            const {
                buffer,
                byteLength,
                byteOffset = 0,
            } = bufferViews[bufferViewIndex]

            const { arrayBuffer } = buffers[buffer]

            parsedSource = arrayBuffer.slice(
                byteOffset,
                byteOffset + byteLength
            )
        }
    }

    return {
        sampler: parsedSampler,
        source: parsedSource,
    }
}

const getBinarySlice = (
    accessors: GLTFAccessor[],
    bufferViews: GLTFBufferView[],
    buffers: GLTFExternalBuffer[],
    index?: number
) => {
    if (index === undefined) {
        return null
    }

    const { bufferView } = accessors[index]

    const bufferData = bufferView !== undefined ? bufferViews[bufferView] : null

    let bufferBinaryData = null

    if (bufferData) {
        const {
            buffer,
            byteOffset = 0,
            byteLength,
            byteStride = 0,
            /** 34962 ARRAY_BUFFER 34963 ELEMENT_ARRAY_BUFFER */
            target = 34962,
        } = bufferData

        const { arrayBuffer } = buffers[buffer]

        bufferBinaryData = arrayBuffer.slice(
            byteOffset,
            byteOffset + byteLength
        )
    }

    return bufferBinaryData
}

const BIT_SIZES_BY_COMPONENT_TYPE: Record<number, number> = {
    5120: 8, //signed byte
    5121: 8, //unsigned byte
    5122: 16, //signed short
    5123: 16, //unsigned short
    5125: 32, //unsigned int
    5126: 32, //signed float
}

const COMPONENT_AMOUNT_BY_COMPONENT_TYPE: Record<string, number> = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
}
