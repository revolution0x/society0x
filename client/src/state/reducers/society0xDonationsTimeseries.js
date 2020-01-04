const setSociety0xDonationsTimeseries = (state = [], action) => {
    switch (action.type) {
        case 'SET_SOCIETY0X_DONATIONS_TIMESERIES':
            if(action.timeseries) {
                return [...action.timeseries];
            }
            return state
        default:
            return state
    }
}

export default setSociety0xDonationsTimeseries;