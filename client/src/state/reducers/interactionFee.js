import { tokenValueFormat } from "../../utils";

const setInteractionFee = (state = false, action) => {
    switch (action.type) {
        case 'SET_INTERACTION_FEE':
            if(action.interactionFee) {
                return tokenValueFormat(action.interactionFee);
            }
            return state;
        default:
            return state
    }
}

export default setInteractionFee;