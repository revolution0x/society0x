import { REHYDRATE } from 'redux-persist';

const discoveryIndex = (state = [], action) => {
    switch (action.type) {
        case REHYDRATE:
            if(action.payload && action.payload.personaConnectionsEstablished){
                return action.payload.personaConnectionsEstablished
            }
            return [...state];
        case 'SET_PERSONA_CONNECTIONS_ESTABLISHED':
            return action.personaConnectionsEstablished
        default:
            return state
    }
}

export default discoveryIndex;