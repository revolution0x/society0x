import * as express from 'express';
import * as path from 'path';
const Web3 = require("web3");
const FormData = require('form-data');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const society0xDonationContractBuild = require(path.join(__dirname, '../../ethereum/build/contracts/Society0xDonation.json'));
const society0xDonationABI = society0xDonationContractBuild['abi'];

const app = express();

BigNumber.config({ EXPONENTIAL_AT: 100 });
const pinataApiKey = process.env["PINATA_API_KEY"];
const pinataSecretApiKey = process.env["PINATA_SECRET_API_KEY"];
const infuraKey = process.env["INFURA_KEY"];
const infuraNetwork = process.env["INFURA_NETWORK"];

const society0xDonationAddressRinkeby = "0x59ca7428776a910ca5136b6880702d8b93e50cad"

console.log({infuraNetwork});

const web3Rinkeby = new Web3(new Web3.providers.HttpProvider(`https://rinkeby.infura.io/v3/${infuraKey}`));
const society0xDonationInstanceRinkeby = new web3Rinkeby.eth.Contract(society0xDonationABI, society0xDonationAddressRinkeby);

app.use(cors());
app.options('*', cors());

app.use(bodyParser.raw({limit: '3mb'}));

app.use(express.static(path.join(__dirname, '../../client/build')));

app.post('/ipfs/pin', (req, res) => {
    try{
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
                        axios.get("https://ipfs.infura.io/ipfs/" + response.data.IpfsHash);
                    }
                }).catch(function (error) {
                    sha256Hash.end();
                    res.json(error);
                });
            }
        });

        sha256Hash.end();
    }catch(error){
        console.log(error);
        res.json(error);
    }
})

app.get('/:network/foundation-milestone-progress', (req, res) => {
    try{
        let nextMilestone;
        let daiReceived;
        society0xDonationInstanceRinkeby.methods.getFundMetaData().call().then(function(result){
            daiReceived = BigNumber(result["0"].toString()).dividedBy('1e18').toString();
        });
        society0xDonationInstanceRinkeby.methods.getMilestoneCount().call().then(function(result){
            const finalMilstoneIndex = (BigNumber(result.toString()) * 1) - 1;
            society0xDonationInstanceRinkeby.methods.milestones(finalMilstoneIndex).call().then(function(result){
                nextMilestone = BigNumber(result.toString()).dividedBy('1e18').toString();
                const currentMilestoneProgress = daiReceived * 100 / nextMilestone * 1;
                res.json({currentMilestoneProgress});
            })
        })
    }catch(error){
        console.log(error);
        res.json(error);
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
})

const port = 3001;
app.listen(port);

console.log('App is listening on port ' + port);