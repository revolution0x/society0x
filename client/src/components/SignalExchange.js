import React, {Component, Fragment} from 'react';
import { Form } from 'formik';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import {
    getSignalBalance,
    getSignalAllowance,
    getDaiBalance,
    getDaiAllowance,
    withdrawDaiForSignal,
    mintSignalForDai,
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
    toOnePercent,
    tokenValueFormat,
} from '../utils';

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
    inputMargin: {
        marginBottom: theme.spacing.unit * 2,
    },
    signalValue: {
        marginLeft: theme.spacing.unit * 4,
        float: 'right',
    },
    contentContainer:{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    LottieRender: {
        width: '100%',
        marginBottom: theme.spacing.unit * 2,
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
            signalBalance: "Loading...",
            signalAllowance: "Loading...",
            daiBalance: "Loading...",
            daiAllowance: "Loading...",
            sliderErrorEnum: false,
            initiatedValues: false,
            isInteractionReady: false,
        }
        store.subscribe(() => {
            const storeInteractionFee = store.getState().interactionFee;
            if (storeInteractionFee && (storeInteractionFee !== this.state.interactionFee)) {
                this.setState({
                    interactionFee: storeInteractionFee
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
        this.setState({setExchangeValue: tokenValueFormat(newValue)})
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
        const {setExchangeValue, signalBalance, daiBalance} = this.state;
        const {input} = this.props;
        const account = store.getState().setMyProfileMetaData.id;
        try{
            switch(input){
                case 'SIGNAL':
                    await withdrawDaiForSignal(account, setExchangeValue);
                    const newSignalBalance = signalBalance - setExchangeValue;
                    const newSetSignalValue = 0;
                    this.setState({
                        signalBalance: newSignalBalance,
                        setExchangeValue: newSetSignalValue,
                    });
                    break;
                case 'DAI':
                    const signalValue = daiToSignal(setExchangeValue);
                    await mintSignalForDai(account, signalValue);
                    const newDaiBalance = daiBalance - setExchangeValue;
                    const newSetDaiValue = 0;
                    this.setState({
                        daiBalance: newDaiBalance,
                        setExchangeValue: newSetDaiValue,
                    });
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
            // setSubmitting(false);
        }
    }

    componentDidMount = async () => {
        const account = store.getState().setMyProfileMetaData.id;
        const signalBalance = await getSignalBalance(account) * 1;
        const daiBalance = await getDaiBalance(account) * 1;
        const daiAllowance = await getDaiAllowance(account) * 1;
        const signalAllowance = await getSignalAllowance(account) * 1;
        this.setState({
            signalBalance: tokenValueFormat(signalBalance),
            signalAllowance: tokenValueFormat(signalAllowance),
            setExchangeValue: 0,
            daiBalance: tokenValueFormat(daiBalance),
            daiAllowance: tokenValueFormat(daiAllowance),
            initiatedValues: true,
            isInteractionReady: true,
        })
    }

    getExchangeButtonText = () => {
        const {input} = this.props;
        console.log({input});
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
                                Exchange Fee: <span className={classes.signalValue}>{signalToDaiWei(setExchangeValue / 100)} DAI</span>
                        </Typography>
                        <Typography className={setExchangeValue > 0 ? null : "disabled-zone"} align="left" variant="h6" component="h2" gutterBottom>
                                Exchange Result: <span className={classes.signalValue}>{signalToDaiWei(setExchangeValue - toOnePercent(setExchangeValue / 100))} DAI</span>
                        </Typography>
                    </Fragment>
                )
            case "DAI":
                return (
                    <Fragment>
                        <Typography className={setExchangeValue > 0 ? null : "disabled-zone"} align="left" variant="h6" component="h2" gutterBottom>
                                Exchange Result: <span className={classes.signalValue}>{daiToSignal(setExchangeValue)} dB</span>
                        </Typography>
                    </Fragment>
                )
            default:
                return null;
        }
    }

    getSliderMaxValue = () => {
        const {input} = this.props;
        const {signalBalance, daiBalance, daiAllowance} = this.state;
        switch(input) {
            case "DAI":
                if(daiAllowance < daiBalance) {
                    return tokenValueFormat(daiAllowance);
                }
                return tokenValueFormat(daiBalance);
            case "SIGNAL":
                return tokenValueFormat(signalBalance);
            default:
                return tokenValueFormat(0);
        }
    }

    validateExchangeSlider = () => {
        const {input} = this.props;
        const {signalBalance, daiAllowance, daiBalance, initiatedValues} = this.state;
        let setStateConfig = {
            sliderErrorEnum: false,
        }
        console.log('initiatedValues',initiatedValues);
        if(initiatedValues) {
            switch(input) {
                case "DAI": {
                    if(daiAllowance * 1 === 0) {
                        setStateConfig.sliderErrorEnum = "dai_allowance_zero";
                    }
                    if(daiBalance * 1 === 0) {
                        setStateConfig.sliderErrorEnum = "dai_balance_zero";
                    }
                    break;
                }
                case "SIGNAL": {
                    if(signalBalance * 1 === 0) {
                        setStateConfig.sliderErrorEnum = "signal_balance_zero";
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

    getSliderErrorElement = (sliderErrorEnum) => {
        switch(sliderErrorEnum){
            case "dai_allowance_zero":
                return (
                    <Typography className="error-red-dark-theme" align="left" variant="body1" component="p" gutterBottom>
                        DAI Allowance Is Zero - <Link to={'/allowance'}>Click To Manage Allowance</Link>
                    </Typography>
                );
            case "dai_balance_zero":
                return (
                    <Typography className="error-red-dark-theme" align="left" variant="body1" component="p" gutterBottom>
                        DAI Balance Is Zero
                    </Typography>
                );
            case "signal_balance_zero":
                return (
                    <Typography className="error-red-dark-theme" align="left" variant="body1" component="p" gutterBottom>
                        Signal Balance Is Zero
                    </Typography>
                );
            default:
                return null;
        }
        
    }
    
    render(){
        const {classes, input} = this.props;
        const {setExchangeValue, signalBalance, daiBalance, daiAllowance, sliderErrorEnum, redirect, isInteractionReady} = this.state;
        const sliderMaxValue = this.getSliderMaxValue();
        const exchangeButtonText = this.getExchangeButtonText();
        console.log('setExchangeValue, signalBalance, daiBalance, daiAllowance, sliderErrorEnum',setExchangeValue, signalBalance, daiBalance, daiAllowance, sliderErrorEnum);
        return(
            <div className={classes.contentContainer}>
                
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect && 
                    <Form className={classes.form}>
                        <Typography align="left" variant="h6" component="h2" gutterBottom>
                                Current Signal Balance: <span className={classes.signalValue}>{signalBalance} dB</span>
                        </Typography>
                        <Typography align="left" variant="h6" component="h2" gutterBottom>
                                Current DAI Balance: <span className={classes.signalValue}>{daiBalance} DAI</span>
                        </Typography>
                        {input === "DAI" && 
                            <Fragment>
                                <Typography align="left" variant="h6" component="h2" gutterBottom>
                                    Current DAI Allowance: <span className={classes.signalValue}>{daiAllowance} DAI</span>
                                </Typography>
                                <Typography align="left" variant="h6" component="h2" gutterBottom>
                                    Exchange Fee: <span className={classes.signalValue}>0.00 %</span>
                                </Typography>
                            </Fragment>
                        }
                        {input === "SIGNAL" && 
                            <Typography align="left" variant="h6" component="h2" gutterBottom>
                                    Exchange Fee: <span className={classes.signalValue}>1.00 %</span>
                            </Typography>
                        }
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                            <AllowanceIcon/>
                            </Grid>
                            <Grid item xs>
                            <Slider
                                disabled={isInteractionReady ? false : true}
                                max={sliderMaxValue}
                                value={setExchangeValue * 1}
                                onChange={this.handleSliderChange}
                                onMouseDown={this.validateExchangeSlider}
                            />
                            </Grid>
                            <Grid item>
                            <Input
                                className={classes.input}
                                value={setExchangeValue}
                                margin="dense"
                                id="allowance"
                                name="allowance"
                                label="allowance"
                                onChange={this.handleInputChange}
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
                        {this.getSliderErrorElement(sliderErrorEnum)}
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