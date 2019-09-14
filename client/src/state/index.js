import { createStore, compose, applyMiddleware } from 'redux'
import rootReducer from './reducers'
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
//import rootSaga from './sagas'

//const sagaMiddleware = createSagaMiddleware();

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
        //applyMiddleware(sagaMiddleware),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
);

//sagaMiddleware.run(rootSaga);

export const store = storeExport;
export const persistor = persistStore(storeExport);