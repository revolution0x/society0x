import { tokenValueFormat } from "../../utils";

const setSelfSignalBalance = (state = 0, action) => {
    switch (action.type) {
        case 'SET_SELF_SIGNAL_BALANCE':
            if(action.signalBalance) {
                return tokenValueFormat(action.signalBalance);
            }
            return state;
        default:
            return state
    }
}

export default setSelfSignalBalance;