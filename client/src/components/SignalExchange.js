import React, {Component, Fragment} from 'react';
import { Form } from 'formik';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import {
    withdrawDaiForSignal,
    mintSignalForDai,
    refreshBalancesAndAllowances
} from "../services/society0x";
import {store} from '../state';
import {Redirect} from 'react-router-dom';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import AllowanceIcon from '@material-ui/icons/SignalCellularAlt';
import {Link} from 'react-router-dom';
import {
    daiToSignal,
    signalToDaiWei,
    tokenValueFormat,
    tokenValueFormatDisplay,
    toNumber
} from '../utils';

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    inputMargin: {
        marginBottom: theme.spacing(2),
    },
    signalValue: {
        marginLeft: theme.spacing(4),
        float: 'right',
    },
    contentContainer:{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    LottieRender: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    form: {
        minWidth: '350px',
    }
});

class SignalExchange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            setExchangeValue: tokenValueFormat(0),
            interactionFee: "Loading...",
            signalBalance: store.getState().signalBalance || "Loading...",
            signalAllowance: store.getState().signalAllowance || "Loading...",
            daiBalance: store.getState().daiBalance || "Loading...",
            daiAllowance: store.getState().daiAllowance || "Loading...",
            helperTextEnum: false,
            initiatedValues: false,
            isInteractionReady: false,
        }
        store.subscribe(() => {
            const storeState = store.getState();
            const storeInteractionFee = storeState.interactionFee;
            const storeSignalBalance = storeState.selfSignalBalance;
            const storeSignalAllowance = storeState.selfSignalAllowance;
            const storeDaiBalance = storeState.selfDaiBalance;
            const storeDaiAllowance = storeState.selfDaiAllowance;
            if (storeInteractionFee && (storeInteractionFee !== this.state.interactionFee)) {
                this.setState({
                    interactionFee: storeInteractionFee
                })
            }
            if (
                (storeSignalBalance && storeSignalBalance !== this.state.signalBalance) ||
                (storeSignalAllowance && storeSignalAllowance !== this.state.signalAllowance) ||
                (storeDaiBalance && storeDaiBalance !== this.state.daiBalance) ||
                (storeDaiAllowance && storeDaiAllowance !== this.state.daiAllowance) 
                ){
                this.setState({
                    signalBalance: storeSignalBalance,
                    signalAllowance: storeSignalAllowance,
                    daiBalance: toNumber(storeDaiBalance),
                    daiAllowance: storeDaiAllowance,
                })
            }

        });
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.triggerExchange = this.triggerExchange.bind(this);
        this.getSliderMaxValue = this.getSliderMaxValue.bind(this);
        this.getExchangeButtonText = this.getExchangeButtonText.bind(this);
    }

    handleSliderChange = (event, newValue) => {
        this.setState({setExchangeValue: toNumber(tokenValueFormat(newValue))})
    };
    
    handleInputChange = event => {
        this.setState({setExchangeValue: event.target.value === '' ? '' : Number(event.target.value)})
    };
    
    handleBlur = () => {
        const {input} = this.props;
        const {setExchangeValue, daiBalance, signalBalance} = this.state;
        if (setExchangeValue < 0) {
            this.setState({setExchangeValue: 0});
        } else if (input === "DAI" && setExchangeValue >= daiBalance) {
            this.setState({setExchangeValue: tokenValueFormat(daiBalance)});
        } else if (input === "SIGNAL" && setExchangeValue >= signalBalance) {
            this.setState({setExchangeValue: tokenValueFormat(signalBalance)});
        }
    };

    setRedirect(redirect) {
        this.setState({redirect});
    }

    triggerExchange = async () => {
        const {setExchangeValue} = this.state;
        const {input} = this.props;
        const account = store.getState().myProfileMetaData.id;
        try{
            switch(input){
                case 'SIGNAL':
                    await withdrawDaiForSignal(account, setExchangeValue);
                    this.setState({
                        setExchangeValue: 0,
                    });
                    break;
                case 'DAI':
                    const signalValue = daiToSignal(setExchangeValue);
                    let mintTransaction = await mintSignalForDai(account, signalValue);
                    if(mintTransaction){
                        this.setState({
                            setExchangeValue: 0,
                            helperTextEnum: "dai_to_signal_exchanged"
                        });
                    }
                    break;
                default:
                    return null;
            }
        }catch(e){
            let firstErrorLine = e.message.split("\n")[0]
            let scanString = "Reason given: ";
            let indexOfScanString = firstErrorLine.indexOf(scanString);
            if(indexOfScanString > -1){
                let reasonGiven = firstErrorLine.substr(indexOfScanString + scanString.length);
                console.log({reasonGiven});
            }
        }
    }

    componentDidMount = async () => {
        const account = store.getState().myProfileMetaData.id;
        await refreshBalancesAndAllowances(account);
        this.setState({
            setExchangeValue: 0,
            initiatedValues: true,
            isInteractionReady: true,
        })
    }

    getExchangeButtonText = () => {
        const {input} = this.props;
        switch(input) {
            case "DAI":
                return "Convert DAI into Signal";
            case "SIGNAL":
                return "Convert Signal into DAI";
            default:
                return "";
        }
    }

    getExchangeOutput = ({classes, input, setExchangeValue}) => {
        switch(input){
            case "SIGNAL":
                return (
                    <Fragment>
                        <Typography className={setExchangeValue > 0 ? null : "disabled-zone"} align="left" variant="h6" component="h2" gutterBottom>
                                Exchange Result: <span className={classes.signalValue}>{tokenValueFormatDisplay(signalToDaiWei(setExchangeValue), 2, "DAI")}</span>
                        </Typography>
                    </Fragment>
                )
            case "DAI":
                return (
                    <Fragment>
                        <Typography className={setExchangeValue > 0 ? null : "disabled-zone"} align="left" variant="h6" component="h2" gutterBottom>
                                Exchange Result: <span className={classes.signalValue}>{tokenValueFormatDisplay(daiToSignal(setExchangeValue), 2, "dB")}</span>
                        </Typography>
                    </Fragment>
                )
            default:
                return null;
        }
    }

    getSliderMaxValue = () => {
        const {input} = this.props;
        const {signalBalance, daiBalance} = this.state;
        switch(input) {
            case "DAI":
                return tokenValueFormat(daiBalance);
            case "SIGNAL":
                return tokenValueFormat(signalBalance);
            default:
                return tokenValueFormat(0);
        }
    }

    validateExchangeSlider = () => {
        const {input} = this.props;
        const {signalBalance, daiBalance, initiatedValues} = this.state;
        let setStateConfig = {
            helperTextEnum: false,
        }
        if(initiatedValues) {
            switch(input) {
                case "DAI": {
                    if(daiBalance * 1 === 0) {
                        setStateConfig.helperTextEnum = "dai_balance_zero";
                    }
                    break;
                }
                case "SIGNAL": {
                    if(signalBalance * 1 === 0) {
                        setStateConfig.helperTextEnum = "signal_balance_zero";
                    }
                    break;
                }
                default:
                    return null;
            }
        }
        this.setState(setStateConfig);
    }

    getSymbol = (input) => {
        switch(input) {
            case "DAI":
                return "DAI"
            case "SIGNAL":
                return "dB"
            default:
                return ""
        }
    }

    getHelperText = (helperTextEnum) => {
        switch(helperTextEnum){
            case "dai_allowance_zero":
                return (
                    <Typography align="center" variant="body1" component="p" gutterBottom>
                        DAI Allowance Is Zero | <Link to={'/allowance'}>Click To Manage Allowance</Link>
                    </Typography>
                );
            case "dai_balance_zero":
                return (
                    <Typography align="center" variant="body1" component="p" gutterBottom>
                        DAI Balance Is Zero
                    </Typography>
                );
            case "signal_balance_zero":
                return (
                    <Typography align="center" variant="body1" component="p" gutterBottom>
                        Signal Balance Is Zero
                    </Typography>
                );
            case "dai_to_signal_exchanged":
                return (
                    <Typography align="center" variant="body1" component="p" gutterBottom>
                        Signal Exchange Complete | <Link to={'/allowance'}>Manage Signal Allowance</Link>
                    </Typography>
                );
            default:
                return null;
        }
        
    }
    
    render(){
        const {classes, input} = this.props;
        const {setExchangeValue, signalBalance, daiBalance, daiAllowance, helperTextEnum, redirect, isInteractionReady} = this.state;
        const sliderMaxValue = this.getSliderMaxValue();
        const exchangeButtonText = this.getExchangeButtonText();
        return(
            <div className={classes.contentContainer}>
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect && 
                    <Form className={classes.form}>
                        <Typography align="left" variant="h6" component="h2" gutterBottom>
                                Current Signal Balance: <span className={classes.signalValue}>{tokenValueFormatDisplay(signalBalance, 2, "dB")}</span>
                        </Typography>
                        <Typography align="left" variant="h6" component="h2" gutterBottom>
                                Current DAI Balance: <span className={classes.signalValue}>{tokenValueFormatDisplay(daiBalance, 2, "DAI")}</span>
                        </Typography>
                        {input === "DAI" && 
                            <Fragment>
                                <Typography align="left" variant="h6" component="h2" gutterBottom>
                                    Current DAI Allowance: <span className={classes.signalValue}>{tokenValueFormatDisplay(daiAllowance, 2, "DAI")}</span>
                                </Typography>
                            </Fragment>
                        }
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                            <AllowanceIcon/>
                            </Grid>
                            <Grid item xs>
                            <Slider
                                disabled={isInteractionReady ? false : true}
                                valueLabelDisplay="auto"
                                max={sliderMaxValue > 0 ? sliderMaxValue : 0}
                                value={setExchangeValue}
                                onChange={this.handleSliderChange}
                                onMouseDown={this.validateExchangeSlider}
                            />
                            </Grid>
                            <Grid item>
                            <Input
                                disabled={isInteractionReady ? false : true}
                                className={classes.input}
                                value={setExchangeValue}
                                margin="dense"
                                id="allowance"
                                name="allowance"
                                label="allowance"
                                onChange={this.handleInputChange}
                                onMouseDown={this.validateExchangeSlider}
                                onBlur={this.handleBlur}
                                inputProps={{
                                step: 1,
                                min: 0,
                                max: sliderMaxValue > 0 ? sliderMaxValue : 0.01,
                                type: 'number',
                                }}
                            />
                                <Typography align="left" variant="body1" component="p" gutterBottom>
                                    {this.getSymbol(input)}
                                </Typography>
                            </Grid>
                        </Grid>
                        {this.getHelperText(helperTextEnum)}
                        <Fab onClick={() => this.triggerExchange()} color="primary" variant="extended" disabled={setExchangeValue === 0 || !isInteractionReady} className={classes.fab}>
                            <RegisterIcon className={classes.extendedIcon} />
                            {exchangeButtonText}
                        </Fab>
                        {this.getExchangeOutput({classes, setExchangeValue, input})}
                    </Form>
                }
            </div>
        )
    }
};

export default withStyles(styles, {withTheme: true})(SignalExchange);