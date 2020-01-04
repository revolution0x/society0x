import React, {Component} from "react";
import {store} from '../state';
import { setModalConfig } from '../state/actions';
import {
    getInteractionFee,
    getSignalBalance,
    getSignalAllowance
} from "../services/society0x";

const requiresInteractionFee = async(e) => {
    const account = store.getState().myProfileMetaData.id;
    const interactionFee = await getInteractionFee() * 1;
    const signalBalance = await getSignalBalance(account) * 1;
    const signalAllowance = await getSignalAllowance(account) * 1;
    if(signalBalance < interactionFee){
        store.dispatch(setModalConfig({
            stage: "insufficient_signal_balance",
            substituteValue1: interactionFee,
            disableBackdropClick: true,
            show: true,
        }));
    }else if(signalAllowance < interactionFee){
        store.dispatch(setModalConfig({
            stage: "insufficient_signal_allowance",
            substituteValue1: interactionFee,
            disableBackdropClick: true,
            show: true,
        }));
    }
};

export class RequiresInteractionFee extends Component {

    constructor(props) {
        super(props);
        this.state = {
            autoTrigger: props.autoTrigger || false,
        }
    }

    componentDidMount = async() => {
        const {autoTrigger} = this.state;
        if(autoTrigger){
            requiresInteractionFee();
        }
    }

    render(){
        const { children } = this.props;
        return <div onClick={(e) => requiresInteractionFee(e)}>{children}</div>;
    }
};