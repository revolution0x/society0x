import React, {Fragment, Component} from "react";
import {Link} from "react-router-dom";
import {store} from '../state';
import {Redirect} from 'react-router-dom';
import {
    getInteractionFee,
    getSignalBalance,
    getSignalAllowance
} from "../services/society0x";

export class RequiresInteractionFee extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount = async() => {
        const account = store.getState().setMyProfileMetaData.id;
        const interactionFee = await getInteractionFee() * 1;
        const signalBalance = await getSignalBalance(account) * 1;
        const signalAllowance = await getSignalAllowance(account) * 1;
        this.setState({
            signalAllowance,
            signalBalance,
            interactionFee,
        })
    }

    render(){
    const { signalAllowance, signalBalance, interactionFee } = this.state;
    const { children } = this.props;
    if((signalAllowance >= interactionFee) && (signalBalance >= interactionFee)){
        return children
    }else if (typeof interactionFee !== "undefined") {
        return (<Redirect to={`/allowance`}/>)
    } else {
        return <div className={`disabled-zone`}>{children}</div>;
    }
    }
};