export const DefaultProfileMetaData = {
    id: false,
    pseudonym: false,
    profilePictureIpfsHash: false,
    coverPictureIpfsHash: false,
    profileMetaData: false,
    signalReceived: 0,
    signalGiven: 0,
    accountMode: 0,
    updatedTimestamp: false,
    createdTimestamp: false,
};

export const ProfileMetaDataTypes = {
    id: "string",
    pseudonym: "string",
    profilePictureIpfsHash: "string",
    coverPictureIpfsHash: "string",
    profileMetaData: "string",
    signalReceived: "number",
    signalGiven: "number",
    accountMode: "number",
    updatedTimestamp: "number",
    createdTimestamp: "number",
}

//Keep in same order as Fund struct in Society0xFunds.sol
export const society0xFundEnum = {
    id: "number",
    fundName: "string",
    urlSlug: "string",
    coverPictureIpfsHash: "string",
    recipient: "string",
    fundManager: "string",
    signalReceived: "number",
    signalWithdrawn: "number",
    updatedBlockNumber: "number",
    createdBlockNumber: "number",
    createdBlockTimestamp: "number",
};

//Keep in same order as data returned in getFundMetaData method in Society0xDonation.sol
export const society0xDonationMetaDataEnum = {
    daiReceived: "number",
    createdBlockTimestamp: "number",
    coverPictureIpfsHash: "string",
    beneficiary: "string"
};

//Keep in same order as Pledge struct in Society0xFunds.sol
export const society0xFundPledgeEnum = {
    id: "number",
    pledgerAddress: "string",
    pledgeToMilestone: "number",
    fundId: "number",
    signalValue: "number",
    blockNumber: "number",
    blockTimestamp: "number",
    incoming: "bool"
}

//Keep in same order as Pledge struct in Society0xDonation.sol
export const society0xDonationPledgeEnum = {
    id: "number",
    pledgerAddress: "string",
    pledgeToMilestone: "number",
    daiValue: "number",
    blockNumber: "number",
    blockTimestamp: "number",
}

export const defaultModalConfig = {
    stage: false,
    show: false,
    disableBackdropClick: false,
    substituteValue1: false,
    substituteValue2: false,
}

export const AcceptedEthNetIds = ['rinkeby', 'private']

export const IPFS_DATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
export const IPFS_PINNING_ENDPOINT = process.env.NODE_ENV === 'development' ? "http://localhost:3001/ipfs/pin" : "https://ipfs.society0x.org/ipfs/pin";
export const SOCIETY0X_API_ENDPOINT = process.env.NODE_ENV === 'development' ? "http://localhost:3001" : "https://api.society0x.org";