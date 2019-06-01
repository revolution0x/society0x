import contract from 'truffle-contract';
import society0x from '../../../ethereum/build/contracts/Society0x.json';
import Web3 from 'web3';

const web3 = window.ethereum ? window.ethereum : new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io:443'));

console.log(web3.currentProvider);

const society0xContract = contract(society0x);
society0xContract.setProvider(web3);

const getInstance = async () => {
    const instance = await society0xContract.deployed();
    return instance;
}

export const registerMember = async (account, pseudonym, profilePictureHash = "", coverPictureHash = "") => {
    const instance = await getInstance();
    const item = await instance.registerMember(pseudonym, profilePictureHash, coverPictureHash, {
        from: account
    })
    return item;
}

export const getMemberProfileFromName = async (memberName) => {
    const instance = await getInstance();
    const item = await instance.fetchMemberFromMemberName(memberName);
    return item;
}

export const getMemberProfileFromAddress = async (address) => {
    const instance = await getInstance();
    const item = await instance.fetchMemberFromAddress(address);
    return item;
}