export const showLeftMenu = visible => ({
    type: "SHOW_LEFT_MENU",
    visible
})

export const setActiveAccount = account => ({
    type: "SET_ACTIVE_ACCOUNT",
    account
})

export const setWeb3 = web3 => ({
    type: "SET_WEB_3",
    web3
})

export const showNavigationWrapper = show => ({
    type: "SHOW_NAVIGATION_WRAPPER",
    show
})

export const setConsideredMobile = isConsideredMobile => ({
    type: "SET_CONSIDERED_MOBILE",
    isConsideredMobile
})

export const setMyProfileMetaData = profileMetaData => ({
    type: "SET_MY_PROFILE_META_DATA",
    profileMetaData
})

export const setClientProvidedEthNetId = id => ({
    type: "SET_CLIENT_PROVIDED_ETH_NET_ID",
    id
})

export const clearMyProfileMetaData = () => ({
    type: "CLEAR_MY_PROFILE_META_DATA",
})

export const setDiscoveryIndex = (discoveryIndex) => ({
    type: "SET_DISCOVERY_INDEX",
    discoveryIndex
})