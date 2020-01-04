import { DefaultProfileMetaData } from '../../utils/constants';

const myProfileMetaData = (state = DefaultProfileMetaData, action) => {
    switch (action.type) {
        case 'SET_MY_PROFILE_META_DATA':
            const { id, pseudonym, profilePictureIpfsHash, coverPictureIpfsHash, profileMetaData, signalReceived, signalGiven, accountMode } = action.profileMetaData;
            if(profileMetaData) {
                return {
                    id: id,
                    pseudonym: pseudonym,
                    profilePictureIpfsHash: profilePictureIpfsHash,
                    coverPictureIpfsHash: coverPictureIpfsHash,
                    profileMetaData: profileMetaData,
                    signalReceived: signalReceived,
                    signalGiven: signalGiven,
                    accountMode: accountMode,
                }
            }
            return {
                id: id,
                pseudonym: pseudonym,
                profilePictureIpfsHash: profilePictureIpfsHash,
                coverPictureIpfsHash: coverPictureIpfsHash,
                signalReceived: signalReceived,
                signalGiven: signalGiven,
                accountMode: accountMode
            }
        default:
            return state
    }
}

export default myProfileMetaData;