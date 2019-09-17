import { REHYDRATE } from 'redux-persist';

const discoveryIndex = (state = [], action) => {
    switch (action.type) {
        case REHYDRATE:
            if(action.payload && action.payload.discoveryIndex){
                return action.payload.discoveryIndex
            }
            return [...state];
        case 'SET_DISCOVERY_INDEX':
            return action.discoveryIndex
        default:
            return state
    }
}

export default discoveryIndex;