import axios from 'axios';
import {IPFS_PINNING_ENDPOINT} from './constants';

export const pinToIpfs = (data) => {
    return new Promise((resolve, reject) => {
        axios.post(IPFS_PINNING_ENDPOINT,
            data,
            {
                maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                headers: {
                    'Content-Type': `application/octet-stream`,
                    "Access-Control-Allow-Origin": "*"
                }
            }
        ).then(function (response) {
            if(response && response.data){
                resolve(response.data)
            }else{
                reject({response})
            }
        }).catch(function (error) {
            reject({error})
            //handle error here
        });
    })
}