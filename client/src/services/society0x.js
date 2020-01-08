import contract from 'truffle-contract';
import society0x from '../../../ethereum/build/contracts/Society0x.json';
import society0xFunds from '../../../ethereum/build/contracts/Society0xFunds.json';
import society0xPersona from '../../../ethereum/build/contracts/Society0xPersona.json';
import signal from '../../../ethereum/build/contracts/Signal.json';
import dai from '../../../ethereum/build/contracts/MockDAI.json';
import society0xDonation from '../../../ethereum/build/contracts/Society0xDonation.json';
import { store } from "../state";
import { 
    setMyProfileMetaData,
    setWeb3,
    setClientProvidedEthNetId,
    setFundBalances,
    setFundTimeseries,
    setFundMilestones,
    setFundOverLatestMilestone,
    setSelfSignalBalance,
    setSelfSignalAllowance,
    setSelfDaiBalance,
    setSelfDaiAllowance,
    setInteractionFee,
    setDeploymentTimestamp,
    setSociety0xDonationsTimeseries,
    setSociety0xDonationsBalance,
    setCurrentDonationProgressViaServer,
    setFundWithdrawable,
    setFundForwardableToBeneficiary,
    setDiscoveryIndex,
    setPersonaConnectionsEstablished,
    setPersonaConnectionsOutgoing,
    setPersonaConnectionsIncoming,
} from '../state/actions';
import { 
    DefaultProfileMetaData,
    AcceptedEthNetIds,
    society0xFundEnum,
    society0xFundPledgeEnum,
    society0xDonationMetaDataEnum,
    society0xDonationPledgeEnum,
    SOCIETY0X_API_ENDPOINT
} from '../utils/constants';
import getWeb3 from '../utils/getWeb3';
import { 
    ethToBrowserFormatProfileMetaData,
    weiToEther,
    etherToWei,
    dispatchHideModal,
    dispatchSetModalConfig,
    signalToDai, 
    tokenValueFormatDisplay,
    daiToSignal,
    toNumber,
    areEqualArrays,
    addNumbers,
    subtractNumbers,
    toOnePercent,
} from "../utils";
import moment from "moment";

const Web3Library = require('web3');
const web3 = window.ethereum ? window.ethereum : new Web3Library(new Web3Library.providers.HttpProvider('https://rinkeby.infura.io:443'));

const society0xContract = contract(society0x);
society0xContract.setProvider(web3);

const signalContract = contract(signal);
signalContract.setProvider(web3);

const daiContract = contract(dai);
daiContract.setProvider(web3);

const society0xFundsContract = contract(society0xFunds);
society0xFundsContract.setProvider(web3);

const society0xDonationContract = contract(society0xDonation);
society0xDonationContract.setProvider(web3);

const society0xPersonaContract = contract(society0xPersona);
society0xPersonaContract.setProvider(web3);

const getSociety0xInstance = async () => {
    const instance = await society0xContract.deployed();
    return instance;
}

const getSignalInstance = async () => {
    const instance = await signalContract.deployed();
    return instance;
}

const getDaiInstance = async () => {
    const instance = await daiContract.deployed();
    return instance;
}

const getSociety0xFundsInstance = async () => {
    const instance = await society0xFundsContract.deployed();
    return instance;
}

const getSociety0xDonationInstance = async () => {
    const instance = await society0xDonationContract.deployed();
    return instance;
}

const getSociety0xPersonaInstance = async () => {
    const instance = await society0xPersonaContract.deployed();
    return instance;
}

if(window.ethereum) {
    
    initialiseProfileMetaData();

    window.ethereum.on('accountsChanged', async function (accounts) {
        if(accounts[0]){
            const storeState = store.getState();
            const changedToAccount = accounts[0].toLowerCase();
            await store.dispatch(setMyProfileMetaData(Object.assign(DefaultProfileMetaData, {id: accounts[0]})))
            const {myProfileMetaData} = storeState;
            if(myProfileMetaData && changedToAccount && myProfileMetaData.id && myProfileMetaData.id.toLowerCase() !== changedToAccount){
                window.location.reload();
            }
        }
    })
      
    window.ethereum.on('networkChanged', async function (netId) {
        if(netId){
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            await store.dispatch(setMyProfileMetaData(Object.assign(DefaultProfileMetaData, {id: accounts[0]})));
            if(store.getState().myProfileMetaData.id.toLowerCase() !== accounts[0].toLowerCase()){
                window.location.reload();
            }
        }
    })
}

async function initialiseProfileMetaData() {
    const web3 = await getWeb3();
    await clearLocalStorageIfDeploymentTimestampChanged();
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
            await refreshBalancesAndAllowances();
        }
    });
}

export const registerProfile = async (account, pseudonym) => {
    try{
        dispatchSetModalConfig({
            stage: 'persona_registration_pending',
            substituteValue1: pseudonym,
            substituteValue2: account,
            disableBackdropClick: false,
            show: true,
        });
        const instance = await getSociety0xInstance();
        const item = await instance.registerProfile(pseudonym, {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(error) {
        console.log({error});
        dispatchHideModal();
        return false;
    }
}

export const isEstablishedPersonaConnection = async (account = false, targetAddress = false) => {
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

export const isPendingIncomingPersonaConnection = async (account, targetAddress) => {
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

export const isPendingOutgoingPersonaConnection = async (account, targetAddress) => {
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
    try{
        dispatchSetModalConfig({
            stage: "persona_connection_request_creation",
            disableBackdropClick: false,
            show: true,
        });
        const instance = await getSociety0xInstance();
        await instance.createConnectionRequest(targetAddress, {
            from: account
        });
        await Promise.all([refreshBalancesAndAllowances(), refreshConnectionStatus(account, targetAddress)]);
        dispatchHideModal();
    }catch(error){
        dispatchHideModal();
        console.log({error});
    }
}

export const cancelOutgoingConnectionRequest = async (account, targetAddress) => {
    try{
        dispatchSetModalConfig({
            stage: "persona_connection_request_cancellation",
            disableBackdropClick: false,
            show: true,
        });
        const instance = await getSociety0xInstance();
        await instance.cancelOutgoingConnectionRequest(targetAddress, {
            from: account
        });
        await Promise.all([refreshBalancesAndAllowances(), refreshConnectionStatus(account, targetAddress)]);
        dispatchHideModal();
    }catch(error){
        dispatchHideModal();
        console.log({error});
    }
}

export const acceptConnectionRequest = async (account, targetAddress) => {
    try{
        dispatchSetModalConfig({
            stage: "persona_connection_request_accept",
            disableBackdropClick: false,
            show: true,
        });
        if((account && targetAddress) && (account !== targetAddress)) {
            const instance = await getSociety0xInstance();
            await instance.acceptConnectionRequest(targetAddress, {
                from: account
            });
            await Promise.all([refreshBalancesAndAllowances(), refreshConnectionStatus(account, targetAddress)]);
        }
        dispatchHideModal();
    }catch(error){
        dispatchHideModal();
        console.log({error});
    }
}

export const terminateConnection = async (account, targetAddress) => {
    try{
        dispatchSetModalConfig({
            stage: "persona_connection_request_termination",
            disableBackdropClick: false,
            show: true,
        });
        if((account && targetAddress) && (account !== targetAddress)) {
            const instance = await getSociety0xInstance();
            await instance.terminateConnection(targetAddress, {
                from: account
            });
            await Promise.all([refreshBalancesAndAllowances(), refreshConnectionStatus(account, targetAddress)]);
        }
        dispatchHideModal();
    }catch(error){
        dispatchHideModal();
        console.log({error});
    }
}

export const refreshConnectionStatus = async (account, targetAddress) => {
    let isEstablishedConnection = false;
    let isPendingOutgoingConnection = false;
    let isPendingIncomingConnection = false;
    if(account && targetAddress){
        isEstablishedConnection = await isEstablishedPersonaConnection(account, targetAddress);
        if (!isEstablishedConnection) {
            if (account.toLowerCase() !== targetAddress.toLowerCase()) {
                [isPendingOutgoingConnection, isPendingIncomingConnection] = await Promise.all([
                    isPendingOutgoingPersonaConnection(account, targetAddress),
                    isPendingIncomingPersonaConnection(account, targetAddress)
                ]);
            }
        }
    }

    let reduxState = store.getState();
    let personaConnectionsEstablished = reduxState.personaConnectionsEstablished || [];
    if(!isEstablishedConnection && ((personaConnectionsEstablished.indexOf(targetAddress) > -1) || personaConnectionsEstablished.length === 0)) {
        personaConnectionsEstablished = personaConnectionsEstablished.filter(item => item.toLowerCase() !== targetAddress.toLowerCase());
        store.dispatch(setPersonaConnectionsEstablished(personaConnectionsEstablished));
    }else if(isEstablishedConnection && ((personaConnectionsEstablished.indexOf(targetAddress) === -1) || personaConnectionsEstablished.length === 0)){
        personaConnectionsEstablished.push(targetAddress);
        store.dispatch(setPersonaConnectionsEstablished(personaConnectionsEstablished));
    }
    
    let personaConnectionsOutgoing = reduxState.personaConnectionsOutgoing || [];
    if(!isPendingOutgoingConnection && ((personaConnectionsOutgoing.indexOf(targetAddress) > -1) || personaConnectionsOutgoing.length === 0)) {
        personaConnectionsOutgoing = personaConnectionsOutgoing.filter(item => item.toLowerCase() !== targetAddress.toLowerCase());
        store.dispatch(setPersonaConnectionsOutgoing(personaConnectionsOutgoing));
    }else if(isPendingOutgoingConnection && ((personaConnectionsOutgoing.indexOf(targetAddress) === -1) || personaConnectionsOutgoing.length === 0)) {
        personaConnectionsOutgoing.push(targetAddress);
        store.dispatch(setPersonaConnectionsOutgoing(personaConnectionsOutgoing));
    };

    let personaConnectionsIncoming = reduxState.personaConnectionsIncoming || [];
    if(!isPendingIncomingConnection && ((personaConnectionsIncoming.indexOf(targetAddress) > -1) || personaConnectionsIncoming.length === 0)) {
        personaConnectionsIncoming = personaConnectionsIncoming.filter(item => item.toLowerCase() !== targetAddress.toLowerCase());
        store.dispatch(setPersonaConnectionsIncoming(personaConnectionsIncoming));
    }else if(isPendingIncomingConnection && ((personaConnectionsIncoming.indexOf(targetAddress) === -1) || personaConnectionsIncoming.length === 0)) {
        personaConnectionsIncoming.push(targetAddress);
        store.dispatch(setPersonaConnectionsIncoming(personaConnectionsIncoming));
    };
}

export const getInteractionFee = async () => {
    const instance = await getSociety0xInstance();
    const item = await instance.interactionFee();
    const value = await weiToEther(item);
    return value;
}

export const refreshInteractionFee = async () => {
    const interactionFee = await getInteractionFee();
    await store.dispatch(setInteractionFee(interactionFee));
}

export const getSignalBalance = async (account) => {
    const instance = await getSignalInstance();
    const item = await instance.balanceOf(account);
    const value = await weiToEther(item);
    return value;
}

export const refreshSignalBalance = async () => {
    const account = store.getState().myProfileMetaData.id;
    const signalBalance = await getSignalBalance(account);
    await store.dispatch(setSelfSignalBalance(signalBalance));
}

export const refreshDaiBalance = async () => {
    const account = store.getState().myProfileMetaData.id;
    const daiBalance = await getDaiBalance(account);
    await store.dispatch(setSelfDaiBalance(daiBalance));
}

export const refreshBalancesAndAllowances = async () => {
    return Promise.all([refreshSignalBalance(), refreshSignalAllowance(), refreshDaiBalance(), refreshDaiAllowance(), refreshInteractionFee()])
}

// export const patchDiscoveryIndex = async () => {
    
// }

export const getSignalAllowance = async (account) => {
    const society0xInstance = await getSociety0xInstance();
    const signalInstance = await getSignalInstance();
    const item = await signalInstance.allowance(account, society0xInstance.address);
    const value = await weiToEther(item);
    return value;
}

export const refreshSignalAllowance = async () => {
    const account = store.getState().myProfileMetaData.id;
    const signalAllowance = await getSignalAllowance(account);
    await store.dispatch(setSelfSignalAllowance(signalAllowance));
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

export const refreshDaiAllowance = async () => {
    const account = store.getState().myProfileMetaData.id;
    const daiAllowance = await getDaiAllowance(account);
    await store.dispatch(setSelfDaiAllowance(daiAllowance));
}

export const setSignalAllowance = async (account, etherValue, modalStage = "signal_allowance_pending") => {
    try{
        const society0xInstance = await getSociety0xInstance();
        const signalInstance = await getSignalInstance();
        const weiValue = etherToWei(etherValue);
        dispatchSetModalConfig({
            stage: modalStage,
            disableBackdropClick: false,
            substituteValue1: tokenValueFormatDisplay(etherValue, 2, 'dB'),
            show: true,
        });
        const item = await signalInstance.approve(society0xInstance.address, weiValue, {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(e){
        dispatchHideModal();
    }
}

export const setDaiAllowance = async (account, etherValue, modalStage = "dai_allowance_pending") => {
    try{
        const daiInstance = await getDaiInstance();
        const signalInstance = await getSignalInstance();
        const weiValue = etherToWei(etherValue);
        dispatchSetModalConfig({
            stage: modalStage,
            substituteValue1: tokenValueFormatDisplay(etherValue, 2, 'DAI'),
            substituteValue2: tokenValueFormatDisplay(daiToSignal(etherValue), 2, "dB"),
            show: true,
        });
        const item = await daiInstance.approve(signalInstance.address, weiValue, {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(e) {
        dispatchHideModal();
    }
}

export const setDaiDonationAllowance = async (account, etherValue) => {
    try {
        const daiInstance = await getDaiInstance();
        const society0xDonationInstance = await getSociety0xDonationInstance();
        const weiValue = etherToWei(etherValue);
        dispatchSetModalConfig({
            stage: "dai_donation_allowance_pending",
            disableBackdropClick: false,
            substituteValue1: tokenValueFormatDisplay(etherValue, 2, 'DAI'),
            show: true,
        });
        const item = await daiInstance.approve(society0xDonationInstance.address, weiValue, {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    } catch (e) {
        dispatchHideModal();
    }
}

export const getDaiDonationAllowance = async (account) => {
    const daiInstance = await getDaiInstance();
    const society0xDonationInstance = await getSociety0xDonationInstance();
    const item = await daiInstance.allowance(account, society0xDonationInstance.address, {
        from: account
    });
    return weiToEther(item);
}

export const getTestDai = async (account) => {
    try{
        dispatchSetModalConfig({
            stage: "minting_test_dai",
            substituteValue1: tokenValueFormatDisplay(100, 2, "DAI (testnet)"),
            show: true,
        });
        const daiInstance = await getDaiInstance();
        const item = await daiInstance.mint(account, etherToWei(100), {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(error){
        console.log({error});
        dispatchHideModal();
    }
}

export const withdrawDaiForSignal = async (account, etherValue) => {
    try{
        const signalInstance = await getSignalInstance();
        const weiValue = etherToWei(etherValue);
        dispatchSetModalConfig({
            stage: "exchange_dai_for_signal_pending",
            substituteValue1: tokenValueFormatDisplay(etherValue, 2, "dB"),
            substituteValue2: tokenValueFormatDisplay(signalToDai(etherValue), 2, "DAI"),
            show: true,
        });
        const item = await signalInstance.withdraw(weiValue, {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    } catch (error) {
        console.log({error});
        dispatchHideModal();
    }
}

export const mintSignalForDai = async (account, etherValue) => {
    try{
        const signalInstance = await getSignalInstance();
        let daiValue = signalToDai(etherValue);
        let currentDaiBalance = await getDaiBalance(account);
        let currentDaiAllowance = await getDaiAllowance(account);
        if((currentDaiBalance * 1) < (daiValue * 1)){
            // Not being used yet as exchange input only allows max balance as input
            dispatchSetModalConfig({
                stage: "exchange_insufficient_dai_balance",
                substituteValue1: tokenValueFormatDisplay(daiValue, 2, "DAI"),
                substituteValue2: tokenValueFormatDisplay(currentDaiBalance, 2, "DAI"),
                show: true,
            });
        } else {
            let didSetAllowance = false;
            if((currentDaiAllowance * 1) < (daiValue * 1)) {
                didSetAllowance = await setDaiAllowance(account, daiValue, "exchange_signal_for_dai_pending_allowance");
            }
            if(didSetAllowance || (currentDaiAllowance >= daiValue)) {
                const weiValue = etherToWei(etherValue);
                dispatchSetModalConfig({
                    stage: "exchange_signal_for_dai_pending",
                    substituteValue1: tokenValueFormatDisplay(daiValue, 2, "DAI"),
                    substituteValue2: tokenValueFormatDisplay(daiToSignal(daiValue), 2, "dB"),
                    show: true,
                });
                const item = await signalInstance.mint(weiValue, {
                    from: account
                });
                await refreshBalancesAndAllowances();
                dispatchHideModal();
                return item;
            }
        }
    } catch (e) {
        dispatchHideModal();
    }
}

export const editProfileImage = async (account, profileImageIpfsHash) => {
    try{
        dispatchSetModalConfig({
            stage: "set_persona_profile_picture_pending",
            show: true,
        });
        const instance = await getSociety0xInstance();
        const item = await instance.editProfileImage(profileImageIpfsHash, {
            from: account
        })
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(error){
        console.log({error});
        dispatchHideModal();
        return false;
    }
}

export const editCoverImage = async (account, coverImageIpfsHash) => {
    try{
        dispatchSetModalConfig({
            stage: "set_persona_cover_picture_pending",
            show: true,
        });
        const instance = await getSociety0xInstance();
        const item = await instance.editCoverImage(coverImageIpfsHash, {
            from: account
        })
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(error){
        console.log({error});
        dispatchHideModal();
        return false;
    }
}

export const getProfileFromName = async (profileName) => {
    const instance = await getSociety0xPersonaInstance();
    const doesProfileWithNameExist = await instance.isRegisteredName(profileName);
    if(doesProfileWithNameExist){
        const item = await instance.fetchProfileFromProfileName(profileName);
        return item;
    }
    return false;
}

export const getProfileFromAddress = async (address) => {
    const personaInstance = await getSociety0xPersonaInstance();
    const doesProfileWithAddressExist = await personaInstance.isRegisteredAddress(address);
    if(doesProfileWithAddressExist){
        const item = await personaInstance.fetchProfileFromAddress(address);
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
    const fetchAddressProfile = await isAddress(nameOrAddress);
    const personaInstance = await getSociety0xPersonaInstance();
    if(fetchAddressProfile) {
        const doesProfileWithAddressExist = await personaInstance.isRegisteredAddress(nameOrAddress);
        if(doesProfileWithAddressExist){
            const item = await personaInstance.fetchProfileFromAddress(nameOrAddress);
            return item;
        }
    } else {
        const doesProfileWithNameExist = await personaInstance.isRegisteredName(nameOrAddress);
        if(doesProfileWithNameExist){
            const item = await personaInstance.fetchProfileFromProfileName(nameOrAddress);
            return item;
        }
    }
    return false;
}

export const isRegisteredAddress = async (address) => {
    const personaInstance = await getSociety0xPersonaInstance();
    const doesProfileWithAddressExist = await personaInstance.isRegisteredAddress(address);
    if(doesProfileWithAddressExist){
        return true
    }
    return false;
}

export const getDiscoveryIndex = async () => {
    const instance = await getSociety0xInstance();
    const discoveryIndexLength = await instance.getDiscoveryIndexLength() * 1;
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

export const refreshDiscoveryIndex = async (forceData = false) => {
    let discoveryIndex = forceData;
    if(!forceData){
        discoveryIndex = await getDiscoveryIndex();
    }
    const shouldDiscoveryIndexReduxUpdate = !areEqualArrays(discoveryIndex, store.getState().discoveryIndex);
    if(shouldDiscoveryIndexReduxUpdate) {
        store.dispatch(setDiscoveryIndex(discoveryIndex));
    }
}

export const joinDiscoveryIndex = async (account) => {
    try {
        const instance = await getSociety0xInstance();
        dispatchSetModalConfig({
            stage: `join_discovery_index_pending`,
            disableBackdropClick: false,
            show: true,
        });
        await instance.joinDiscoveryIndex({from: account});
        await Promise.all([refreshDiscoveryIndex(), refreshBalancesAndAllowances()]);
        dispatchHideModal();
        return true;
    }catch(error){
        console.log({error});
        dispatchHideModal();
    }
}

export const leaveDiscoveryIndex = async (account) => {
    try {
        const instance = await getSociety0xInstance();
        dispatchSetModalConfig({
            stage: `leave_discovery_index_pending`,
            disableBackdropClick: false,
            show: true,
        });
        await instance.leaveDiscoveryIndex({from: account});
        await Promise.all([refreshDiscoveryIndex(), refreshBalancesAndAllowances()]);
        dispatchHideModal();
        return true;
    }catch(error){
        console.log({error});
        dispatchHideModal();
    }
}

export const createSociety0xFund = async (account, fundName, urlSlug, initialMilestone, ipfsCoverImageHash) => {
    try {
        const instance = await getSociety0xInstance();
        dispatchSetModalConfig({
            stage: `fund_creation_pending`,
            disableBackdropClick: false,
            show: true,
        });
        const item = await instance.createSociety0xFund(fundName, urlSlug, ipfsCoverImageHash, etherToWei(initialMilestone), {
            from: account
        });
        await refreshBalancesAndAllowances();
        dispatchHideModal();
        return item;
    }catch(error) {
        console.log({error});
        dispatchHideModal();
    }
}

export const getFundListUrlSlugs = async (account) => {
    const instance = await getSociety0xFundsInstance();
    const fundsListLength = await instance.getFundListLength() * 1;
    let fundListUrlSlugs = [];
    for(let i = 0; i < fundsListLength; i++) {
        const urlSlug = await instance.fundIdToUrlSlug.call(i);
        if (urlSlug && urlSlug.length > 0) {
            fundListUrlSlugs.push(urlSlug);
        }
    }
    return fundListUrlSlugs;
}

export const fetchSociety0xDonationMetaData = async () => {
    const instance = await getSociety0xDonationInstance();
    try {
        const society0xDonationMetaData = await instance.getFundMetaData();
        let metaDataObj = {};
        let metaDataEnumKeys = Object.keys(society0xDonationMetaDataEnum);
        for(let index of Object.keys(society0xDonationMetaData)){
            let metaDataKey = metaDataEnumKeys[index];
            let metaDataKeyValue = society0xDonationMetaData[index];
            let metaDataKeyValueType = society0xDonationMetaDataEnum[metaDataKey];
            if(metaDataKeyValueType === "number"){
                metaDataKeyValue = metaDataKeyValue.toString();
            }
            metaDataObj[metaDataKey] = metaDataKeyValue;
        }
        return metaDataObj;
    }catch(e) {
        return false;
    }

}

export const fetchSociety0xFundFromUrlSlug = async (urlSlug) => {
    const instance = await getSociety0xFundsInstance();
    try {
        const fund = await instance.fetchFundFromUrlSlug(urlSlug);
        let fundObj = {};
        let fundEnumKeys = Object.keys(society0xFundEnum);
        for(let index of Object.keys(fund)){
            let fundKey = fundEnumKeys[index];
            let fundKeyValue = fund[index];
            let fundKeyValueType = society0xFundEnum[fundKey];
            if(fundKeyValueType === "number"){
                fundKeyValue = fundKeyValue.toString();
            }
            fundObj[fundKey] = fundKeyValue;
        }
        return fundObj;
    }catch(e) {
        return false;
    }
}

export const fetchSociety0xFundFromFundId = async (fundId) => {
    const instance = await getSociety0xFundsInstance();
    try {
        const fund = await instance.fetchFundFromFundId(fundId);
        let fundObj = {};
        let fundEnumKeys = Object.keys(society0xFundEnum);
        for(let index of Object.keys(fund)){
            let fundKey = fundEnumKeys[index];
            let fundKeyValue = fund[index];
            let fundKeyValueType = society0xFundEnum[fundKey];
            if(fundKeyValueType === "number"){
                fundKeyValue = fundKeyValue.toString();
            }
            fundObj[fundKey] = fundKeyValue;
        }
        return fundObj;
    }catch(e) {
        return false;
    }
}

export const fetchValueForwardableToBeneficiary = async (fundId) => {
    const instance = await getSociety0xFundsInstance();
    try {
        const valueForwardableToBeneficiary = await instance.valueForwardableToBeneficiary(fundId);
        return toNumber(weiToEther(valueForwardableToBeneficiary));
    }catch(e) {
        return false;
    }
}

export const forwardFundsToBeneficiary = async (fundId, valueForwardableToBeneficiary, beneficiaryAddress, account) => {
    const instance = await getSociety0xInstance();
    try {
        dispatchSetModalConfig({
            stage: "forward_funds_to_beneficiary",
            substituteValue1: valueForwardableToBeneficiary,
            substituteValue2: beneficiaryAddress,
            show: true,
        });
        await instance.forwardFundsToBeneficiary(fundId, {
            from: account
        });
        await Promise.all([refreshBalancesAndAllowances(), updateFundIdTimeseries(fundId)]);
        dispatchHideModal();
    }catch(e) {
        dispatchHideModal();
    }
}

export const fetchSociety0xFundMilestones = async (fundId, onlyLastMilestone = false) => {
    const instance = await getSociety0xFundsInstance();
    try{
        const fundMilestones = [];
        const fundMilestoneCount = await instance.fundIdToMilestoneCount(fundId);
        if(onlyLastMilestone){
            const fundMilestone = await instance.fundIdToMilestones(fundId, fundMilestoneCount - 1);
            fundMilestones.push(weiToEther(fundMilestone));
        }else{
            for(let i = 0; i < fundMilestoneCount; i++) {
                const fundMilestone = await instance.fundIdToMilestones(fundId, i);
                fundMilestones.push(weiToEther(fundMilestone));
            }
        }
        return fundMilestones;
    }catch(error){
        console.log({error});
        return false;
    }
}

export const fetchMinimumNewFundMilestone = async (fundId) => {
    const instance = await getSociety0xFundsInstance();
    const fund = await fetchSociety0xFundFromFundId(fundId);
    const fundMilestoneCount = await instance.fundIdToMilestoneCount(fundId);
    const fundMilestone = await instance.fundIdToMilestones(fundId, fundMilestoneCount - 1);
    if(toNumber(weiToEther(fundMilestone)) < fund.signalReceived){
        return toNumber(weiToEther(fund.signalReceived));
    }else{
        return toNumber(weiToEther(fundMilestone))
    }
}

export const fetchSociety0xDonationMilestones = async () => {
    const instance = await getSociety0xDonationInstance();
    try{
        const donationMilestones = [];
        const donationMilestoneCount = await instance.getMilestoneCount();
        for(let i = 0; i < donationMilestoneCount; i++) {
            const donationMilestone = await instance.milestones.call(i);
            donationMilestones.push(weiToEther(donationMilestone));
        }
        return donationMilestones;
    }catch(error){
        console.log({error});
        return false;
    }
}

export const isFundManager = async (fundId, account) => {
    const instance = await getSociety0xFundsInstance();
    try{
        const isFundManagerResult = await instance.isFundManager(account, fundId, {
            from: account
        });
        if(isFundManagerResult){
            return true;
        }else{
            return false;
        }
    }catch(error){
        console.log({error});
        return false;
    }
}

export const isFundOverLatestMilestone = async (fundId) => {
    const instance = await getSociety0xFundsInstance();
    try{
        const isFundOverLatestMilestoneResult = await instance.isFundOverLatestMilestone(fundId);
        if(isFundOverLatestMilestoneResult){
            return true;
        }else{
            return false;
        }
    }catch(error){
        console.log({error});
        return false;
    }
}

export const pledgeSignalToFund = async (fundId, signalValue, account) => {
    try {
        const instance = await getSociety0xInstance();
        let currentSignalBalance = await getSignalBalance(account);
        let currentSignalAllowance = await getSignalAllowance(account);
        currentSignalBalance = currentSignalBalance * 1;
        currentSignalAllowance = currentSignalAllowance * 1;
        signalValue = signalValue * 1;
        if((currentSignalBalance * 1) < (signalValue * 1)){
            dispatchSetModalConfig({
                stage: "insufficient_signal_balance_donation",
                substituteValue1: tokenValueFormatDisplay(signalValue, 2, 'dB'),
                substituteValue2: tokenValueFormatDisplay(currentSignalBalance, 2, 'dB'),
                show: true,
            });
        } else {
            let didSetAllowance = false;
            if(currentSignalAllowance < signalValue) {
                didSetAllowance = await setSignalAllowance(account, signalValue, "signal_donation_allowance_pending");
            }
            if(didSetAllowance || (currentSignalAllowance >= signalValue)) {
                // Check if pledge would push fund over latest milestone, if so, inform patron that donation value will be locked into fund
                let fund = await fetchSociety0xFundFromFundId(fundId);
                let currentSignalBalance = fund.signalReceived;
                let currentLatestMilestone = await fetchSociety0xFundMilestones(fundId, true);
                let resultantBalance = addNumbers(weiToEther(currentSignalBalance), subtractNumbers(signalValue, toOnePercent(signalValue)));
                if(resultantBalance > toNumber(currentLatestMilestone)) {
                    dispatchSetModalConfig({
                        stage: "signal_donation_pending_exceeds_milestone",
                        substituteValue1: tokenValueFormatDisplay(signalValue, 2, 'dB'),
                        substituteValue2: tokenValueFormatDisplay(subtractNumbers(resultantBalance, currentLatestMilestone), 2, 'dB'),
                        show: true,
                    });
                }else{
                    dispatchSetModalConfig({
                        stage: "signal_donation_pending",
                        substituteValue1: tokenValueFormatDisplay(signalValue, 2, 'dB'),
                        show: true,
                    });
                }
                await instance.pledgeSignalToFund(fundId, etherToWei(signalValue), {
                    from: account
                });
                const fundsInstance = await getSociety0xFundsInstance();
                const balanceRaw = await fundsInstance.getFundSignalReceived(fundId, {
                    from: account
                });
                const balance = weiToEther(balanceRaw);
                await store.dispatch(setFundBalances({fundId, balance}));
                await Promise.all([refreshBalancesAndAllowances(), updateFundIdTimeseries(fundId)]);
            }
            dispatchHideModal();
        }
    } catch(e) {
        dispatchHideModal();
    }
}

export const setNewFundMilestone = async (fundId, signalValue, account) => {
    try {
        const instance = await getSociety0xInstance();
        signalValue = toNumber(signalValue);
        dispatchSetModalConfig({
            stage: "fund_milestone_setting_saving",
            substituteValue1: tokenValueFormatDisplay(signalValue, 2, "dB"),
            show: true,
        });
        await instance.setNewMilestone(fundId, etherToWei(signalValue), {
            from: account
        });
        await Promise.all([refreshBalancesAndAllowances(), updateFundIdTimeseries(fundId)]);
        dispatchHideModal();
    } catch(e) {
        dispatchHideModal();
    }
}

export const unpledgeSignalFromFund = async (fundId, signalValue, account) => {
    try {
        const instance = await getSociety0xInstance();
        signalValue = signalValue * 1;
        dispatchSetModalConfig({
            stage: "signal_donation_revoke_pending",
            substituteValue1: fundId,
            substituteValue2: signalValue,
            show: true,
        });
        await instance.unpledgeSignalFromFund(fundId, etherToWei(signalValue), {
            from: account
        });
        const fundsInstance = await getSociety0xFundsInstance();
        const balanceRaw = await fundsInstance.getFundSignalReceived(fundId, {
            from: account
        });
        const balance = weiToEther(balanceRaw);
        await store.dispatch(setFundBalances({fundId, balance}));
        await Promise.all([refreshBalancesAndAllowances(), updateFundIdTimeseries(fundId)]);
        dispatchHideModal();
    } catch(e) {
        dispatchHideModal();
    }
}

export const getPledgerFundsWithdrawable = async (fundId, pledgerAddress) => {
    try{
        const instance = await getSociety0xFundsInstance();
        const fundsWithdrawable = await instance.getPledgerFundsWithdrawable(fundId, pledgerAddress);
        return toNumber(weiToEther(fundsWithdrawable));
    }catch(error){
        console.log({error})
    }
}

export const pledgeDaiToDonation = async (daiValue, pseudonym) => {
    try{
        const account = store.getState().myProfileMetaData.id;
        const society0xDonationInstance = await getSociety0xDonationInstance();
        let currentDaiBalance = await getDaiBalance(account);
        let currentDaiAllowance = await getDaiDonationAllowance(account);
        if(currentDaiBalance * 1 < daiValue){
            dispatchSetModalConfig({
                stage: "insufficient_dai_balance_donation",
                substituteValue1: tokenValueFormatDisplay(daiValue, 2, "DAI"),
                substituteValue2: tokenValueFormatDisplay(currentDaiBalance, 2, "DAI"),
                show: true,
            });
        } else {
            let didSetAllowance = false;
            if(currentDaiAllowance < daiValue) {
                didSetAllowance = await setDaiDonationAllowance(account, daiValue);
            }
            if(didSetAllowance || (currentDaiAllowance >= daiValue)) {
                dispatchSetModalConfig({
                    stage: "dai_donation_pending",
                    substituteValue1: tokenValueFormatDisplay(daiValue, 2, "dB"),
                    show: true,
                });
                await society0xDonationInstance.donate(etherToWei(daiValue), pseudonym, {
                    from: account
                });
                const balanceRaw = await society0xDonationInstance.daiReceived();
                const balance = weiToEther(balanceRaw);
                await store.dispatch(setSociety0xDonationsBalance(balance));
                await Promise.all([refreshBalancesAndAllowances(), updateFundIdTimeseries(false, false, true)])
            }
            dispatchHideModal();
        }
    }catch(e) {
        dispatchHideModal();
    }
}

export const refreshCurrentDonationProgressViaServer = async () => {
    fetch(SOCIETY0X_API_ENDPOINT + '/rinkeby/foundation-milestone-progress')
    .then(res => res.json())
    .then(res => {
        if(res && res.currentMilestoneProgress){
            store.dispatch(setCurrentDonationProgressViaServer(res.currentMilestoneProgress));
        }
    });
}

export const fundPledgeItemSolidityToJavascript = async (pledgeItem, isSociety0xDonationsPledge = false) => {
    let pledgeObject = {};
    let useEnum;
    if(!isSociety0xDonationsPledge) {
        useEnum = society0xFundPledgeEnum;
    }else {
        useEnum = society0xDonationPledgeEnum;
    }
    const indexToPledgeKey = Object.keys(useEnum);
    for(let pledgeItemIndex of Object.keys(pledgeItem)) {
        const key = indexToPledgeKey[pledgeItemIndex];
        const valueType = useEnum[key];
        if(valueType === "number"){
            pledgeObject[key] = pledgeItem[pledgeItemIndex].toString();
        }else{
            pledgeObject[key] = pledgeItem[pledgeItemIndex];
        }
    }
    return pledgeObject;
}

export const getDeploymentTimestamp = async () => {
    const instance = await getSociety0xInstance();
    const item = await instance.deploymentTimestamp();
    return item.toString();
}

export const clearLocalStorageIfDeploymentTimestampChanged = async () => {
    try {
        const currentTimestampOnChain = await getDeploymentTimestamp();
        if(currentTimestampOnChain && store.getState().deploymentTimestamp && store.getState().deploymentTimestamp !== currentTimestampOnChain) {
            localStorage.clear();
            await store.dispatch(setDeploymentTimestamp(currentTimestampOnChain));
            window.location.reload();
        }
    } catch (e) {
        console.log({e})
    }
}

export const updateFundIdMilestones = async (fundId = false, isSocietyDonationsFund = false) => {
    let fundMilestones = [];
    if(!isSocietyDonationsFund){
        fundMilestones = await fetchSociety0xFundMilestones(fundId);
    }else{
        // TODO
    }
    await store.dispatch(setFundMilestones({fundId: fundId, milestones: fundMilestones}));
}

export const updateFundIdTimeseries = async (fundId = false, createdBlockTimestamp = false, isSocietyDonationsFund = false) => {
    const fundsInstance = await getSociety0xFundsInstance();
    const society0xDonationInstance = await getSociety0xDonationInstance();
    let fundPledgeCount;
    if(!isSocietyDonationsFund){
        fundPledgeCount = await fundsInstance.getFundPledgeCount(fundId);
    }else{
        fundPledgeCount = await society0xDonationInstance.getPledgeCount();
    }
    let timeseriesData = [];
    let runningTotal = 0;
    let pledgeValue = 0;
    let pledgerAddress;
    let currentReduxStoreFundTimeseriesCollection = await store.getState().fundTimeseries;
    let currentReduxStoreSociety0xDonationTimeseries = await store.getState().society0xDonationsTimeseries;
    if(!isSocietyDonationsFund && currentReduxStoreFundTimeseriesCollection && currentReduxStoreFundTimeseriesCollection[fundId]) {
        timeseriesData = currentReduxStoreFundTimeseriesCollection[fundId];
    }
    if(isSocietyDonationsFund && currentReduxStoreSociety0xDonationTimeseries) {
        timeseriesData = currentReduxStoreSociety0xDonationTimeseries;
    }
    if(!createdBlockTimestamp && !isSocietyDonationsFund) {
        let fundObj = await fetchSociety0xFundFromFundId(fundId);
        createdBlockTimestamp = fundObj.createdBlockTimestamp;
    }else{
        let fundObj = await fetchSociety0xDonationMetaData();
        createdBlockTimestamp = fundObj.createdBlockTimestamp;
    }
    let reduxState = store.getState();
    if(reduxState.myProfileMetaData.id) {
        let [
            signalValueWithdrawable,
            valueForwardableToBeneficiary,
            isFundOverLatestMilestoneResult,
        ] = await Promise.all([
            getPledgerFundsWithdrawable(fundId, reduxState.myProfileMetaData.id),
            fetchValueForwardableToBeneficiary(fundId),
            isFundOverLatestMilestone(fundId),
        ]);
        await store.dispatch(setFundForwardableToBeneficiary({fundId, valueForwardableToBeneficiary}));
        await store.dispatch(setFundWithdrawable({fundId, signalValueWithdrawable}));
        await store.dispatch(setFundOverLatestMilestone({fundId, isOverLatestMilestone: isFundOverLatestMilestoneResult}));
        await updateFundIdMilestones(fundId);
    }
    if(timeseriesData.length > 0) {
        runningTotal = timeseriesData[timeseriesData.length - 1].yAxisValue;
    }
    //Strip padding records (fund creation moment and current moment)
    if(timeseriesData.length >= 2) {
        if(timeseriesData[timeseriesData.length - 1].yAxisValue === timeseriesData[timeseriesData.length - 2].yAxisValue){
            timeseriesData.pop();
        }
        if(timeseriesData[0].yAxisValue === 0){
            timeseriesData.shift();
        }
    }
    if((fundPledgeCount.toString() * 1) > timeseriesData.length){
        let startIndex = timeseriesData.length;
        for(let i = startIndex; i < fundPledgeCount; i++) {
            let pledgeItemRaw;
            if(!isSocietyDonationsFund) {
                pledgeItemRaw = await fundsInstance.getFundPledgeByPledgeId(fundId, i);
            }else{
                pledgeItemRaw = await society0xDonationInstance.getPledgeByPledgeId(i);
            }
            let pledgeItem = await fundPledgeItemSolidityToJavascript(pledgeItemRaw, isSocietyDonationsFund);
            if(!isSocietyDonationsFund) {
                if(pledgeItem.incoming){
                    runningTotal += weiToEther(pledgeItem.signalValue) * 1;
                }else{
                    runningTotal -= weiToEther(pledgeItem.signalValue) * 1;
                }
                pledgeValue = weiToEther(pledgeItem.signalValue) * 1;
                pledgerAddress = pledgeItem.pledgerAddress;
            }else{
                runningTotal += weiToEther(pledgeItem.daiValue) * 1;
                pledgeValue = weiToEther(pledgeItem.daiValue) * 1;
                pledgerAddress = pledgeItem.pledgerAddress;
            }
            timeseriesData[i] = {
                yAxisValue: runningTotal,
                xAxisValue: moment.unix(pledgeItem.blockTimestamp * 1),
                pledgeValue,
                pledgerAddress,
                incoming: pledgeItem.incoming
            }
            if(timeseriesData.length >= 2){
                if(isSocietyDonationsFund) {
                    await store.dispatch(setSociety0xDonationsTimeseries(timeseriesData));
                }else{
                    await store.dispatch(setFundTimeseries({fundId: fundId, timeseries: timeseriesData}));
                }
            }
        }
    } else if((fundPledgeCount.toString() * 1) < timeseriesData.length){
        timeseriesData = [];
        if(isSocietyDonationsFund) {
            await store.dispatch(setSociety0xDonationsTimeseries(timeseriesData));
        }else{
            await store.dispatch(setFundTimeseries({fundId: fundId, timeseries: timeseriesData}));
        }
        updateFundIdTimeseries(fundId, createdBlockTimestamp, isSocietyDonationsFund);
    }
    if(timeseriesData.length > 0) {
        timeseriesData.unshift({
            yAxisValue: 0,
            xAxisValue: moment.unix(createdBlockTimestamp * 1),
        })
        timeseriesData.push({
            yAxisValue: runningTotal,
            xAxisValue: moment(),
        })
        // Test larger dataset by uncommenting next line
        //timeseriesData = JSON.parse(`[{"yAxisValue":178.32,"xAxisValue":1569870000},{"yAxisValue":177.12,"xAxisValue":1569873600},{"yAxisValue":177.91,"xAxisValue":1569877200},{"yAxisValue":177.84,"xAxisValue":1569880800},{"yAxisValue":181.47,"xAxisValue":1569884400},{"yAxisValue":179.34,"xAxisValue":1569888000},{"yAxisValue":182.03,"xAxisValue":1569891600},{"yAxisValue":184.3,"xAxisValue":1569895200},{"yAxisValue":183.07,"xAxisValue":1569898800},{"yAxisValue":183.19,"xAxisValue":1569902400},{"yAxisValue":182.62,"xAxisValue":1569906000},{"yAxisValue":181.78,"xAxisValue":1569909600},{"yAxisValue":181.49,"xAxisValue":1569913200},{"yAxisValue":180.51,"xAxisValue":1569916800},{"yAxisValue":179.36,"xAxisValue":1569920400},{"yAxisValue":179.38,"xAxisValue":1569924000},{"yAxisValue":180.95,"xAxisValue":1569927600},{"yAxisValue":179.34,"xAxisValue":1569931200},{"yAxisValue":179.97,"xAxisValue":1569934800},{"yAxisValue":178.87,"xAxisValue":1569938400},{"yAxisValue":179.98,"xAxisValue":1569942000},{"yAxisValue":179.74,"xAxisValue":1569945600},{"yAxisValue":175.5,"xAxisValue":1569949200},{"yAxisValue":176.25,"xAxisValue":1569952800},{"yAxisValue":176.64,"xAxisValue":1569956400},{"yAxisValue":177.77,"xAxisValue":1569960000},{"yAxisValue":176.68,"xAxisValue":1569963600},{"yAxisValue":177.27,"xAxisValue":1569967200},{"yAxisValue":176.39,"xAxisValue":1569970800},{"yAxisValue":177.08,"xAxisValue":1569974400},{"yAxisValue":176.9,"xAxisValue":1569978000},{"yAxisValue":176.15,"xAxisValue":1569981600},{"yAxisValue":176.3,"xAxisValue":1569985200},{"yAxisValue":176.09,"xAxisValue":1569988800},{"yAxisValue":174.69,"xAxisValue":1569992400},{"yAxisValue":175.62,"xAxisValue":1569996000},{"yAxisValue":175.49,"xAxisValue":1569999600},{"yAxisValue":176.62,"xAxisValue":1570003200},{"yAxisValue":176.55,"xAxisValue":1570006800},{"yAxisValue":177.31,"xAxisValue":1570010400},{"yAxisValue":177.58,"xAxisValue":1570014000},{"yAxisValue":176.53,"xAxisValue":1570017600},{"yAxisValue":176.8,"xAxisValue":1570021200},{"yAxisValue":176.81,"xAxisValue":1570024800},{"yAxisValue":175.96,"xAxisValue":1570028400},{"yAxisValue":177.25,"xAxisValue":1570032000},{"yAxisValue":177,"xAxisValue":1570035600},{"yAxisValue":176.69,"xAxisValue":1570039200},{"yAxisValue":178.25,"xAxisValue":1570042800},{"yAxisValue":177.36,"xAxisValue":1570046400},{"yAxisValue":178.56,"xAxisValue":1570050000},{"yAxisValue":179.14,"xAxisValue":1570053600},{"yAxisValue":181.06,"xAxisValue":1570057200},{"yAxisValue":180.1,"xAxisValue":1570060800},{"yAxisValue":179.94,"xAxisValue":1570064400},{"yAxisValue":180.3,"xAxisValue":1570068000},{"yAxisValue":179.83,"xAxisValue":1570071600},{"yAxisValue":179.76,"xAxisValue":1570075200},{"yAxisValue":178.53,"xAxisValue":1570078800},{"yAxisValue":178.09,"xAxisValue":1570082400},{"yAxisValue":177.67,"xAxisValue":1570086000},{"yAxisValue":178.35,"xAxisValue":1570089600},{"yAxisValue":178.26,"xAxisValue":1570093200},{"yAxisValue":176.4,"xAxisValue":1570096800},{"yAxisValue":176.75,"xAxisValue":1570100400},{"yAxisValue":176.61,"xAxisValue":1570104000},{"yAxisValue":176.38,"xAxisValue":1570107600},{"yAxisValue":172.68,"xAxisValue":1570111200},{"yAxisValue":172.23,"xAxisValue":1570114800},{"yAxisValue":173.84,"xAxisValue":1570118400},{"yAxisValue":173.3,"xAxisValue":1570122000},{"yAxisValue":172.93,"xAxisValue":1570125600},{"yAxisValue":172.62,"xAxisValue":1570129200},{"yAxisValue":172.97,"xAxisValue":1570132800},{"yAxisValue":174.58,"xAxisValue":1570136400},{"yAxisValue":175.17,"xAxisValue":1570140000},{"yAxisValue":175.17,"xAxisValue":1570143600},{"yAxisValue":173.25,"xAxisValue":1570147200},{"yAxisValue":173.56,"xAxisValue":1570150800},{"yAxisValue":172.91,"xAxisValue":1570154400},{"yAxisValue":173.32,"xAxisValue":1570158000},{"yAxisValue":171.77,"xAxisValue":1570161600},{"yAxisValue":173.36,"xAxisValue":1570165200},{"yAxisValue":173.82,"xAxisValue":1570168800},{"yAxisValue":174.75,"xAxisValue":1570172400},{"yAxisValue":172.98,"xAxisValue":1570176000},{"yAxisValue":174.4,"xAxisValue":1570179600},{"yAxisValue":174.29,"xAxisValue":1570183200},{"yAxisValue":175.2,"xAxisValue":1570186800},{"yAxisValue":174.47,"xAxisValue":1570190400},{"yAxisValue":175.77,"xAxisValue":1570194000},{"yAxisValue":175.92,"xAxisValue":1570197600},{"yAxisValue":175.62,"xAxisValue":1570201200},{"yAxisValue":178.57,"xAxisValue":1570204800},{"yAxisValue":177.62,"xAxisValue":1570208400},{"yAxisValue":177.97,"xAxisValue":1570212000},{"yAxisValue":178.29,"xAxisValue":1570215600},{"yAxisValue":177.57,"xAxisValue":1570219200},{"yAxisValue":177.37,"xAxisValue":1570222800},{"yAxisValue":177.27,"xAxisValue":1570226400},{"yAxisValue":176.21,"xAxisValue":1570230000},{"yAxisValue":175.93,"xAxisValue":1570233600},{"yAxisValue":175.4,"xAxisValue":1570237200},{"yAxisValue":176.16,"xAxisValue":1570240800},{"yAxisValue":176.33,"xAxisValue":1570244400},{"yAxisValue":176.6,"xAxisValue":1570248000},{"yAxisValue":176.24,"xAxisValue":1570251600},{"yAxisValue":176.62,"xAxisValue":1570255200},{"yAxisValue":176.05,"xAxisValue":1570258800},{"yAxisValue":175.22,"xAxisValue":1570262400},{"yAxisValue":174.32,"xAxisValue":1570266000},{"yAxisValue":174.92,"xAxisValue":1570269600},{"yAxisValue":174.87,"xAxisValue":1570273200},{"yAxisValue":173.62,"xAxisValue":1570276800},{"yAxisValue":174.47,"xAxisValue":1570280400},{"yAxisValue":173.71,"xAxisValue":1570284000},{"yAxisValue":176.56,"xAxisValue":1570287600},{"yAxisValue":175.75,"xAxisValue":1570291200},{"yAxisValue":174.62,"xAxisValue":1570294800},{"yAxisValue":174.78,"xAxisValue":1570298400},{"yAxisValue":175.21,"xAxisValue":1570302000},{"yAxisValue":175.44,"xAxisValue":1570305600},{"yAxisValue":176.69,"xAxisValue":1570309200},{"yAxisValue":176.47,"xAxisValue":1570312800},{"yAxisValue":176.9,"xAxisValue":1570316400},{"yAxisValue":176.91,"xAxisValue":1570320000},{"yAxisValue":175.78,"xAxisValue":1570323600},{"yAxisValue":175.77,"xAxisValue":1570327200},{"yAxisValue":175.35,"xAxisValue":1570330800},{"yAxisValue":176.13,"xAxisValue":1570334400},{"yAxisValue":175.97,"xAxisValue":1570338000},{"yAxisValue":174.89,"xAxisValue":1570341600},{"yAxisValue":174.24,"xAxisValue":1570345200},{"yAxisValue":172.8,"xAxisValue":1570348800},{"yAxisValue":173.86,"xAxisValue":1570352400},{"yAxisValue":173.41,"xAxisValue":1570356000},{"yAxisValue":174.35,"xAxisValue":1570359600},{"yAxisValue":174.32,"xAxisValue":1570363200},{"yAxisValue":172.36,"xAxisValue":1570366800},{"yAxisValue":172.48,"xAxisValue":1570370400},{"yAxisValue":174.06,"xAxisValue":1570374000},{"yAxisValue":173.6,"xAxisValue":1570377600},{"yAxisValue":173.14,"xAxisValue":1570381200},{"yAxisValue":168.75,"xAxisValue":1570384800},{"yAxisValue":169.81,"xAxisValue":1570388400},{"yAxisValue":171.19,"xAxisValue":1570392000},{"yAxisValue":171.71,"xAxisValue":1570395600},{"yAxisValue":169.62,"xAxisValue":1570399200},{"yAxisValue":170.26,"xAxisValue":1570402800},{"yAxisValue":170.2,"xAxisValue":1570406400},{"yAxisValue":169.77,"xAxisValue":1570410000},{"yAxisValue":169.65,"xAxisValue":1570413600},{"yAxisValue":172.1,"xAxisValue":1570417200},{"yAxisValue":171.59,"xAxisValue":1570420800},{"yAxisValue":171.51,"xAxisValue":1570424400},{"yAxisValue":171.19,"xAxisValue":1570428000},{"yAxisValue":171.79,"xAxisValue":1570431600},{"yAxisValue":172.74,"xAxisValue":1570435200},{"yAxisValue":174.17,"xAxisValue":1570438800},{"yAxisValue":175.64,"xAxisValue":1570442400},{"yAxisValue":175.31,"xAxisValue":1570446000},{"yAxisValue":177.69,"xAxisValue":1570449600},{"yAxisValue":177.82,"xAxisValue":1570453200},{"yAxisValue":177.32,"xAxisValue":1570456800},{"yAxisValue":178.07,"xAxisValue":1570460400},{"yAxisValue":181.71,"xAxisValue":1570464000},{"yAxisValue":181.91,"xAxisValue":1570467600},{"yAxisValue":180.52,"xAxisValue":1570471200},{"yAxisValue":180.91,"xAxisValue":1570474800},{"yAxisValue":179.44,"xAxisValue":1570478400},{"yAxisValue":179.57,"xAxisValue":1570482000},{"yAxisValue":181.75,"xAxisValue":1570485600},{"yAxisValue":180.49,"xAxisValue":1570489200},{"yAxisValue":181.19,"xAxisValue":1570492800},{"yAxisValue":185.06,"xAxisValue":1570496400},{"yAxisValue":183.47,"xAxisValue":1570500000},{"yAxisValue":182.89,"xAxisValue":1570503600},{"yAxisValue":182.83,"xAxisValue":1570507200},{"yAxisValue":183.06,"xAxisValue":1570510800},{"yAxisValue":182.54,"xAxisValue":1570514400},{"yAxisValue":181.57,"xAxisValue":1570518000},{"yAxisValue":180.87,"xAxisValue":1570521600},{"yAxisValue":181.19,"xAxisValue":1570525200},{"yAxisValue":180.84,"xAxisValue":1570528800},{"yAxisValue":181.13,"xAxisValue":1570532400},{"yAxisValue":181.86,"xAxisValue":1570536000},{"yAxisValue":179.99,"xAxisValue":1570539600},{"yAxisValue":179.58,"xAxisValue":1570543200},{"yAxisValue":179.38,"xAxisValue":1570546800},{"yAxisValue":179.48,"xAxisValue":1570550400},{"yAxisValue":179.68,"xAxisValue":1570554000},{"yAxisValue":179.85,"xAxisValue":1570557600},{"yAxisValue":179.12,"xAxisValue":1570561200},{"yAxisValue":177.82,"xAxisValue":1570564800},{"yAxisValue":179.22,"xAxisValue":1570568400},{"yAxisValue":180.91,"xAxisValue":1570572000},{"yAxisValue":181.09,"xAxisValue":1570575600},{"yAxisValue":181.78,"xAxisValue":1570579200},{"yAxisValue":181,"xAxisValue":1570582800},{"yAxisValue":181.21,"xAxisValue":1570586400},{"yAxisValue":179.95,"xAxisValue":1570590000},{"yAxisValue":180.09,"xAxisValue":1570593600},{"yAxisValue":180.7,"xAxisValue":1570597200},{"yAxisValue":180.92,"xAxisValue":1570600800},{"yAxisValue":181.35,"xAxisValue":1570604400},{"yAxisValue":182.62,"xAxisValue":1570608000},{"yAxisValue":182.89,"xAxisValue":1570611600},{"yAxisValue":184.28,"xAxisValue":1570615200},{"yAxisValue":183.67,"xAxisValue":1570618800},{"yAxisValue":182.37,"xAxisValue":1570622400},{"yAxisValue":188.51,"xAxisValue":1570626000},{"yAxisValue":191.84,"xAxisValue":1570629600},{"yAxisValue":191.12,"xAxisValue":1570633200},{"yAxisValue":192.47,"xAxisValue":1570636800},{"yAxisValue":192.5,"xAxisValue":1570640400},{"yAxisValue":191.33,"xAxisValue":1570644000},{"yAxisValue":192.3,"xAxisValue":1570647600},{"yAxisValue":192.7,"xAxisValue":1570651200},{"yAxisValue":191.31,"xAxisValue":1570654800},{"yAxisValue":193.42,"xAxisValue":1570658400},{"yAxisValue":193.43,"xAxisValue":1570662000},{"yAxisValue":193.43,"xAxisValue":1570665600},{"yAxisValue":193.1,"xAxisValue":1570669200},{"yAxisValue":192.94,"xAxisValue":1570672800},{"yAxisValue":193.6,"xAxisValue":1570676400},{"yAxisValue":193.97,"xAxisValue":1570680000},{"yAxisValue":193.18,"xAxisValue":1570683600},{"yAxisValue":193.61,"xAxisValue":1570687200},{"yAxisValue":192.83,"xAxisValue":1570690800},{"yAxisValue":190.78,"xAxisValue":1570694400},{"yAxisValue":189.72,"xAxisValue":1570698000},{"yAxisValue":189.57,"xAxisValue":1570701600},{"yAxisValue":190.01,"xAxisValue":1570705200},{"yAxisValue":189.68,"xAxisValue":1570708800},{"yAxisValue":191.78,"xAxisValue":1570712400},{"yAxisValue":192.04,"xAxisValue":1570716000},{"yAxisValue":192.61,"xAxisValue":1570719600},{"yAxisValue":192.04,"xAxisValue":1570723200},{"yAxisValue":190.55,"xAxisValue":1570726800},{"yAxisValue":191.53,"xAxisValue":1570730400},{"yAxisValue":192.2,"xAxisValue":1570734000},{"yAxisValue":192.34,"xAxisValue":1570737600},{"yAxisValue":192.39,"xAxisValue":1570741200},{"yAxisValue":192.41,"xAxisValue":1570744800},{"yAxisValue":191.73,"xAxisValue":1570748400},{"yAxisValue":190.56,"xAxisValue":1570752000},{"yAxisValue":191.22,"xAxisValue":1570755600},{"yAxisValue":191.08,"xAxisValue":1570759200},{"yAxisValue":193.19,"xAxisValue":1570762800},{"yAxisValue":196.22,"xAxisValue":1570766400},{"yAxisValue":188.79,"xAxisValue":1570770000},{"yAxisValue":187.64,"xAxisValue":1570773600},{"yAxisValue":186.75,"xAxisValue":1570777200},{"yAxisValue":186.23,"xAxisValue":1570780800},{"yAxisValue":185.76,"xAxisValue":1570784400},{"yAxisValue":186.46,"xAxisValue":1570788000},{"yAxisValue":184.34,"xAxisValue":1570791600},{"yAxisValue":185.41,"xAxisValue":1570795200},{"yAxisValue":186.25,"xAxisValue":1570798800},{"yAxisValue":184.45,"xAxisValue":1570802400},{"yAxisValue":184.91,"xAxisValue":1570806000},{"yAxisValue":182.58,"xAxisValue":1570809600},{"yAxisValue":181.91,"xAxisValue":1570813200},{"yAxisValue":181.44,"xAxisValue":1570816800},{"yAxisValue":182.14,"xAxisValue":1570820400},{"yAxisValue":181.94,"xAxisValue":1570824000},{"yAxisValue":180.96,"xAxisValue":1570827600},{"yAxisValue":181.21,"xAxisValue":1570831200},{"yAxisValue":180.94,"xAxisValue":1570834800},{"yAxisValue":181.95,"xAxisValue":1570838400},{"yAxisValue":183.13,"xAxisValue":1570842000},{"yAxisValue":183.1,"xAxisValue":1570845600},{"yAxisValue":182.99,"xAxisValue":1570849200},{"yAxisValue":183.55,"xAxisValue":1570852800},{"yAxisValue":184.24,"xAxisValue":1570856400},{"yAxisValue":183.99,"xAxisValue":1570860000},{"yAxisValue":184.07,"xAxisValue":1570863600},{"yAxisValue":184.19,"xAxisValue":1570867200},{"yAxisValue":184.01,"xAxisValue":1570870800},{"yAxisValue":183.23,"xAxisValue":1570874400},{"yAxisValue":183.22,"xAxisValue":1570878000},{"yAxisValue":183.82,"xAxisValue":1570881600},{"yAxisValue":183.32,"xAxisValue":1570885200},{"yAxisValue":184.34,"xAxisValue":1570888800},{"yAxisValue":183.77,"xAxisValue":1570892400},{"yAxisValue":183.65,"xAxisValue":1570896000},{"yAxisValue":183.13,"xAxisValue":1570899600},{"yAxisValue":180.81,"xAxisValue":1570903200},{"yAxisValue":179.98,"xAxisValue":1570906800},{"yAxisValue":180.62,"xAxisValue":1570910400},{"yAxisValue":180.79,"xAxisValue":1570914000},{"yAxisValue":180.87,"xAxisValue":1570917600},{"yAxisValue":180.09,"xAxisValue":1570921200},{"yAxisValue":181.03,"xAxisValue":1570924800},{"yAxisValue":182.4,"xAxisValue":1570928400},{"yAxisValue":182.42,"xAxisValue":1570932000},{"yAxisValue":182.27,"xAxisValue":1570935600},{"yAxisValue":181.59,"xAxisValue":1570939200},{"yAxisValue":181.62,"xAxisValue":1570942800},{"yAxisValue":180.98,"xAxisValue":1570946400},{"yAxisValue":181.69,"xAxisValue":1570950000},{"yAxisValue":182.39,"xAxisValue":1570953600},{"yAxisValue":182.21,"xAxisValue":1570957200},{"yAxisValue":182.11,"xAxisValue":1570960800},{"yAxisValue":183,"xAxisValue":1570964400},{"yAxisValue":184.04,"xAxisValue":1570968000},{"yAxisValue":183.99,"xAxisValue":1570971600},{"yAxisValue":183.94,"xAxisValue":1570975200},{"yAxisValue":184.29,"xAxisValue":1570978800},{"yAxisValue":184.04,"xAxisValue":1570982400},{"yAxisValue":183.75,"xAxisValue":1570986000},{"yAxisValue":183.87,"xAxisValue":1570989600},{"yAxisValue":183.49,"xAxisValue":1570993200},{"yAxisValue":181.02,"xAxisValue":1570996800},{"yAxisValue":181.18,"xAxisValue":1571000400},{"yAxisValue":181.85,"xAxisValue":1571004000},{"yAxisValue":181.37,"xAxisValue":1571007600},{"yAxisValue":181.54,"xAxisValue":1571011200},{"yAxisValue":182.44,"xAxisValue":1571014800},{"yAxisValue":182.9,"xAxisValue":1571018400},{"yAxisValue":182.65,"xAxisValue":1571022000},{"yAxisValue":182.69,"xAxisValue":1571025600},{"yAxisValue":183.59,"xAxisValue":1571029200},{"yAxisValue":183.69,"xAxisValue":1571032800},{"yAxisValue":183.03,"xAxisValue":1571036400},{"yAxisValue":183.66,"xAxisValue":1571040000},{"yAxisValue":183.38,"xAxisValue":1571043600},{"yAxisValue":183.41,"xAxisValue":1571047200},{"yAxisValue":183.02,"xAxisValue":1571050800},{"yAxisValue":182.59,"xAxisValue":1571054400},{"yAxisValue":183.65,"xAxisValue":1571058000},{"yAxisValue":182.72,"xAxisValue":1571061600},{"yAxisValue":182.12,"xAxisValue":1571065200},{"yAxisValue":185.76,"xAxisValue":1571068800},{"yAxisValue":186.57,"xAxisValue":1571072400},{"yAxisValue":186.97,"xAxisValue":1571076000},{"yAxisValue":186.18,"xAxisValue":1571079600},{"yAxisValue":187.15,"xAxisValue":1571083200},{"yAxisValue":186.39,"xAxisValue":1571086800},{"yAxisValue":186.48,"xAxisValue":1571090400},{"yAxisValue":186.96,"xAxisValue":1571094000},{"yAxisValue":186.68,"xAxisValue":1571097600},{"yAxisValue":186.38,"xAxisValue":1571101200},{"yAxisValue":186.78,"xAxisValue":1571104800},{"yAxisValue":185.44,"xAxisValue":1571108400},{"yAxisValue":185.27,"xAxisValue":1571112000},{"yAxisValue":185.77,"xAxisValue":1571115600},{"yAxisValue":184.75,"xAxisValue":1571119200},{"yAxisValue":183.79,"xAxisValue":1571122800},{"yAxisValue":183.23,"xAxisValue":1571126400},{"yAxisValue":182.87,"xAxisValue":1571130000},{"yAxisValue":184.15,"xAxisValue":1571133600},{"yAxisValue":184.01,"xAxisValue":1571137200},{"yAxisValue":184.05,"xAxisValue":1571140800},{"yAxisValue":183.9,"xAxisValue":1571144400},{"yAxisValue":182.04,"xAxisValue":1571148000},{"yAxisValue":183.85,"xAxisValue":1571151600},{"yAxisValue":180.37,"xAxisValue":1571155200},{"yAxisValue":179.95,"xAxisValue":1571158800},{"yAxisValue":180.6,"xAxisValue":1571162400},{"yAxisValue":180.28,"xAxisValue":1571166000},{"yAxisValue":178.64,"xAxisValue":1571169600},{"yAxisValue":178.94,"xAxisValue":1571173200},{"yAxisValue":179.62,"xAxisValue":1571176800},{"yAxisValue":180.74,"xAxisValue":1571180400},{"yAxisValue":180.38,"xAxisValue":1571184000},{"yAxisValue":180.26,"xAxisValue":1571187600},{"yAxisValue":179.54,"xAxisValue":1571191200},{"yAxisValue":179.62,"xAxisValue":1571194800},{"yAxisValue":180.03,"xAxisValue":1571198400},{"yAxisValue":180.05,"xAxisValue":1571202000},{"yAxisValue":178.95,"xAxisValue":1571205600},{"yAxisValue":178.84,"xAxisValue":1571209200},{"yAxisValue":179.19,"xAxisValue":1571212800},{"yAxisValue":179.15,"xAxisValue":1571216400},{"yAxisValue":179.24,"xAxisValue":1571220000},{"yAxisValue":176.66,"xAxisValue":1571223600},{"yAxisValue":174.22,"xAxisValue":1571227200},{"yAxisValue":174.48,"xAxisValue":1571230800},{"yAxisValue":173.49,"xAxisValue":1571234400},{"yAxisValue":173.5,"xAxisValue":1571238000},{"yAxisValue":173.93,"xAxisValue":1571241600},{"yAxisValue":174.02,"xAxisValue":1571245200},{"yAxisValue":173.56,"xAxisValue":1571248800},{"yAxisValue":173.64,"xAxisValue":1571252400},{"yAxisValue":174.54,"xAxisValue":1571256000},{"yAxisValue":174.36,"xAxisValue":1571259600},{"yAxisValue":174.94,"xAxisValue":1571263200},{"yAxisValue":174.76,"xAxisValue":1571266800},{"yAxisValue":173.89,"xAxisValue":1571270400},{"yAxisValue":173.95,"xAxisValue":1571274000},{"yAxisValue":174.1,"xAxisValue":1571277600},{"yAxisValue":173.82,"xAxisValue":1571281200},{"yAxisValue":173.01,"xAxisValue":1571284800},{"yAxisValue":174.22,"xAxisValue":1571288400},{"yAxisValue":174.25,"xAxisValue":1571292000},{"yAxisValue":174.59,"xAxisValue":1571295600},{"yAxisValue":176.46,"xAxisValue":1571299200},{"yAxisValue":176.76,"xAxisValue":1571302800},{"yAxisValue":176.83,"xAxisValue":1571306400},{"yAxisValue":176.53,"xAxisValue":1571310000},{"yAxisValue":176.79,"xAxisValue":1571313600},{"yAxisValue":176.89,"xAxisValue":1571317200},{"yAxisValue":177.05,"xAxisValue":1571320800},{"yAxisValue":177.54,"xAxisValue":1571324400},{"yAxisValue":177.83,"xAxisValue":1571328000},{"yAxisValue":177.79,"xAxisValue":1571331600},{"yAxisValue":177.63,"xAxisValue":1571335200},{"yAxisValue":176.86,"xAxisValue":1571338800},{"yAxisValue":176.51,"xAxisValue":1571342400},{"yAxisValue":176.51,"xAxisValue":1571346000},{"yAxisValue":176.64,"xAxisValue":1571349600},{"yAxisValue":177.5,"xAxisValue":1571353200},{"yAxisValue":177.03,"xAxisValue":1571356800},{"yAxisValue":177.24,"xAxisValue":1571360400},{"yAxisValue":176.72,"xAxisValue":1571364000},{"yAxisValue":176.22,"xAxisValue":1571367600},{"yAxisValue":176.19,"xAxisValue":1571371200},{"yAxisValue":174.18,"xAxisValue":1571374800},{"yAxisValue":174.11,"xAxisValue":1571378400},{"yAxisValue":173.23,"xAxisValue":1571382000},{"yAxisValue":170.83,"xAxisValue":1571385600},{"yAxisValue":172,"xAxisValue":1571389200},{"yAxisValue":171.81,"xAxisValue":1571392800},{"yAxisValue":172.35,"xAxisValue":1571396400},{"yAxisValue":171.95,"xAxisValue":1571400000},{"yAxisValue":172.26,"xAxisValue":1571403600},{"yAxisValue":171.82,"xAxisValue":1571407200},{"yAxisValue":172.5,"xAxisValue":1571410800},{"yAxisValue":173.15,"xAxisValue":1571414400},{"yAxisValue":173.41,"xAxisValue":1571418000},{"yAxisValue":173.9,"xAxisValue":1571421600},{"yAxisValue":174.76,"xAxisValue":1571425200},{"yAxisValue":174.35,"xAxisValue":1571428800},{"yAxisValue":173.63,"xAxisValue":1571432400},{"yAxisValue":174.34,"xAxisValue":1571436000},{"yAxisValue":173.29,"xAxisValue":1571439600},{"yAxisValue":172.58,"xAxisValue":1571443200},{"yAxisValue":172.36,"xAxisValue":1571446800},{"yAxisValue":172.79,"xAxisValue":1571450400},{"yAxisValue":174.27,"xAxisValue":1571454000},{"yAxisValue":173.95,"xAxisValue":1571457600},{"yAxisValue":173.85,"xAxisValue":1571461200},{"yAxisValue":173.63,"xAxisValue":1571464800},{"yAxisValue":173.83,"xAxisValue":1571468400},{"yAxisValue":174.67,"xAxisValue":1571472000},{"yAxisValue":173.88,"xAxisValue":1571475600},{"yAxisValue":173.78,"xAxisValue":1571479200},{"yAxisValue":173.83,"xAxisValue":1571482800},{"yAxisValue":174.67,"xAxisValue":1571486400},{"yAxisValue":174.15,"xAxisValue":1571490000},{"yAxisValue":174.23,"xAxisValue":1571493600},{"yAxisValue":173.71,"xAxisValue":1571497200},{"yAxisValue":172.22,"xAxisValue":1571500800},{"yAxisValue":173.27,"xAxisValue":1571504400},{"yAxisValue":172.53,"xAxisValue":1571508000},{"yAxisValue":171.53,"xAxisValue":1571511600},{"yAxisValue":172.02,"xAxisValue":1571515200},{"yAxisValue":172.39,"xAxisValue":1571518800},{"yAxisValue":171.66,"xAxisValue":1571522400},{"yAxisValue":172.37,"xAxisValue":1571526000},{"yAxisValue":171.42,"xAxisValue":1571529600},{"yAxisValue":170.56,"xAxisValue":1571533200},{"yAxisValue":170.24,"xAxisValue":1571536800},{"yAxisValue":170.49,"xAxisValue":1571540400},{"yAxisValue":170.85,"xAxisValue":1571544000},{"yAxisValue":171.06,"xAxisValue":1571547600},{"yAxisValue":171.42,"xAxisValue":1571551200},{"yAxisValue":170.59,"xAxisValue":1571554800},{"yAxisValue":171.39,"xAxisValue":1571558400},{"yAxisValue":172.27,"xAxisValue":1571562000},{"yAxisValue":172.15,"xAxisValue":1571565600},{"yAxisValue":171.63,"xAxisValue":1571569200},{"yAxisValue":172.55,"xAxisValue":1571572800},{"yAxisValue":172.58,"xAxisValue":1571576400},{"yAxisValue":173.82,"xAxisValue":1571580000},{"yAxisValue":173.67,"xAxisValue":1571583600},{"yAxisValue":174.51,"xAxisValue":1571587200},{"yAxisValue":175.69,"xAxisValue":1571590800},{"yAxisValue":175.39,"xAxisValue":1571594400},{"yAxisValue":176.2,"xAxisValue":1571598000},{"yAxisValue":175.25,"xAxisValue":1571601600},{"yAxisValue":175.4,"xAxisValue":1571605200},{"yAxisValue":175.32,"xAxisValue":1571608800},{"yAxisValue":175.84,"xAxisValue":1571612400},{"yAxisValue":175.05,"xAxisValue":1571616000},{"yAxisValue":175.13,"xAxisValue":1571619600},{"yAxisValue":175.66,"xAxisValue":1571623200},{"yAxisValue":175.12,"xAxisValue":1571626800},{"yAxisValue":174.73,"xAxisValue":1571630400},{"yAxisValue":174.64,"xAxisValue":1571634000},{"yAxisValue":174.78,"xAxisValue":1571637600},{"yAxisValue":174.46,"xAxisValue":1571641200},{"yAxisValue":174.54,"xAxisValue":1571644800},{"yAxisValue":174.41,"xAxisValue":1571648400},{"yAxisValue":177.34,"xAxisValue":1571652000},{"yAxisValue":176.8,"xAxisValue":1571655600},{"yAxisValue":176.79,"xAxisValue":1571659200},{"yAxisValue":176.81,"xAxisValue":1571662800},{"yAxisValue":176.86,"xAxisValue":1571666400},{"yAxisValue":173.13,"xAxisValue":1571670000},{"yAxisValue":172.96,"xAxisValue":1571673600},{"yAxisValue":173.84,"xAxisValue":1571677200},{"yAxisValue":173.55,"xAxisValue":1571680800},{"yAxisValue":173.78,"xAxisValue":1571684400},{"yAxisValue":173.89,"xAxisValue":1571688000},{"yAxisValue":174.8,"xAxisValue":1571691600},{"yAxisValue":174.04,"xAxisValue":1571695200},{"yAxisValue":174.64,"xAxisValue":1571698800},{"yAxisValue":174.36,"xAxisValue":1571702400},{"yAxisValue":174.11,"xAxisValue":1571706000},{"yAxisValue":174.79,"xAxisValue":1571709600},{"yAxisValue":175.29,"xAxisValue":1571713200},{"yAxisValue":175.37,"xAxisValue":1571716800},{"yAxisValue":175.03,"xAxisValue":1571720400},{"yAxisValue":174.36,"xAxisValue":1571724000},{"yAxisValue":174.05,"xAxisValue":1571727600},{"yAxisValue":174.73,"xAxisValue":1571731200},{"yAxisValue":174.44,"xAxisValue":1571734800},{"yAxisValue":173.44,"xAxisValue":1571738400},{"yAxisValue":174.41,"xAxisValue":1571742000},{"yAxisValue":173.45,"xAxisValue":1571745600},{"yAxisValue":173.56,"xAxisValue":1571749200},{"yAxisValue":172.73,"xAxisValue":1571752800},{"yAxisValue":173.76,"xAxisValue":1571756400},{"yAxisValue":172.93,"xAxisValue":1571760000},{"yAxisValue":173.37,"xAxisValue":1571763600},{"yAxisValue":173.02,"xAxisValue":1571767200},{"yAxisValue":172.57,"xAxisValue":1571770800},{"yAxisValue":172.72,"xAxisValue":1571774400},{"yAxisValue":172.96,"xAxisValue":1571778000},{"yAxisValue":171.85,"xAxisValue":1571781600},{"yAxisValue":171.64,"xAxisValue":1571785200},{"yAxisValue":171.59,"xAxisValue":1571788800},{"yAxisValue":171.38,"xAxisValue":1571792400},{"yAxisValue":171.43,"xAxisValue":1571796000},{"yAxisValue":166.85,"xAxisValue":1571799600},{"yAxisValue":167.12,"xAxisValue":1571803200},{"yAxisValue":166.97,"xAxisValue":1571806800},{"yAxisValue":166.79,"xAxisValue":1571810400},{"yAxisValue":166.51,"xAxisValue":1571814000},{"yAxisValue":166.92,"xAxisValue":1571817600},{"yAxisValue":167.23,"xAxisValue":1571821200},{"yAxisValue":167.74,"xAxisValue":1571824800},{"yAxisValue":166.71,"xAxisValue":1571828400},{"yAxisValue":160.5,"xAxisValue":1571832000},{"yAxisValue":159.64,"xAxisValue":1571835600},{"yAxisValue":159.12,"xAxisValue":1571839200},{"yAxisValue":158.46,"xAxisValue":1571842800},{"yAxisValue":159.31,"xAxisValue":1571846400},{"yAxisValue":160.35,"xAxisValue":1571850000},{"yAxisValue":160.79,"xAxisValue":1571853600},{"yAxisValue":161.01,"xAxisValue":1571857200},{"yAxisValue":160.6,"xAxisValue":1571860800},{"yAxisValue":159.95,"xAxisValue":1571864400},{"yAxisValue":159.84,"xAxisValue":1571868000},{"yAxisValue":162.72,"xAxisValue":1571871600},{"yAxisValue":161.75,"xAxisValue":1571875200},{"yAxisValue":161.32,"xAxisValue":1571878800},{"yAxisValue":161.44,"xAxisValue":1571882400},{"yAxisValue":160.41,"xAxisValue":1571886000},{"yAxisValue":161.14,"xAxisValue":1571889600},{"yAxisValue":161.1,"xAxisValue":1571893200},{"yAxisValue":159.72,"xAxisValue":1571896800},{"yAxisValue":160.67,"xAxisValue":1571900400},{"yAxisValue":161.48,"xAxisValue":1571904000},{"yAxisValue":161.58,"xAxisValue":1571907600},{"yAxisValue":161.48,"xAxisValue":1571911200},{"yAxisValue":161.5,"xAxisValue":1571914800},{"yAxisValue":162.13,"xAxisValue":1571918400},{"yAxisValue":162.27,"xAxisValue":1571922000},{"yAxisValue":163.35,"xAxisValue":1571925600},{"yAxisValue":162.13,"xAxisValue":1571929200},{"yAxisValue":162.93,"xAxisValue":1571932800},{"yAxisValue":162.36,"xAxisValue":1571936400},{"yAxisValue":161.85,"xAxisValue":1571940000},{"yAxisValue":162.41,"xAxisValue":1571943600},{"yAxisValue":161.41,"xAxisValue":1571947200},{"yAxisValue":160.35,"xAxisValue":1571950800},{"yAxisValue":161.49,"xAxisValue":1571954400},{"yAxisValue":161.07,"xAxisValue":1571958000},{"yAxisValue":161.18,"xAxisValue":1571961600},{"yAxisValue":161.33,"xAxisValue":1571965200},{"yAxisValue":161.98,"xAxisValue":1571968800},{"yAxisValue":162.01,"xAxisValue":1571972400},{"yAxisValue":161.66,"xAxisValue":1571976000},{"yAxisValue":161.75,"xAxisValue":1571979600},{"yAxisValue":161.92,"xAxisValue":1571983200},{"yAxisValue":163.15,"xAxisValue":1571986800},{"yAxisValue":162.5,"xAxisValue":1571990400},{"yAxisValue":162.81,"xAxisValue":1571994000},{"yAxisValue":165.23,"xAxisValue":1571997600},{"yAxisValue":165.82,"xAxisValue":1572001200},{"yAxisValue":166.76,"xAxisValue":1572004800},{"yAxisValue":167.48,"xAxisValue":1572008400},{"yAxisValue":167.26,"xAxisValue":1572012000},{"yAxisValue":176.61,"xAxisValue":1572015600},{"yAxisValue":179.48,"xAxisValue":1572019200},{"yAxisValue":179.69,"xAxisValue":1572022800},{"yAxisValue":181.65,"xAxisValue":1572026400},{"yAxisValue":181.15,"xAxisValue":1572030000},{"yAxisValue":181.14,"xAxisValue":1572033600},{"yAxisValue":180.69,"xAxisValue":1572037200},{"yAxisValue":180.08,"xAxisValue":1572040800},{"yAxisValue":181.79,"xAxisValue":1572044400},{"yAxisValue":187.52,"xAxisValue":1572048000},{"yAxisValue":195.42,"xAxisValue":1572051600},{"yAxisValue":188.45,"xAxisValue":1572055200},{"yAxisValue":186.94,"xAxisValue":1572058800},{"yAxisValue":188.95,"xAxisValue":1572062400},{"yAxisValue":187.58,"xAxisValue":1572066000},{"yAxisValue":187.39,"xAxisValue":1572069600},{"yAxisValue":186.16,"xAxisValue":1572073200},{"yAxisValue":182.52,"xAxisValue":1572076800},{"yAxisValue":180.5,"xAxisValue":1572080400},{"yAxisValue":181.88,"xAxisValue":1572084000},{"yAxisValue":182.07,"xAxisValue":1572087600},{"yAxisValue":181.88,"xAxisValue":1572091200},{"yAxisValue":179.33,"xAxisValue":1572094800},{"yAxisValue":179.62,"xAxisValue":1572098400},{"yAxisValue":181.04,"xAxisValue":1572102000},{"yAxisValue":179.41,"xAxisValue":1572105600},{"yAxisValue":177.41,"xAxisValue":1572109200},{"yAxisValue":177.26,"xAxisValue":1572112800},{"yAxisValue":176.85,"xAxisValue":1572116400},{"yAxisValue":179.28,"xAxisValue":1572120000},{"yAxisValue":178.22,"xAxisValue":1572123600},{"yAxisValue":177.7,"xAxisValue":1572127200},{"yAxisValue":180.16,"xAxisValue":1572130800},{"yAxisValue":180.16,"xAxisValue":1572134400},{"yAxisValue":179.4,"xAxisValue":1572138000},{"yAxisValue":179.64,"xAxisValue":1572141600},{"yAxisValue":178.29,"xAxisValue":1572145200},{"yAxisValue":178.15,"xAxisValue":1572148800},{"yAxisValue":179.86,"xAxisValue":1572152400},{"yAxisValue":180.09,"xAxisValue":1572156000},{"yAxisValue":179.29,"xAxisValue":1572159600},{"yAxisValue":180.91,"xAxisValue":1572163200},{"yAxisValue":181.13,"xAxisValue":1572166800},{"yAxisValue":182.76,"xAxisValue":1572170400},{"yAxisValue":179.62,"xAxisValue":1572174000},{"yAxisValue":180.33,"xAxisValue":1572177600},{"yAxisValue":181.88,"xAxisValue":1572181200},{"yAxisValue":184.89,"xAxisValue":1572184800},{"yAxisValue":184.12,"xAxisValue":1572188400},{"yAxisValue":186.22,"xAxisValue":1572192000},{"yAxisValue":187.12,"xAxisValue":1572195600},{"yAxisValue":188.57,"xAxisValue":1572199200},{"yAxisValue":187.36,"xAxisValue":1572202800},{"yAxisValue":186.64,"xAxisValue":1572206400},{"yAxisValue":185.88,"xAxisValue":1572210000},{"yAxisValue":185.07,"xAxisValue":1572213600},{"yAxisValue":184.34,"xAxisValue":1572217200},{"yAxisValue":187.46,"xAxisValue":1572220800},{"yAxisValue":186.56,"xAxisValue":1572224400},{"yAxisValue":187.45,"xAxisValue":1572228000},{"yAxisValue":185.28,"xAxisValue":1572231600},{"yAxisValue":185.11,"xAxisValue":1572235200},{"yAxisValue":184.35,"xAxisValue":1572238800},{"yAxisValue":183.42,"xAxisValue":1572242400},{"yAxisValue":183.55,"xAxisValue":1572246000},{"yAxisValue":182.39,"xAxisValue":1572249600},{"yAxisValue":183.72,"xAxisValue":1572253200},{"yAxisValue":184.6,"xAxisValue":1572256800},{"yAxisValue":185.35,"xAxisValue":1572260400},{"yAxisValue":183.32,"xAxisValue":1572264000},{"yAxisValue":183.33,"xAxisValue":1572267600},{"yAxisValue":182.24,"xAxisValue":1572271200},{"yAxisValue":183.59,"xAxisValue":1572274800},{"yAxisValue":182.15,"xAxisValue":1572278400},{"yAxisValue":181.13,"xAxisValue":1572282000},{"yAxisValue":182.23,"xAxisValue":1572285600},{"yAxisValue":183.4,"xAxisValue":1572289200},{"yAxisValue":183.93,"xAxisValue":1572292800},{"yAxisValue":184.94,"xAxisValue":1572296400},{"yAxisValue":184.09,"xAxisValue":1572300000},{"yAxisValue":182.09,"xAxisValue":1572303600},{"yAxisValue":183.05,"xAxisValue":1572307200},{"yAxisValue":184.79,"xAxisValue":1572310800},{"yAxisValue":184.26,"xAxisValue":1572314400},{"yAxisValue":184.22,"xAxisValue":1572318000},{"yAxisValue":185.81,"xAxisValue":1572321600},{"yAxisValue":185.66,"xAxisValue":1572325200},{"yAxisValue":185.6,"xAxisValue":1572328800},{"yAxisValue":186.45,"xAxisValue":1572332400},{"yAxisValue":186.27,"xAxisValue":1572336000},{"yAxisValue":185.54,"xAxisValue":1572339600},{"yAxisValue":188.32,"xAxisValue":1572343200},{"yAxisValue":188.12,"xAxisValue":1572346800},{"yAxisValue":187.12,"xAxisValue":1572350400},{"yAxisValue":185.99,"xAxisValue":1572354000},{"yAxisValue":187.03,"xAxisValue":1572357600},{"yAxisValue":186.32,"xAxisValue":1572361200},{"yAxisValue":185.79,"xAxisValue":1572364800},{"yAxisValue":186.65,"xAxisValue":1572368400},{"yAxisValue":187.22,"xAxisValue":1572372000},{"yAxisValue":188,"xAxisValue":1572375600},{"yAxisValue":191.58,"xAxisValue":1572379200},{"yAxisValue":191.02,"xAxisValue":1572382800},{"yAxisValue":192.54,"xAxisValue":1572386400},{"yAxisValue":191.11,"xAxisValue":1572390000},{"yAxisValue":189.77,"xAxisValue":1572393600},{"yAxisValue":191.52,"xAxisValue":1572397200},{"yAxisValue":191.4,"xAxisValue":1572400800},{"yAxisValue":190.03,"xAxisValue":1572404400},{"yAxisValue":187.69,"xAxisValue":1572408000},{"yAxisValue":186.46,"xAxisValue":1572411600},{"yAxisValue":186.5,"xAxisValue":1572415200},{"yAxisValue":185.65,"xAxisValue":1572418800},{"yAxisValue":186.19,"xAxisValue":1572422400},{"yAxisValue":187.23,"xAxisValue":1572426000},{"yAxisValue":183.87,"xAxisValue":1572429600},{"yAxisValue":183.58,"xAxisValue":1572433200},{"yAxisValue":183.57,"xAxisValue":1572436800},{"yAxisValue":181.58,"xAxisValue":1572440400},{"yAxisValue":182.6,"xAxisValue":1572444000},{"yAxisValue":182.49,"xAxisValue":1572447600},{"yAxisValue":181.34,"xAxisValue":1572451200},{"yAxisValue":182.28,"xAxisValue":1572454800},{"yAxisValue":183.48,"xAxisValue":1572458400},{"yAxisValue":183.25,"xAxisValue":1572462000}]`)
        if(!isSocietyDonationsFund) {
            await store.dispatch(setFundTimeseries({fundId: fundId, timeseries: timeseriesData}));
        }else{
            await store.dispatch(setSociety0xDonationsTimeseries(timeseriesData));
        }
    }
}