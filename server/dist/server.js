"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var Web3 = require("web3");
var FormData = require('form-data');
var axios = require('axios');
var BigNumber = require('bignumber.js');
var bodyParser = require('body-parser');
var cors = require('cors');
var crypto = require('crypto');
var society0xDonationContractBuild = require(path.join(__dirname, '../../ethereum/build/contracts/Society0xDonation.json'));
var society0xDonationABI = society0xDonationContractBuild['abi'];
var app = express();
BigNumber.config({ EXPONENTIAL_AT: 100 });
var pinataApiKey = process.env["PINATA_API_KEY"];
var pinataSecretApiKey = process.env["PINATA_SECRET_API_KEY"];
var infuraKey = process.env["INFURA_KEY"];
var infuraNetwork = process.env["INFURA_NETWORK"];
var society0xDonationAddressRinkeby = "0x59ca7428776a910ca5136b6880702d8b93e50cad";
console.log({ infuraNetwork: infuraNetwork });
var web3Rinkeby = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/" + infuraKey));
var society0xDonationInstanceRinkeby = new web3Rinkeby.eth.Contract(society0xDonationABI, society0xDonationAddressRinkeby);
app.use(cors());
app.options('*', cors());
app.use(bodyParser.raw({ limit: '3mb' }));
app.use(bodyParser.json({ limit: '3mb' }));
app.use(bodyParser.urlencoded({ limit: '3mb', extended: true }));
app.use(express.static(path.join(__dirname, '../../client/build')));
app.post('/ipfs/pin', function (req, res) {
    try {
        var url_1 = "https://api.pinata.cloud/pinning/pinFileToIPFS";
        var sha256Hash_1 = crypto.createHash('sha256');
        sha256Hash_1.write(req.body);
        sha256Hash_1.on('readable', function () {
            var hashData = sha256Hash_1.read();
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
                return axios.post(url_1, data, {
                    maxContentLength: 'Infinity',
                    headers: {
                        'Content-Type': "multipart/form-data; boundary=" + data._boundary,
                        'pinata_api_key': pinataApiKey,
                        'pinata_secret_api_key': pinataSecretApiKey
                    }
                }).then(function (response) {
                    if (response && response.data && response.data.IpfsHash) {
                        res.send([{ "hash": response.data.IpfsHash }]);
                        axios.get("https://ipfs.infura.io/ipfs/" + response.data.IpfsHash);
                    }
                }).catch(function (error) {
                    sha256Hash_1.end();
                    res.json(error);
                });
            }
        });
        sha256Hash_1.end();
    }
    catch (error) {
        console.log(error);
        res.json(error);
    }
});
app.get('/:network/foundation-milestone-progress', function (req, res) {
    try {
        var nextMilestone_1;
        var daiReceived_1;
        society0xDonationInstanceRinkeby.methods.getFundMetaData().call().then(function (result) {
            daiReceived_1 = BigNumber(result["0"].toString()).dividedBy('1e18').toString();
        });
        society0xDonationInstanceRinkeby.methods.getMilestoneCount().call().then(function (result) {
            var finalMilstoneIndex = (BigNumber(result.toString()) * 1) - 1;
            society0xDonationInstanceRinkeby.methods.milestones(finalMilstoneIndex).call().then(function (result) {
                nextMilestone_1 = BigNumber(result.toString()).dividedBy('1e18').toString();
                var currentMilestoneProgress = daiReceived_1 * 100 / nextMilestone_1 * 1;
                res.json({ currentMilestoneProgress: currentMilestoneProgress });
            });
        });
    }
    catch (error) {
        console.log(error);
        res.json(error);
    }
});
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});
var port = 3001;
app.listen(port);
console.log('App is listening on port ' + port);
