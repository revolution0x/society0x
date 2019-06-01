const Migrations = artifacts.require("Migrations");
const ERC20 = artifacts.require("Humanity");
const HumanityGovernance = artifacts.require("HumanityGovernance");
const HumanityRegistry = artifacts.require("HumanityRegistry");
const HumanityFaucet = artifacts.require("Faucet");
const TwitterApplicant = artifacts.require("TwitterHumanityApplicant");
const UniversalBasicIncome = artifacts.require("UniversalBasicIncome");

const uniswapFactoryABI = `[{"name":"NewExchange","inputs":[{"type":"address","name":"token","indexed":true},{"type":"address","name":"exchange","indexed":true}],"anonymous":false,"type":"event"},{"name":"initializeFactory","outputs":[],"inputs":[{"type":"address","name":"template"}],"constant":false,"payable":false,"type":"function","gas":35725},{"name":"createExchange","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"address","name":"token"}],"constant":false,"payable":false,"type":"function","gas":187911},{"name":"getExchange","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"address","name":"token"}],"constant":true,"payable":false,"type":"function","gas":715},{"name":"getToken","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"address","name":"exchange"}],"constant":true,"payable":false,"type":"function","gas":745},{"name":"getTokenWithId","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"uint256","name":"token_id"}],"constant":true,"payable":false,"type":"function","gas":736},{"name":"exchangeTemplate","outputs":[{"type":"address","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":633},{"name":"tokenCount","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":663}]`

const uniswapExchangeABI = `[{"name": "TokenPurchase", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "uint256", "name": "eth_sold", "indexed": true}, {"type": "uint256", "name": "tokens_bought", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "EthPurchase", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "uint256", "name": "tokens_sold", "indexed": true}, {"type": "uint256", "name": "eth_bought", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "AddLiquidity", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "eth_amount", "indexed": true}, {"type": "uint256", "name": "token_amount", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "RemoveLiquidity", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "eth_amount", "indexed": true}, {"type": "uint256", "name": "token_amount", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "Transfer", "inputs": [{"type": "address", "name": "_from", "indexed": true}, {"type": "address", "name": "_to", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "Approval", "inputs": [{"type": "address", "name": "_owner", "indexed": true}, {"type": "address", "name": "_spender", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "setup", "outputs": [], "inputs": [{"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 175875}, {"name": "addLiquidity", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_liquidity"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 82605}, {"name": "removeLiquidity", "outputs": [{"type": "uint256", "name": "out"}, {"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "amount"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 116814}, {"name": "__default__", "outputs": [], "inputs": [], "constant": false, "payable": true, "type": "function"}, {"name": "ethToTokenSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 12757}, {"name": "ethToTokenTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": true, "type": "function", "gas": 12965}, {"name": "ethToTokenSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 50455}, {"name": "ethToTokenTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": true, "type": "function", "gas": 50663}, {"name": "tokenToEthSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 47503}, {"name": "tokenToEthTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": false, "type": "function", "gas": 47712}, {"name": "tokenToEthSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 50175}, {"name": "tokenToEthTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": false, "type": "function", "gas": 50384}, {"name": "tokenToTokenSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 51007}, {"name": "tokenToTokenTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 51098}, {"name": "tokenToTokenSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 54928}, {"name": "tokenToTokenTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 55019}, {"name": "tokenToExchangeSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 49342}, {"name": "tokenToExchangeTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 49532}, {"name": "tokenToExchangeSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 53233}, {"name": "tokenToExchangeTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 53423}, {"name": "getEthToTokenInputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_sold"}], "constant": true, "payable": false, "type": "function", "gas": 5542}, {"name": "getEthToTokenOutputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}], "constant": true, "payable": false, "type": "function", "gas": 6872}, {"name": "getTokenToEthInputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}], "constant": true, "payable": false, "type": "function", "gas": 5637}, {"name": "getTokenToEthOutputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}], "constant": true, "payable": false, "type": "function", "gas": 6897}, {"name": "tokenAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413}, {"name": "factoryAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1443}, {"name": "balanceOf", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "_owner"}], "constant": true, "payable": false, "type": "function", "gas": 1645}, {"name": "transfer", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 75034}, {"name": "transferFrom", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 110907}, {"name": "approve", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_spender"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 38769}, {"name": "allowance", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "_owner"}, {"type": "address", "name": "_spender"}], "constant": true, "payable": false, "type": "function", "gas": 1925}, {"name": "name", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1623}, {"name": "symbol", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1653}, {"name": "decimals", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1683}, {"name": "totalSupply", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1713}]`;

const utils = require('../lib/test/utils/utils.js');
const utils0x = require('@0x/utils');
const ethers = require('ethers');
const readlineSync = require('readline-sync');

const privateKey = process.env["METAMASK_PRIVATE_KEY"];

let uniswapOverrides = {
  gasLimit: 500000,
  // The price (in wei) per unit of gas
  gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),
};

const readInformation = async (question) => {
  var answer = readlineSync.question(question);
  return answer;
}

const getNetworkAddressDAI = async (network) => {
  switch(network) {
    case "rinkeby":
    case "rinkeby-fork":
      return "0xef77ce798401dac8120f77dc2debd5455eddacf9";
    case "homestead":
      return "";
    default:
      throw new Error("Network Not Recognised in getNetworkAddressDAI - Aborting Deployment");
  }
}

const getNetworkAddressUniswap = async (network) => {
  switch(network) {
    case "rinkeby":
    case "rinkeby-fork":
      return "0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36";
    case "homestead":
      return "";
    default:
      throw new Error("Network Not Recognised in getNetworkAddressDAI - Aborting Deployment");
  }
}

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    console.log("network", network);
    const confirmation = await readInformation(`Please confirm that you would like to deploy to this network "${network}" (Y/N): `);
    if (confirmation.toLowerCase() === "y") {

      const proposalFee = await new utils0x.BigNumber('1e18');
      const DAIAddress = await getNetworkAddressDAI(network);
      const uniswapAddress = await getNetworkAddressUniswap(network);

      console.log("\r\nDAIAddress",DAIAddress);
      console.log("\r\nuniswapAddress",uniswapAddress);

      let provider = ethers.getDefaultProvider("rinkeby");
      let walletWithProvider = new ethers.Wallet(privateKey, provider);
      let walletPublicKey = walletWithProvider.address;
      const nonce = await walletWithProvider.getTransactionCount();
      
      console.log('\r\nCurrent nonce: ', nonce);

      const MigrationAddress = await utils.getAddress(walletPublicKey, nonce + 1);
      const ERC20Address = await utils.getAddress(walletPublicKey, nonce + 2);
      const GovernanceAddress = await utils.getAddress(walletPublicKey, nonce + 3);
      const RegistryAddress = await utils.getAddress(walletPublicKey, nonce + 4);
      const FaucetAddress = await utils.getAddress(walletPublicKey, nonce + 5);
      const TwitterApplicantAddress = await utils.getAddress(walletPublicKey, nonce + 6);
      const UBIAddress = await utils.getAddress(walletPublicKey, nonce + 7);

      console.log(`\r\nExpected MigrationAddress: ${MigrationAddress}`);
      console.log(`\r\nExpected ERC20Address: ${ERC20Address}`);
      console.log(`\r\nExpected GovernanceAddress: ${GovernanceAddress}`);
      console.log(`\r\nExpected RegistryAddress: ${RegistryAddress}`);

      let uniswapFactoryContract = new ethers.Contract(uniswapAddress, uniswapFactoryABI, walletWithProvider);
      const createUniswapExchange = await uniswapFactoryContract.createExchange(ERC20Address, uniswapOverrides);
      await createUniswapExchange.wait(); //Await Uniswap Exchange Creation
      const uniswapExchangeAddress = await uniswapFactoryContract.getExchange(ERC20Address);
      console.log(`\r\nCreated Uniswap Exchange Address: ${uniswapExchangeAddress}`);

      const MigrationContract = await deployer.deploy(Migrations);
      if(MigrationContract.address.toLowerCase() !== MigrationAddress) {
        throw new Error("MigrationContract Address Does Not Match Expected Address (MigrationAddress) - Aborting Deployment");
      }

      const ERC20Contract = await deployer.deploy(ERC20, RegistryAddress);
      if(ERC20Contract.address.toLowerCase() !== ERC20Address) {
        throw new Error("ERC20Contract Address Does Not Match Expected Address (ERC20Address) - Aborting Deployment");
      }

      const GovernanceContract = await deployer.deploy(HumanityGovernance, ERC20Address, proposalFee, RegistryAddress);
      if(GovernanceContract.address.toLowerCase() !== GovernanceAddress) {
        throw new Error("GovernanceContract Address Does Not Match Expected Address (GovernanceAddress) - Aborting Deployment");
      }

      const RegistryContract = await deployer.deploy(HumanityRegistry, ERC20Address, GovernanceAddress);
      if(RegistryContract.address.toLowerCase() !== RegistryAddress) {
        throw new Error("RegistryContract Address Does Not Match Expected Address (RegistryAddress) - Aborting Deployment");
      }

      const FaucetContract = await deployer.deploy(HumanityFaucet, ERC20Address, uniswapExchangeAddress);
      if(FaucetContract.address.toLowerCase() !== FaucetAddress) {
        throw new Error("FaucetContract Address Does Not Match Expected Address (FaucetAddress) - Aborting Deployment");
      }

      const TwitterApplicantContract = await deployer.deploy(TwitterApplicant, GovernanceAddress, RegistryAddress, ERC20Address, uniswapExchangeAddress);
      if(TwitterApplicantContract.address.toLowerCase() !== TwitterApplicantAddress) {
        throw new Error("TwitterApplicantContract Address Does Not Match Expected Address (TwitterApplicantAddress) - Aborting Deployment");
      }

      const UBIContract = await deployer.deploy(UniversalBasicIncome, RegistryAddress, DAIAddress);
      if(UBIContract.address.toLowerCase() !== UBIAddress) {
        throw new Error("UBIContract Address Does Not Match Expected Address (UBIAddress) - Aborting Deployment");
      }

    } else {
      console.log("\r\nDeployment cancelled, migration will still be saved to chain, but nothing else will be")
    }
  })
};