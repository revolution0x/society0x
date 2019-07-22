const setConsideredMobile = (state = false, action) => {
    switch (action.type) {
        case 'SET_CONSIDERED_MOBILE':
            return action.isConsideredMobile
        default:
            return state
    }
}

export default setConsideredMobile;