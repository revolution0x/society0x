import { tokenValueFormat } from "../../utils";

const setSelfDaiBalance = (state = 0, action) => {
    switch (action.type) {
        case 'SET_SELF_DAI_BALANCE':
            if(action.daiBalance) {
                return tokenValueFormat(action.daiBalance);
            }
            return state;
        default:
            return state
    }
}

export default setSelfDaiBalance;