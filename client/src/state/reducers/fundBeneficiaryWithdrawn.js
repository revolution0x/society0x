const setFundBeneficiaryWithdrawn = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FUND_BENEFICIARY_WITHDRAWN':
            const { fundId, signalWithdrawn } = action.signalWithdrawalObj;
            if(fundId && signalWithdrawn) {
                state[fundId] = signalWithdrawn;
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

export default setFundBeneficiaryWithdrawn;