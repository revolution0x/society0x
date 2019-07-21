import {pinToIpfs} from './api';

export const uploadToIPFS = (buffer) => {
    return new Promise(async (resolve, reject) => {
        let uploadResponse = await pinToIpfs(buffer);
        if(uploadResponse){
            resolve(uploadResponse);
        }
    });
}

// export const getFromIPFS = (hash) => {
//     return new Promise((resolve, reject) => {
//         ipfs.get(hash, (err, result) => {
//             if (err) {
//                 reject(err)
//             } else {
//                 resolve(result)
//             }
//         });
//     });
// }

// export const downloadFromIPFS = (hash, mimeType, fileName) => {
//     console.log("attempting file download");
//     getFromIPFS(hash).then((data, index) => {
//         let buffer = data[0].content;
//         let arrayBuffer = buffer.slice(
//             buffer.byteOffset, buffer.byteOffset + buffer.byteLength
//         )
//         var blob = new Blob([arrayBuffer], {
//             type: mimeType
//         });
//         var link = document.createElement('a');
//         link.href = window.URL.createObjectURL(blob);
//         link.download = fileName;
//         link.click();
//     })
// }