export const DefaultProfileMetaData = {
    id: false,
    pseudonym: false,
    profilePictureIpfsHash: false,
    coverPictureIpfsHash: false,
    profileMetaIpfsHash: false,
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
    profileMetaIpfsHash: "string",
    signalReceived: "number",
    signalGiven: "number",
    accountMode: "number",
    updatedTimestamp: "number",
    createdTimestamp: "number",
}

export const IPFS_DATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
export const IPFS_PINNING_ENDPOINT = process.env.NODE_ENV === 'development' ? "http://localhost:3001/ipfs/pin" : "https://ipfs.society0x.org/ipfs/pin";