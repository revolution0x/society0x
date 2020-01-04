const setDeploymentTimestamp = (state = false, action) => {
    switch (action.type) {
        case 'SET_DEPLOYMENT_TIMESTAMP':
            if(action.timestamp) {
                return action.timestamp;
            }
            return state;
        default:
            return state
    }
}

export default setDeploymentTimestamp;