import { DefaultProfileMetaData } from '../../utils/constants';

const setMyProfileMetaData = (state = DefaultProfileMetaData, action) => {
    switch (action.type) {
        case 'SET_MY_PROFILE_META_DATA':
            const { id, pseudonym, profilePictureIpfsHash, coverPictureIpfsHash, profileMetaIpfsHash, signalReceived, signalGiven, accountMode } = action.profileMetaData;
            if(profileMetaIpfsHash) {
                return {
                    id: id,
                    pseudonym: pseudonym,
                    profilePictureIpfsHash: profilePictureIpfsHash,
                    coverPictureIpfsHash: coverPictureIpfsHash,
                    profileMetaIpfsHash: profileMetaIpfsHash,
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

export default setMyProfileMetaData;