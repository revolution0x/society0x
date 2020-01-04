import React, {Component} from "react";
import {store} from "../state";
import {Redirect} from 'react-router-dom';

const redirect = (redirect) => (
    <Redirect to={'/network-error/' + redirect}/>
)

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
        return((!clientProvidedEthNet || requiredNetworks.indexOf(clientProvidedEthNet) > -1) ? this.props.children : redirect(requiredNetworks[0]))
    }
}