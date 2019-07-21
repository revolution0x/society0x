import * as express from 'express';
import * as path from 'path';
const FormData = require('form-data');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

const pinataApiKey = process.env["PINATA_API_KEY"];
const pinataSecretApiKey = process.env["PINATA_SECRET_API_KEY"];

app.use(cors());
app.options('*', cors());

app.use(bodyParser.raw({limit: '3mb'}));

app.use(express.static(path.join(__dirname, '../../client/build')));

app.post('/ipfs/pin', (req, res) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    const sha256Hash = crypto.createHash('sha256');

    sha256Hash.write(req.body);

    sha256Hash.on('readable', () => {
        const hashData = sha256Hash.read();
        if (hashData) {
            
            let data = new FormData();
    
            data.append('file', req.body, { filename: hashData.toString('hex') });
            
            //metadata is optional
            const metadata = JSON.stringify({
                name: 'society0x'
            });
            data.append('pinataMetadata', metadata);

            //pinataOptions are optional
            const pinataOptions = JSON.stringify({
                cidVersion: 0
            });
            data.append('pinataOptions', pinataOptions);

            return axios.post(url,
                data,
                {
                    maxContentLength: 'Infinity',
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                        'pinata_api_key': pinataApiKey,
                        'pinata_secret_api_key': pinataSecretApiKey
                    }
                }
            ).then(function (response) {
                if (response && response.data && response.data.IpfsHash) {
                    res.send([{ "hash": response.data.IpfsHash }]);
                }
            }).catch(function (error) {
                sha256Hash.end();
                res.json(error);
            });
        }
    });

    sha256Hash.end();
    
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
})

const port = 3001;
app.listen(port);

console.log('App is listening on port ' + port);