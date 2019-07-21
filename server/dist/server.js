"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var FormData = require('form-data');
var axios = require('axios');
var bodyParser = require('body-parser');
var cors = require('cors');
var crypto = require('crypto');
var app = express();
var pinataApiKey = process.env["PINATA_API_KEY"];
var pinataSecretApiKey = process.env["PINATA_SECRET_API_KEY"];
app.use(cors());
app.options('*', cors());
app.use(bodyParser.raw({ limit: '3mb' }));
app.use(express.static(path.join(__dirname, '../../client/build')));
app.post('/ipfs/pin', function (req, res) {
    var url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    var sha256Hash = crypto.createHash('sha256');
    sha256Hash.write(req.body);
    sha256Hash.on('readable', function () {
        var hashData = sha256Hash.read();
        if (hashData) {
            var data = new FormData();
            data.append('file', req.body, { filename: hashData.toString('hex') });
            //metadata is optional
            var metadata = JSON.stringify({
                name: 'society0x'
            });
            data.append('pinataMetadata', metadata);
            //pinataOptions are optional
            var pinataOptions = JSON.stringify({
                cidVersion: 0
            });
            data.append('pinataOptions', pinataOptions);
            return axios.post(url, data, {
                maxContentLength: 'Infinity',
                headers: {
                    'Content-Type': "multipart/form-data; boundary=" + data._boundary,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey
                }
            }).then(function (response) {
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
});
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});
var port = 3001;
app.listen(port);
console.log('App is listening on port ' + port);
