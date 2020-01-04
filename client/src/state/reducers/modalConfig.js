import { defaultModalConfig } from '../../utils/constants';

const setModalConfig = (state = defaultModalConfig, action) => {
    switch (action.type) {
        case 'SET_MODAL_STAGE':
            if(action.stage) {
                return {
                    ...state, 
                    stage: action.stage
                };
            }
            return state;
        case 'SET_MODAL_CONFIG':
                if(action.config) {
                    // Default disableBackdropClick to false in case it was previously set to true
                    if(!action.config.disableBackdropClick){
                        Object.assign(action.config, {disableBackdropClick: false});
                    }
                    return {
                        ...state,
                        ...action.config
                    };
                }
                return state;
        default:
            return state
    }
}

export default setModalConfig;