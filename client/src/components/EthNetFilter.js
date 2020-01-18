import React, {Component} from "react";
import {store} from "../state";
import {Redirect} from 'react-router-dom';

const redirect = (redirect) => {
    let redirectString = "";
    if(window.location.pathname && window.location.pathname.length > 0){
        redirectString = `?redirect=${window.location.pathname}`;
    }
    return (
        <Redirect to={`/network-error/${redirect}${redirectString}`}/>
    )
}

export default class EthNetFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clientProvidedEthNet: store.getState().setClientProvidedEthNetId || false,
        };
        store.subscribe(() => {
            this.setState({
                clientProvidedEthNet: store.getState().setClientProvidedEthNetId,
            });
        });
    }
    render() {
        const { clientProvidedEthNet } = this.state;
        const { requiredNetworks } = this.props;
        let isMetaMask = false;
        if(typeof window.web3 !== "undefined" && window.web3.currentProvider.isMetaMask === true){
            isMetaMask = true;
        }
        if(isMetaMask && !clientProvidedEthNet){
            // Eth Net Needs A Moment
            return null;
        }
        return requiredNetworks.indexOf(clientProvidedEthNet) > -1 ? this.props.children : redirect(requiredNetworks[0]);
    }
}