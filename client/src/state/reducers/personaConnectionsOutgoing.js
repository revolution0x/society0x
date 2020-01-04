import { REHYDRATE } from 'redux-persist';

const discoveryIndex = (state = [], action) => {
    switch (action.type) {
        case REHYDRATE:
            if(action.payload && action.payload.personaConnectionsOutgoing){
                return action.payload.personaConnectionsOutgoing
            }
            return [...state];
        case 'SET_PERSONA_CONNECTIONS_OUTGOING':
            return action.personaConnectionsOutgoing
        default:
            return state
    }
}

export default discoveryIndex;