const setActiveAccount = (state = {
    address: false,
    memberName: false,
    profilePicIpfsHash: false,
    coverPicIpfsHash: false,
}, action) => {
    switch (action.type) {
        case 'SET_ACTIVE_ACCOUNT':
            return {
                address: action.account.address,
                memberName: action.account.memberName,
                profilePicIpfsHash: action.account.profilePicIpfsHash,
                coverPicIpfsHash: action.account.coverPicIpfsHash,
            }
        default:
            return state
    }
}

export default setActiveAccount;