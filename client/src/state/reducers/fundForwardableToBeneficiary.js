const setFundForwardableToBeneficiary = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FUND_FORWARDABLE_TO_BENEFICIARY':
            const { fundId, valueForwardableToBeneficiary } = action.fundForwardableObj;
            if(fundId && valueForwardableToBeneficiary) {
                state[fundId] = valueForwardableToBeneficiary;
                return {...state};
            } else if(fundId) {
                state[fundId] = 0;
                return {...state}
            }
            return state;
        default:
            return state;
    }
}

export default setFundForwardableToBeneficiary;