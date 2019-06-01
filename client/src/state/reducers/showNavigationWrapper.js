const showNavigationWrapper = (state = true, action) => {
    switch (action.type) {
        case 'SHOW_NAVIGATION_WRAPPER':
            return action.show
        default:
            return state
    }
}

export default showNavigationWrapper;