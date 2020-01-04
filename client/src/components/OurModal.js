import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import { tokenValueFormatDisplay } from '../utils';
import LoadingIcon from './LoadingIcon';
import OurStepper from './OurStepper';
import SetPledgeRevocation from './SetPledgeRevocation';
import SetNewMilestone from './SetNewMilestone';
import { useSelector } from 'react-redux';
import { store } from '../state';
import { setModalConfig } from '../state/actions';
import { makeStyles } from '@material-ui/core/styles';
import {Link} from "react-router-dom";

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    bodyText: {
        marginBottom: theme.spacing(2),
        textAlign: 'center',
    },
    componentMarginBottom: {
        marginBottom: theme.spacing(1),
    },
    componentMarginTop: {
        marginTop: theme.spacing(1),
    },
    warningText: {
        marginBottom: theme.spacing(4),
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide() {
    const classes = useStyles();
    const show = useSelector(state => state.modalConfig.show);

    const [open, setOpen] = React.useState(show);

    React.useEffect(() => {
        if(show && !open) {
            setOpen(open);
            store.dispatch(setModalConfig({show: open}))
        }
    }, [open])

    const modalStage = useSelector(state => state.modalConfig.stage);
    const disableBackdropClick = useSelector(state => state.modalConfig.disableBackdropClick);
    const substituteValue1 = useSelector(state => state.modalConfig.substituteValue1);
    const substituteValue2 = useSelector(state => state.modalConfig.substituteValue2);
    const daiBalance = useSelector(state => state.selfDaiBalance);
    const signalBalance = useSelector(state => state.selfSignalBalance);
    const signalAllowance = useSelector(state => state.selfSignalAllowance);

    React.useEffect(() => {
        setOpen(show);
    }, [show])

    const handleClose = () => {
        setOpen(false);
    };

    const generateModalPrimaryTitle = (title) => {
        return (
            <Typography variant="h4" style={{textAlign: 'center'}} gutterBottom>
                {title}
            </Typography>
        )
    }

    const generateModalSubTitle = (subtitle) => {
        return (
            <Typography style={{textAlign: 'center', opacity: 0.5}}>
                {subtitle}
            </Typography>
        )
    }

    const generateModalWarningText = (warning) => {
        return (
            <Typography className={classes.warningText} style={{textAlign: 'center'}}>
                {warning}
            </Typography>
        )
    }

    const modalTitle = () => {
        switch(modalStage) {
            case "insufficient_dai_balance_donation":
                return "DAI Balance Too Low For Donation";
            case "set_persona_profile_picture_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Setting Profile Picture`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                );
            case "image_cropper_file_size_exceeded":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`File Size Exceeds ${substituteValue1} Limit`)}
                        {generateModalSubTitle(`Please try to select a smaller portion of the image or use a lower resolution`)}
                    </Fragment>
                );
            case "join_discovery_index_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Joining Discovery Index`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                );
            case "leave_discovery_index_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Leaving Discovery Index`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                );
            case "uploading_persona_profile_picture_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Setting Profile Picture`)}
                    </Fragment>
                );
            case "set_persona_cover_picture_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Setting Cover Picture`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                );
            case "uploading_persona_cover_picture_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Setting Cover Picture`)}
                    </Fragment>
                );
            case "persona_registration_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Persona Registration Pending`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "exchange_signal_for_dai_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Signal To DAI Exchange Pending`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "exchange_dai_for_signal_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`DAI To Signal Exchange Pending`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "exchange_insufficient_dai_balance":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Insufficient DAI Balance`)}
                    </Fragment>
                )
            case "insufficient_signal_allowance":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Insufficient Signal Allowance`)}
                    </Fragment>
                )
            case "insufficient_signal_balance":
            case "insufficient_signal_balance_donation":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Insufficient Signal Balance`)}
                    </Fragment>
                )
            case "signal_allowance_pending":
            case "signal_donation_allowance_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Requesting Set Signal Allowance`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "dai_allowance_pending":
            case "exchange_signal_for_dai_pending_allowance":
            case "dai_donation_allowance_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Exchange Requires DAI Allowance`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "dai_donation_pending":
            case "signal_donation_pending":
            case "signal_donation_pending_exceeds_milestone":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Requesting Signal Donation Confirmation`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "signal_donation_revocation_setting":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Set Signal Withdrawal Value`)}
                    </Fragment>
                )
            case "fund_milestone_setting":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Set New Fund Milestone`)}
                    </Fragment>
                )
            case "fund_milestone_setting_saving":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Saving New Milestone`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "signal_donation_revoke_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Requesting Signal Withdraw Confirmation`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "minting_test_dai":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Minting Test DAI`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "forward_funds_to_beneficiary":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Forward Available Funds To Beneficiary`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "fund_creation_uploading_cover_image":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Creating Decentralised Fund`)}
                    </Fragment>
                )
            case "fund_creation_pending":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Creating Decentralised Fund`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "persona_connection_request_creation":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Request Persona Connection`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "persona_connection_request_accept":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Accept Persona Connection`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "persona_connection_request_termination":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Terminating Persona Connection`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            case "persona_connection_request_cancellation":
                return (
                    <Fragment>
                        {generateModalPrimaryTitle(`Cancelling Persona Connection Request`)}
                        {generateModalSubTitle(`Please Consult MetaMask`)}
                    </Fragment>
                )
            default:
                return <Fragment></Fragment>;
        }
    }

    const modalBody = () => {
        let step;
        let currency;
        let insufficientBalance;
        let balanceType;
        switch(modalStage) {
            case "dai_donation_allowance_pending":
            case "signal_donation_allowance_pending":
            case "uploading_persona_profile_picture_pending":
            case "uploading_persona_cover_picture_pending":
            case "fund_creation_uploading_cover_image":
            case "exchange_signal_for_dai_pending_allowance":
            case "signal_donation_revocation_setting":
            case "fund_milestone_setting":
                step = 0;
                break;
            case "dai_donation_pending":
            case "signal_donation_pending":
            case "signal_donation_pending_exceeds_milestone":
            case "set_persona_profile_picture_pending":
            case "set_persona_cover_picture_pending":
            case "fund_creation_pending":
            case "exchange_signal_for_dai_pending":
            case "signal_donation_revoke_pending":
            case "fund_milestone_setting_saving":
                step = 1;
                break;
            case "insufficient_dai_balance_donation":
                insufficientBalance = daiBalance;
                currency = "DAI";
                break;
            case "insufficient_signal_balance":
            case "insufficient_signal_balance_donation":
                insufficientBalance = signalBalance;
                currency = "dB";
                balanceType = "Balance";
                break;
            case "insufficient_signal_allowance":
                insufficientBalance = signalAllowance;
                currency = "dB";
                balanceType = "Allowance";
                break;
            default:
                break;
        }
        switch(modalStage) {
            case "insufficient_dai_balance_donation":
            case "insufficient_signal_balance_donation":
                return (
                    <Fragment>
                        <Typography gutterBottom>
                            {`Attempted Donation: `}
                            <span style={{float:'right'}}>
                                {`${substituteValue1}`}
                            </span>
                        </Typography>
                        <Typography>
                            {`Current Balance: `}
                            <span style={{float:'right'}}>
                                {`${substituteValue2}`}
                            </span>
                        </Typography>
                    </Fragment>
                )
            case "insufficient_signal_balance":
            case "insufficient_signal_allowance":
                return (
                    <Fragment>
                        <Typography gutterBottom>
                            {`Required ${balanceType}: `}
                            <span style={{float:'right'}}>
                                {`${tokenValueFormatDisplay(substituteValue1, 2, currency)}`}
                            </span>
                        </Typography>
                        <Typography>
                            {`Current ${balanceType}: `}
                            <span style={{float:'right'}}>
                                {`${tokenValueFormatDisplay(insufficientBalance, 2, currency)}`}
                            </span>
                        </Typography>
                    </Fragment>
                )
            case "exchange_insufficient_dai_balance":
                return (
                    <Fragment>
                        <Typography gutterBottom>
                            {`Required Balance: `}
                            <span style={{float:'right'}}>
                                {`${substituteValue1}`}
                            </span>
                        </Typography>
                        <Typography>
                            {`Current Balance: `}
                            <span style={{float:'right'}}>
                                {`${substituteValue2}`}
                            </span>
                        </Typography>
                    </Fragment>
                )
            case "forward_funds_to_beneficiary":
                return (
                    <div style={{width: '100%'}}>
                        <Typography className={classes.bodyText} gutterBottom>
                            {`Transaction Forwards ${tokenValueFormatDisplay(substituteValue1, 2, 'dB')} To Beneficiary With Address "${substituteValue2}"`}
                        </Typography>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "signal_allowance_pending":
            case "dai_allowance_pending":
                return (
                    <div style={{width: '100%'}}>
                        <Typography className={classes.bodyText} gutterBottom>
                            {`Transaction Sets ${substituteValue1} Allowance`}
                        </Typography>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "persona_registration_pending":
                return (
                    <div style={{width: '100%'}}>
                        <Typography className={classes.bodyText} gutterBottom>
                            {`Transaction Registers Pseudonym "${substituteValue1}" For Address "${substituteValue2}"`}
                        </Typography>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "minting_test_dai":
                return (
                    <div style={{width: '100%'}}>
                        <Typography className={classes.bodyText} gutterBottom>
                            {`Transaction Mints ${substituteValue1}`}
                        </Typography>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "exchange_dai_for_signal_pending":
                return (
                    <div style={{width: '100%'}}>
                        <Typography className={classes.bodyText} gutterBottom>
                            {`Transaction Exchanges ${substituteValue1} For ${substituteValue2}`}
                        </Typography>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "join_discovery_index_pending":
            case "leave_discovery_index_pending":
            case "persona_connection_request_creation":
            case "persona_connection_request_termination":
            case "persona_connection_request_accept":
            case "persona_connection_request_cancellation":
                return (
                    <div style={{width: '100%'}}>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "exchange_signal_for_dai_pending":
            case "exchange_signal_for_dai_pending_allowance":
                return (
                    <div style={{width: '100%'}}>
                        <OurStepper steps={[
                            `Set ${substituteValue1} Allowance`,
                            `Mint ${substituteValue2}`
                            ]} step={step}/>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "uploading_persona_profile_picture_pending":
            case "uploading_persona_cover_picture_pending":
            case "set_persona_profile_picture_pending":
            case "set_persona_cover_picture_pending":
                return (
                    <div style={{width: '100%'}}>
                        <OurStepper steps={['Uploading Image To IPFS', 'Setting Record on Ethereum']} step={step}/>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "fund_creation_uploading_cover_image":
            case "fund_creation_pending":
                return (
                    <div style={{width: '100%'}}>
                        <OurStepper steps={['Uploading Image To IPFS', 'Creating Fund on Ethereum']} step={step}/>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "dai_donation_allowance_pending":
            case "dai_donation_pending":
                return (
                    <div style={{width: '100%'}}>
                        <OurStepper steps={[`Set ${substituteValue1} Allowance`, `Send ${substituteValue1} Donation`]} step={step}/>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "signal_donation_pending":
            case "signal_donation_allowance_pending":
                return (
                    <div style={{width: '100%'}}>
                        <OurStepper steps={[`Set ${substituteValue1} Allowance`, `Send ${substituteValue1} Donation`]} step={step}/>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "signal_donation_pending_exceeds_milestone":
                return (
                    <div style={{width: '100%'}}>
                        {generateModalWarningText(`Please note that this donation will cause the latest milestone to be reached, the whole value of this donation will be locked into this fund (including the additional ${substituteValue2} which will extend past the current milestone).`)}
                        <OurStepper steps={[`Set ${substituteValue1} Allowance`, `Send ${substituteValue1} Donation`]} step={step}/>
                        <LoadingIcon></LoadingIcon>
                    </div>
                )
            case "fund_milestone_setting":
            case "fund_milestone_setting_saving":
                let stepTwoText = `Save Milestone`
                if(step === 1){
                    stepTwoText = `Save ${substituteValue1} Milestone`;
                }
                return (
                    <div style={{width: '100%'}}>
                        {step === 0 && 
                            <div className={classes.componentMarginBottom}>
                                <SetNewMilestone input={'SIGNAL'} fundId={substituteValue1}></SetNewMilestone>
                            </div>
                        }
                        <OurStepper steps={[`Select New Milestone`, stepTwoText]} step={step}/>
                        {step === 1 && 
                            <LoadingIcon></LoadingIcon>
                        }
                    </div>
                )
            case "signal_donation_revocation_setting":
            case "signal_donation_revoke_pending":
                let showValue = 'Signal';
                if(substituteValue2 > 0){
                    showValue = tokenValueFormatDisplay(substituteValue2, 2, "dB");
                }
                return (
                    <div style={{width: '100%'}}>
                        {step === 0 && 
                            <div className={classes.componentMarginBottom}>
                                <SetPledgeRevocation input={'SIGNAL'} fundId={substituteValue1}></SetPledgeRevocation>
                            </div>
                        }
                        <OurStepper steps={[`Set Revocation Value`, `Revoke ${showValue} Donation`]} step={step}/>
                        {step === 1 && 
                            <LoadingIcon></LoadingIcon>
                        }
                    </div>
                )
            default:
                return null;
        }
    }

    const dialogButtons = () => {
        switch(modalStage) {
            case "insufficient_dai_balance_donation":
                return (
                    <Fragment>
                        <Button onClick={() => store.dispatch(setModalConfig({show: false}))} style={{color: 'white'}}>
                            Okay
                        </Button>
                        <a href={"https://uniswap.exchange/"} target="_blank" rel="noopener noreferrer" className={["no-decorate", classes.link].join(" ")}>
                            <Button style={{color: 'white'}}>
                                Acquire DAI
                            </Button>
                        </a>
                    </Fragment>
                )
            case "insufficient_signal_allowance":
                return (
                    <Fragment>
                        <Button onClick={() => store.dispatch(setModalConfig({show: false}))} style={{color: 'white'}}>
                            Okay
                        </Button>
                        <Link to={"/allowance"} onClick={() => store.dispatch(setModalConfig({show: false}))} className={"no-decorate"}>
                            <Button style={{color: 'white'}}>
                                Adjust Allowance
                            </Button>
                        </Link>
                    </Fragment>
                )
            case "insufficient_signal_balance":
                return (
                    <Fragment>
                        <Button onClick={() => store.dispatch(setModalConfig({show: false}))} style={{color: 'white'}}>
                            Okay
                        </Button>
                        <Link to={"/exchange"} onClick={() => store.dispatch(setModalConfig({show: false}))} className={"no-decorate"}>
                            <Button style={{color: 'white'}}>
                                Acquire Signal
                            </Button>
                        </Link>
                    </Fragment>
                )
            case "persona_registration_pending":
            case "dai_donation_allowance":
            case "dai_donation_allowance_pending":
            case "dai_allowance_pending":
            case "exchange_signal_for_dai_pending_allowance":
            case "signal_allowance_pending":
            case "set_persona_profile_picture_pending":
            case "minting_test_dai":
            case "fund_creation_uploading_cover_image":
            case "fund_creation_pending":
                return <Fragment></Fragment>;
            default:
                return <Fragment></Fragment>;
        }
    }

    let modalTitleRendered = modalTitle();
    let modalBodyRendered = modalBody();
    let dialogButtonsRendered = dialogButtons();

    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                disableBackdropClick={disableBackdropClick}
            >
                {modalTitleRendered && 
                    <DialogTitle className={classes.componentMarginTop} id="alert-dialog-slide-title">
                        {modalTitleRendered}
                    </DialogTitle>
                }
                {modalBodyRendered && 
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            {modalBodyRendered}
                        </DialogContentText>
                    </DialogContent>
                }
                {dialogButtonsRendered && 
                    <DialogActions>
                        {dialogButtonsRendered}
                    </DialogActions>
                }
            </Dialog>
        </div>
    );
}