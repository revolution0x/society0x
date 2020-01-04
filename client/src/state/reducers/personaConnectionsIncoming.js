import { REHYDRATE } from 'redux-persist';

const discoveryIndex = (state = [], action) => {
    switch (action.type) {
        case REHYDRATE:
            if(action.payload && action.payload.personaConnectionsIncoming){
                return action.payload.personaConnectionsIncoming
            }
            return [...state];
        case 'SET_PERSONA_CONNECTIONS_INCOMING':
            return action.personaConnectionsIncoming
        default:
            return state
    }
}

export default discoveryIndex;