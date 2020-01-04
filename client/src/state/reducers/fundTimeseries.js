const setFundTimeseries = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FUND_TIMESERIES':
            const { fundId, timeseries } = action.fundTimeseries;
            if(fundId && timeseries) {
                state[fundId] = timeseries;
                return {...state};
            }
            return state;
        default:
            return state
    }
}

export default setFundTimeseries;