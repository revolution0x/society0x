export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        if(serializedState === null) {
            return {};
        }
        console.log('serializedState',serializedState);
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
}

export const saveState = async (state) => {
    try {
        console.log('state',state);
        if (state) {
            await localStorage.setItem('state', JSON.stringify(state));
        }
    } catch(err) {
        console.log('error saving state to local storage: ', err);
    }
}