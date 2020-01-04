import { tokenValueFormat } from "../../utils";

const setSelfDaiAllowance = (state = 0, action) => {
    switch (action.type) {
        case 'SET_SELF_DAI_ALLOWANCE':
            if(action.daiAllowance) {
                return tokenValueFormat(action.daiAllowance);
            }
            return state;
        default:
            return state
    }
}

export default setSelfDaiAllowance;