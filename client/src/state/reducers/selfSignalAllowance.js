import { tokenValueFormat } from "../../utils";

const setSelfSignalAllowance = (state = 0, action) => {
    switch (action.type) {
        case 'SET_SELF_SIGNAL_ALLOWANCE':
            if(action.signalAllowance) {
                return tokenValueFormat(action.signalAllowance);
            }
            return state;
        default:
            return state
    }
}

export default setSelfSignalAllowance;