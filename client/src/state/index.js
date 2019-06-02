import { createStore, compose } from 'redux'
import rootReducer from './reducers'
import {loadState, saveState} from './localStorage'
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage: storage,
    blacklist: ['setWeb3', 'setActiveAccount', 'showLeftMenu'],
    stateReconciler: autoMergeLevel2
};

const pReducer = persistReducer(persistConfig, rootReducer);

const storeExport = createStore(
    pReducer,
    compose(
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
);

export const store = storeExport;
export const persistor = persistStore(storeExport);