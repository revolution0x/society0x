const setFundOverLatestMilestone = (state = {}, action) => {
    switch (action.type) {
        case 'SET_IS_FUND_OVER_LATEST_MILESTONE':
            const { fundId, isOverLatestMilestone = false } = action.isFundOverLatestMilestoneResult;
            if(fundId) {
                state[fundId] = isOverLatestMilestone;
                return {...state};
            }
            return state;
        default:
            return state
    }
}

export default setFundOverLatestMilestone;