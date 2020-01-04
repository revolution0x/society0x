const setFundBalances = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FUND_BALANCES':
            const { fundId, balance } = action.fundBalance;
            if(fundId && balance) {
                state[fundId] = balance;
                return {...state};
            }
            return state;
        default:
            return state;
    }
}

export default setFundBalances;