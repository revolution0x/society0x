const setCurrentDonationProgressViaServer = (state = false, action) => {
    switch (action.type) {
        case 'SET_CURRENT_DONATION_PROGRESS_VIA_SERVER':
            if(action.progress) {
                return action.progress;
            }
            return state;
        default:
            return state
    }
}

export default setCurrentDonationProgressViaServer;