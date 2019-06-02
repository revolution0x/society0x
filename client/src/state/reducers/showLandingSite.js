const showLandingSite = (state = true, action) => {
    switch (action.type) {
        case 'SHOW_LANDING_SITE':
            return action.show
        default:
            return state
    }
}

export default showLandingSite;