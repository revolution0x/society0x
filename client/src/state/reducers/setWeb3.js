const setWeb3 = (state = null, action) => {
    switch (action.type) {
        case 'SET_WEB_3':
            return action.web3
        default:
            return state
    }
}

export default setWeb3;