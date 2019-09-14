import {combineReducers} from "redux";
import showLeftMenu from "./showLeftMenu";
import setActiveAccount from "./setActiveAccount";
import setWeb3 from "./setWeb3";
import showNavigationWrapper from "./showNavigationWrapper";
import setConsideredMobile from './setConsideredMobile';
import setMyProfileMetaData from './setMyProfileMetaData';
import setClientProvidedEthNetId from './setClientProvidedEthNetId';
import discoveryIndex from './discoveryIndex';
//import otherProfileMetaData from './otherProfileMetaData';

export default combineReducers({
    showLeftMenu,
    setActiveAccount,
    setWeb3,
    showNavigationWrapper,
    setConsideredMobile,
    setClientProvidedEthNetId,
    setMyProfileMetaData,
    discoveryIndex
})