const setFundWithdrawable = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FUND_WITHDRAWABLE':
            const { fundId, signalValueWithdrawable } = action.fundWithdrawableObj;
            if(fundId && signalValueWithdrawable) {
                state[fundId] = signalValueWithdrawable;
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

export default setFundWithdrawable;