const setFundMilestones = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FUND_MILESTONES':
            const { fundId, milestones } = action.fundMilestones;
            if(fundId && milestones) {
                state[fundId] = milestones;
                return {...state};
            }
            return state;
        default:
            return state
    }
}

export default setFundMilestones;