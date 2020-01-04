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

export const setFundBalances = (fundBalance) => ({
    type: "SET_FUND_BALANCES",
    fundBalance
})

export const setFundTimeseries = (fundTimeseries) => ({
    type: "SET_FUND_TIMESERIES",
    fundTimeseries
})

export const setFundMilestones = (fundMilestones) => ({
    type: "SET_FUND_MILESTONES",
    fundMilestones
})

export const setFundOverLatestMilestone = (isFundOverLatestMilestoneResult) => ({
    type: "SET_IS_FUND_OVER_LATEST_MILESTONE",
    isFundOverLatestMilestoneResult
})

export const setSelfSignalBalance = (signalBalance) => ({
    type: "SET_SELF_SIGNAL_BALANCE",
    signalBalance
})

export const setSelfSignalAllowance = (signalAllowance) => ({
    type: "SET_SELF_SIGNAL_ALLOWANCE",
    signalAllowance
})

export const setSelfDaiBalance = (daiBalance) => ({
    type: "SET_SELF_DAI_BALANCE",
    daiBalance
})


export const setSelfDaiAllowance = (daiAllowance) => ({
    type: "SET_SELF_DAI_ALLOWANCE",
    daiAllowance
})

export const setInteractionFee = (interactionFee) => ({
    type: "SET_INTERACTION_FEE",
    interactionFee
})

export const setDeploymentTimestamp = (timestamp) => ({
    type: "SET_DEPLOYMENT_TIMESTAMP",
    timestamp
})

export const setSociety0xDonationsBalance = (balance) => ({
    type: "SET_SOCIETY0X_DONATIONS_BALANCE",
    balance
})

export const setSociety0xDonationsTimeseries = (timeseries) => ({
    type: "SET_SOCIETY0X_DONATIONS_TIMESERIES",
    timeseries
})

export const setModalStage = (stage) => ({
    type: "SET_MODAL_STAGE",
    stage
})

export const setModalConfig = (config) => {
    return {
        type: "SET_MODAL_CONFIG",
        config
    }
}

export const setCurrentDonationProgressViaServer = (progress) => {
    return {
        type: "SET_CURRENT_DONATION_PROGRESS_VIA_SERVER",
        progress
    }
}

export const setFundWithdrawable = (fundWithdrawableObj) => {
    return {
        type: "SET_FUND_WITHDRAWABLE",
        fundWithdrawableObj
    }
}

export const setFundForwardableToBeneficiary = (fundForwardableObj) => {
    return {
        type: "SET_FUND_FORWARDABLE_TO_BENEFICIARY",
        fundForwardableObj
    }
}

export const setPersonaConnectionsEstablished = (personaConnectionsEstablished) => {
    return {
        type: "SET_PERSONA_CONNECTIONS_ESTABLISHED",
        personaConnectionsEstablished
    }
}

export const setPersonaConnectionsIncoming = (personaConnectionsIncoming) => {
    return {
        type: "SET_PERSONA_CONNECTIONS_INCOMING",
        personaConnectionsIncoming
    }
}

export const setPersonaConnectionsOutgoing = (personaConnectionsOutgoing) => {
    return {
        type: "SET_PERSONA_CONNECTIONS_OUTGOING",
        personaConnectionsOutgoing
    }
}