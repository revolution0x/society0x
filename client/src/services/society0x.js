import contract from 'truffle-contract';
import society0x from '../../../ethereum/build/contracts/Society0x.json';
import Web3 from 'web3';
import {store} from "../state";
import { setMyProfileMetaData, setWeb3 } from '../state/actions';
import { DefaultProfileMetaData } from '../utils/constants';
import getWeb3 from '../utils/getWeb3';
import { ethToBrowserFormatProfileMetaData } from "../utils";

const web3 = window.ethereum ? window.ethereum : new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io:443'));

if(window.ethereum) {
    
    initialiseProfileMetaData();

    window.ethereum.on('accountsChanged', async function (accounts) {
        await store.dispatch(setMyProfileMetaData(Object.assign(DefaultProfileMetaData, {id: accounts[0]})))
        window.location.reload();
    })
      
    window.ethereum.on('networkChanged', async function (netId) {
        const web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        await store.dispatch(setMyProfileMetaData(Object.assign(DefaultProfileMetaData, {id: accounts[0]})))
        window.location.reload();
    })
}

async function initialiseProfileMetaData() {
    const web3 = await getWeb3();
    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();
    let profileEthFormat = await getProfileFromAddress(accounts[0]);
    let profileBrowserFormat = ethToBrowserFormatProfileMetaData(profileEthFormat);
    await store.dispatch(setWeb3(web3));
    if(profileBrowserFormat){
        await store.dispatch(setMyProfileMetaData(profileBrowserFormat));
    }else{
        await store.dispatch(setMyProfileMetaData(Object.assign(DefaultProfileMetaData, {id: accounts[0]})))
    }
}

const society0xContract = contract(society0x);
society0xContract.setProvider(web3);

const getInstance = async () => {
    const instance = await society0xContract.deployed();
    return instance;
}

export const registerProfile = async (account, pseudonym, profileMetaIpfsHash) => {
    const instance = await getInstance();
    const item = await instance.registerProfile(pseudonym, profileMetaIpfsHash, {
        from: account
    })
    return item;
}

export const editProfileImage = async (account, profileImageIpfsHash) => {
    const instance = await getInstance();
    const item = await instance.editProfileImage(profileImageIpfsHash, {
        from: account
    })
    return item;
}

export const editCoverImage = async (account, coverImageIpfsHash) => {
    const instance = await getInstance();
    const item = await instance.editCoverImage(coverImageIpfsHash, {
        from: account
    })
    return item;
}

export const getProfileFromName = async (profileName) => {
    const instance = await getInstance();
    const doesProfileWithNameExist = await instance.isRegisteredName(profileName);
    if(doesProfileWithNameExist){
        const item = await instance.fetchProfileFromProfileName(profileName);
        return item;
    }
    return false;
}

export const getProfileFromAddress = async (address) => {
    const instance = await getInstance();
    const doesProfileWithAddressExist = await instance.isRegisteredAddress(address);
    if(doesProfileWithAddressExist){
        const item = await instance.fetchProfileFromAddress(address);
        return item;
    }
    return false;
}