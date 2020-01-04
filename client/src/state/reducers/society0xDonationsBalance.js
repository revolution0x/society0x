const setSociety0xDonationsBalance = (state = false, action) => {
    switch (action.type) {
        case 'SET_SOCIETY0X_DONATIONS_BALANCE':
            const { balance } = action;
            if(balance) {
                return balance;
            }
            return state;
        default:
            return state
    }
}

export default setSociety0xDonationsBalance;