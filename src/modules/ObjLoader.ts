// import { Mesh } from '../core/Mesh'
// import { Webby } from '../core/Webby'
// import { cubeVertexArray as vertexArray } from '../meshes/cube'

// export class ObjLoader {
//     //FIXME: remove mocks
//     static async loadFromUrl(url: string) {
//         const webby = Webby.getInstance()
//         if (
//             !webby ||
//             !webby.pipeline ||
//             !webby.uniformBuffer ||
//             !webby.depthTexture
//         ) {
//             throw new Error('Webby is not initialized')
//         }

//         if (!webby.device) {
//             throw new Error('GPU device is inaccessible')
//         }

//         const image = await fetch('static/images/cubetexture.jpg')
//         const blob = await image.blob()

//         const imageBitmap = await createImageBitmap(blob)

//         const texture = webby.device.createTexture({
//             size: [imageBitmap.width, imageBitmap.height, 1],
//             format: 'rgba8unorm',
//             usage:
//                 GPUTextureUsage.TEXTURE_BINDING |
//                 GPUTextureUsage.COPY_DST |
//                 GPUTextureUsage.RENDER_ATTACHMENT,
//         })

//         webby.device.queue.copyExternalImageToTexture(
//             { source: imageBitmap },
//             { texture: texture },
//             [imageBitmap.width, imageBitmap.height]
//         )

//         const verticesBuffer = webby.device.createBuffer({
//             size: vertexArray.byteLength,
//             usage: GPUBufferUsage.VERTEX,
//             mappedAtCreation: true,
//         })

//         const sampler = webby.device.createSampler({
//             magFilter: 'linear',
//             minFilter: 'linear',
//         })

//         const uniformBindGroup = webby.device.createBindGroup({
//             layout: webby.pipeline.getBindGroupLayout(0),
//             entries: [
//                 {
//                     binding: 0,
//                     resource: {
//                         buffer: webby.uniformBuffer,
//                     },
//                 },
//                 {
//                     binding: 1,
//                     resource: sampler,
//                 },
//                 {
//                     binding: 2,
//                     resource: texture.createView(),
//                 },
//             ],
//         })

//         const renderPassDescriptor: GPURenderPassDescriptor = {
//             //@ts-ignore
//             colorAttachments: [
//                 {
//                     view: undefined, // Assigned later

//                     clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
//                     loadOp: 'clear',
//                     storeOp: 'store',
//                 },
//             ],
//             depthStencilAttachment: {
//                 view: webby.depthTexture.createView(),
//                 depthClearValue: 1.0,
//                 depthLoadOp: 'clear',
//                 depthStoreOp: 'store',
//             },
//         }

//         //FIXME: get rid of this
//         new Float32Array(verticesBuffer.getMappedRange()).set(vertexArray)
//         verticesBuffer.unmap()

//         return new Mesh(
//             vertexArray,
//             verticesBuffer,
//             uniformBindGroup,
//             renderPassDescriptor,
//             texture
//         )
//     }
// }
