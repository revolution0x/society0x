const showLeftMenu = (state = false, action) => {
    switch (action.type) {
        case 'SHOW_LEFT_MENU':
            return action.visible
        default:
            return state
    }
}

export default showLeftMenu;