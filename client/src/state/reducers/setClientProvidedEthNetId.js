const setClientProvidedEthNetId = (state = false, action) => {
    switch (action.type) {
        case 'SET_CLIENT_PROVIDED_ETH_NET_ID':
            return action.id
        default:
            return state
    }
}

export default setClientProvidedEthNetId;