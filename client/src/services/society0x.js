import contract from 'truffle-contract';
import society0x from '../../../ethereum/build/contracts/Society0x.json';
import signal from '../../../ethereum/build/contracts/Signal.json';
import dai from '../../../ethereum/build/contracts/MockDAI.json';
import {store} from "../state";
import { setMyProfileMetaData, setWeb3, setClientProvidedEthNetId } from '../state/actions';
import { DefaultProfileMetaData, AcceptedEthNetIds } from '../utils/constants';
import getWeb3 from '../utils/getWeb3';
import { ethToBrowserFormatProfileMetaData, weiToEther, etherToWei, toNumber } from "../utils";

const Web3Library = require('web3');
const web3 = window.ethereum ? window.ethereum : new Web3Library(new Web3Library.providers.HttpProvider('https://rinkeby.infura.io:443'));

const society0xContract = contract(society0x);
society0xContract.setProvider(web3);

const getSociety0xInstance = async () => {
    const instance = await society0xContract.deployed();
    return instance;
}

const signalContract = contract(signal);
signalContract.setProvider(web3);

const daiContract = contract(dai);
daiContract.setProvider(web3);

const getSignalInstance = async () => {
    const instance = await signalContract.deployed();
    return instance;
}

const getDaiInstance = async () => {
    const instance = await daiContract.deployed();
    return instance;
}

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
    
    web3.eth.net.getNetworkType().then(async (netId) => {
        store.dispatch(setClientProvidedEthNetId(netId));
        if (AcceptedEthNetIds.indexOf(netId) > -1) {
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            let profileEthFormat = await getProfileFromAddress(accounts[0]);
            let profileBrowserFormat = ethToBrowserFormatProfileMetaData(profileEthFormat);
            await store.dispatch(setWeb3(web3));
            if (profileBrowserFormat) {
                await store.dispatch(setMyProfileMetaData(profileBrowserFormat));
            } else {
                await store.dispatch(setMyProfileMetaData(Object.assign(DefaultProfileMetaData, { id: accounts[0] })))
            }
        }
    });
}

export const registerProfile = async (account, pseudonym, profileMetaIpfsHash) => {
    const instance = await getSociety0xInstance();
    const item = await instance.registerProfile(pseudonym, profileMetaIpfsHash, {
        from: account
    })
    return item;
}

export const isEstablishedConnection = async (account = false, targetAddress = false) => {
    if((account && targetAddress) && (account !== targetAddress)) {
        const instance = await getSociety0xInstance();
        const item = await instance.isEstablishedConnection(targetAddress, {
            from: account
        })
        return item;
    }else{
        return false;
    }
}

export const isPendingIncomingConnection = async (account, targetAddress) => {
    if((account && targetAddress) && (account !== targetAddress)) {
        const instance = await getSociety0xInstance();
        const item = await instance.isPendingIncomingConnection(targetAddress, {
            from: account
        })
        return item;
    }else{
        return false;
    }
}

export const isPendingOutgoingConnection = async (account, targetAddress) => {
    if((account && targetAddress) && (account !== targetAddress)) {
        const instance = await getSociety0xInstance();
        const item = await instance.isPendingOutgoingConnection(targetAddress, {
            from: account
        })
        return item;
    }else{
        return false;
    }
}

export const createConnectionRequest = async (account, targetAddress) => {
    const instance = await getSociety0xInstance();
    const item = await instance.createConnectionRequest(targetAddress, {
        from: account
    })
    return item;
}

export const acceptConnectionRequest = async (account, targetAddress) => {
    if((account && targetAddress) && (account !== targetAddress)) {
        const instance = await getSociety0xInstance();
        const item = await instance.acceptConnectionRequest(targetAddress, {
            from: account
        })
        return item;
    }else{
        return false;
    }
}

export const terminateConnection = async (account, targetAddress) => {
    if((account && targetAddress) && (account !== targetAddress)) {
        const instance = await getSociety0xInstance();
        const item = await instance.terminateConnection(targetAddress, {
            from: account
        })
        return item;
    }else{
        return false;
    }
}

export const getInteractionFee = async () => {
    const instance = await getSociety0xInstance();
    const item = await instance.interactionFee();
    const value = await weiToEther(item);
    return value;
}

export const getSignalBalance = async (account) => {
    const instance = await getSignalInstance();
    const item = await instance.balanceOf(account);
    const value = await weiToEther(item);
    return value;
}

export const getSignalAllowance = async (account) => {
    const society0xInstance = await getSociety0xInstance();
    const signalInstance = await getSignalInstance();
    const item = await signalInstance.allowance(account, society0xInstance.address);
    const value = await weiToEther(item);
    return value;
}

export const getDaiBalance = async (account) => {
    const instance = await getDaiInstance();
    const item = await instance.balanceOf(account);
    const value = await weiToEther(item);
    return value;
}

export const getDaiAllowance = async (account) => {
    const signalInstance = await getSignalInstance();
    const daiInstance = await getDaiInstance();
    const item = await daiInstance.allowance(account, signalInstance.address);
    const value = await weiToEther(item);
    return value;
}

export const setSignalAllowance = async (account, etherValue) => {
    const society0xInstance = await getSociety0xInstance();
    const signalInstance = await getSignalInstance();
    const weiValue = etherToWei(etherValue);
    const item = await signalInstance.approve(society0xInstance.address, weiValue, {
        from: account
    });
    return item;
}

export const setDaiAllowance = async (account, etherValue) => {
    const daiInstance = await getDaiInstance();
    const signalInstance = await getSignalInstance();
    const weiValue = etherToWei(etherValue);
    const item = await daiInstance.approve(signalInstance.address, weiValue, {
        from: account
    });
    return item;
}

export const getTestDai = async (account) => {
    const daiInstance = await getDaiInstance();
    daiInstance.mint(account, etherToWei(100), {
        from: account
    });
}

export const withdrawDaiForSignal = async (account, etherValue) => {
    const signalInstance = await getSignalInstance();
    const weiValue = etherToWei(etherValue);
    const item = await signalInstance.withdraw(weiValue, {
        from: account
    });
    return item;
}

export const mintSignalForDai = async (account, etherValue) => {
    const signalInstance = await getSignalInstance();
    const weiValue = etherToWei(etherValue);
    const item = await signalInstance.mint(weiValue, {
        from: account
    });
    return item;
}

export const editProfileImage = async (account, profileImageIpfsHash) => {
    const instance = await getSociety0xInstance();
    const item = instance.editProfileImage(profileImageIpfsHash, {
        from: account
    })
    return item;
}

export const editCoverImage = async (account, coverImageIpfsHash) => {
    const instance = await getSociety0xInstance();
    const item = await instance.editCoverImage(coverImageIpfsHash, {
        from: account
    })
    return item;
}

export const getProfileFromName = async (profileName) => {
    const instance = await getSociety0xInstance();
    const doesProfileWithNameExist = await instance.isRegisteredName(profileName);
    if(doesProfileWithNameExist){
        const item = await instance.fetchProfileFromProfileName(profileName);
        return item;
    }
    return false;
}

export const getProfileFromAddress = async (address) => {
    const instance = await getSociety0xInstance();
    const doesProfileWithAddressExist = await instance.isRegisteredAddress(address);
    if(doesProfileWithAddressExist){
        const item = await instance.fetchProfileFromAddress(address);
        return item;
    }
    return false;
}

export const isAddress = async (nameOrAddress) => {
    if(typeof nameOrAddress === "string") {
        const isAnAddress = await new Web3Library().utils.isAddress(nameOrAddress);
        return isAnAddress
    }else{
        return false;
    }
};

export const getProfileFromNameOrAddress = async (nameOrAddress) => {
    const instance = await getSociety0xInstance();
    const fetchAddressProfile = await isAddress(nameOrAddress);
    if(fetchAddressProfile) {
        const doesProfileWithAddressExist = await instance.isRegisteredAddress(nameOrAddress);
        if(doesProfileWithAddressExist){
            const item = await instance.fetchProfileFromAddress(nameOrAddress);
            return item;
        }
    } else {
        const doesProfileWithNameExist = await instance.isRegisteredName(nameOrAddress);
        if(doesProfileWithNameExist){
            const item = await instance.fetchProfileFromProfileName(nameOrAddress);
            return item;
        }
    }
    return false;
}

export const isRegisteredAddress = async (address) => {
    const instance = await getSociety0xInstance();
    const doesProfileWithAddressExist = await instance.isRegisteredAddress(address);
    if(doesProfileWithAddressExist){
        return true
    }
    return false;
}

export const getDiscoveryIndex = async () => {
    const instance = await getSociety0xInstance();
    const discoveryIndexLength = await instance.getDiscoveryIndexLength();
    let discoveryIndex = [];
    for(let i = 0; i < discoveryIndexLength; i++) {
        const discoveryAddress = await instance.discoveryIndex.call(i);
        if (discoveryAddress !== "0x0000000000000000000000000000000000000000") {
            discoveryIndex.push(discoveryAddress);
        }
    }
    return discoveryIndex;
}

export const isInDiscoveryIndex = async(account) => {
    const instance = await getSociety0xInstance();
    const discoveryIndexForMsgSender = await instance.getDiscoveryIndexForMsgSender({
        from: account
    });
    if(discoveryIndexForMsgSender.toString() !== "3963877391197344453575983046348115674221700746820753546331534351508065746944"){
        try {
            const discoveryAddress = await instance.discoveryIndex.call(discoveryIndexForMsgSender.toString());
            if(discoveryAddress === account){
                return true;
            }
            return false;
        } catch(e) {
            return false;
        }
    }else{
        return false;
    }
}

export const joinDiscoveryIndex = async (account) => {
    const instance = await getSociety0xInstance();
    await instance.joinDiscoveryIndex({from: account});
    return true;
}

export const leaveDiscoveryIndex = async (account) => {
    const instance = await getSociety0xInstance();
    await instance.leaveDiscoveryIndex({from: account});
    return true;
}