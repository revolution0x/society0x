

import { createBrowserHistory, createHashHistory } from 'history';
import { DefaultProfileMetaData, ProfileMetaDataTypes } from './constants';

export function configureHistory() {
    return window.matchMedia('(display-mode: standalone)').matches
        ? createHashHistory()
        : createBrowserHistory()
}

export function ethToBrowserFormatProfileMetaData(profile) {
    const ProfileKeys = Object.keys(profile);
    const DefaultProfileMetaDataKeys = Object.keys(DefaultProfileMetaData);
    let result = false;
    if(profile && validateProfileMetaDataEthFormat(profile)){
        result = {}
        for(let i = 0; i < ProfileKeys.length; i++) {
            if((typeof profile[i] === "object") && (ProfileMetaDataTypes[DefaultProfileMetaDataKeys[i]] === "number")) {
                result[DefaultProfileMetaDataKeys[i]] = parseInt(profile[i].toString());
            }else {
                result[DefaultProfileMetaDataKeys[i]] = profile[i];
            }
        }
    }
    return result;
}

export function validateProfileMetaDataEthFormat(profile) {
    const DefaultProfileMetaDataKeys = Object.keys(DefaultProfileMetaData);
    const ProfileKeys = Object.keys(profile);
    if(ProfileKeys && (ProfileKeys.constructor === Array) && (ProfileKeys.length === DefaultProfileMetaDataKeys.length)) {
        let result;
        let i;
        for(i = 0; i < ProfileKeys.length; i++) {
            if((typeof profile[i] === "object") && (ProfileMetaDataTypes[DefaultProfileMetaDataKeys[i]] === "number")) {
                if(((result === true) || (result === undefined)) && (typeof parseInt(profile[i].toString()) === ProfileMetaDataTypes[DefaultProfileMetaDataKeys[i]])) {
                    result = true;
                }else{
                    console.warn(`validateProfileMetaDataEthFormat fails on profile prop: ${profile[i]} - Expected ${ProfileMetaDataTypes[DefaultProfileMetaDataKeys[i]]}, got ${typeof parseInt(profile[i].toString())}`)
                    result = false;
                }
            }else if(((result === true) || (result === undefined)) && (typeof profile[i] === ProfileMetaDataTypes[DefaultProfileMetaDataKeys[i]])) {
                result = true;
            }else{
                console.warn(`validateProfileMetaDataEthFormat fails on profile prop: ${profile[i]} - Expected ${ProfileMetaDataTypes[DefaultProfileMetaDataKeys[i]]}, got ${typeof profile[i]}`)
                result = false;
            }
        }
        if(i === ProfileKeys.length){
            return result;
        }
    }
    console.warn("validateProfileMetaDataEthFormat failed on profile:", profile);
    return false;
}

export const debounce = (func, wait, immediate) => {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if ( !immediate ) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 200);
        if ( callNow ) { 
            func.apply(context, args);
        }
    };
};

export const capitaliseFirstLetter = (string) => {
    if(string && string.length > 0) {
        return string.slice(0,1).toUpperCase() + string.slice(1, string.length);
    }
}