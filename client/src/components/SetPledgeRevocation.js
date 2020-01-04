import React, {Component, Fragment} from 'react';
import { Form } from 'formik';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import {
    refreshBalancesAndAllowances
} from "../services/society0x";
import {store} from '../state';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import AllowanceIcon from '@material-ui/icons/SignalCellularAlt';
import {Link} from 'react-router-dom';
import {
    tokenValueFormat,
    tokenValueFormatDisplay,
} from '../utils';
import {
    unpledgeSignalFromFund
} from '../services/society0x';

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
    form: {
        minWidth: '350px',
    }
});

class SetPledgeRevocation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            setWithdrawValue: tokenValueFormat(0),
            interactionFee: "Loading...",
            signalBalance: store.getState().signalBalance || "Loading...",
            signalAllowance: store.getState().signalAllowance || "Loading...",
            daiBalance: store.getState().daiBalance || "Loading...",
            daiAllowance: store.getState().daiAllowance || "Loading...",
            helperTextEnum: false,
            initiatedValues: false,
            isInteractionReady: false,
            maxWithdrawValue: 0,
            fundId: props.fundId,
        }
        store.subscribe(() => {
            const reduxState = store.getState();
            const {fundId, maxWithdrawValue} = this.state;
            if(
                reduxState && reduxState.fundWithdrawable[fundId] &&
                (reduxState.fundWithdrawable[fundId] !== maxWithdrawValue)
            ) {
                this.setState({
                    maxWithdrawValue: reduxState.fundWithdrawable[fundId],
                });
            }
        });
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.triggerRevocation = this.triggerRevocation.bind(this);
        this.getSliderMaxValue = this.getSliderMaxValue.bind(this);
        this.getWithdrawButtonText = this.getWithdrawButtonText.bind(this);
    }

    handleSliderChange = (event, newValue) => {
        this.setState({setWithdrawValue: tokenValueFormat(newValue)});
    };
    
    handleInputChange = event => {
        this.setState({setWithdrawValue: event.target.value === '' ? '' : Number(event.target.value)})
    };
    
    handleBlur = () => {
        const {setWithdrawValue, maxWithdrawValue} = this.state;
        if (setWithdrawValue * 1 < 0) {
            this.setState({setWithdrawValue: 0});
        } else if (setWithdrawValue * 1 > maxWithdrawValue) {
            this.setState({setWithdrawValue: tokenValueFormat(maxWithdrawValue)});
        }
    };

    setRedirect(redirect) {
        this.setState({redirect});
    }

    componentDidMount = async () => {
        const account = store.getState().myProfileMetaData.id;
        await refreshBalancesAndAllowances(account);
        this.setState({
            setWithdrawValue: 0,
            initiatedValues: true,
            isInteractionReady: true,
        })
    }

    getWithdrawButtonText = () => {
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

    getWithdrawOutput = ({classes, input, setWithdrawValue}) => {
        const {maxWithdrawValue} = this.state;
        const remainder = maxWithdrawValue - setWithdrawValue;
        switch(input){
            case "SIGNAL":
                return (
                    <Fragment>
                        <Typography className={setWithdrawValue > 0 ? null : "disabled-zone"} align="left" variant="h6" component="h2" gutterBottom>
                            Remaining After Withdrawal: <span className={classes.signalValue}>{tokenValueFormatDisplay(remainder, 2, "dB")}</span>
                        </Typography>
                    </Fragment>
                )
            case "DAI":
                return (
                    <Fragment>
                        <Typography className={setWithdrawValue > 0 ? null : "disabled-zone"} align="left" variant="h6" component="h2" gutterBottom>
                            Remaining After Withdrawal: <span className={classes.signalValue}>{tokenValueFormatDisplay(remainder, 2, "DAI")}</span>
                        </Typography>
                    </Fragment>
                )
            default:
                return null;
        }
    }

    getSliderMaxValue = () => {
        const {input} = this.props;
        const {maxWithdrawValue} = this.state;
        switch(input) {
            case "DAI":
                return tokenValueFormat(maxWithdrawValue);
            case "SIGNAL":
                return tokenValueFormat(maxWithdrawValue);
            default:
                return tokenValueFormat(0);
        }
    }

    validateWithdrawalSlider = () => {
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
            default:
                return null;
        }
    }

    triggerRevocation = () => {
        const {setWithdrawValue, fundId} = this.state;
        let reduxState = store.getState();
        let account = reduxState.myProfileMetaData.id;
        unpledgeSignalFromFund(fundId, setWithdrawValue, account);
    }
    
    render(){
        const {classes, input} = this.props;
        const {setWithdrawValue, maxWithdrawValue, helperTextEnum, isInteractionReady} = this.state;
        const sliderMaxValue = this.getSliderMaxValue();
        return(
            <div className={classes.contentContainer}>
                <Form className={classes.form}>
                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                            Maximum Withdrawal Available: <span className={classes.signalValue}>{tokenValueFormatDisplay(maxWithdrawValue, 2, "dB")}</span>
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                        <AllowanceIcon/>
                        </Grid>
                        <Grid item xs>
                        <Slider
                            disabled={isInteractionReady ? false : true}
                            valueLabelDisplay="auto"
                            max={sliderMaxValue > 0 ? sliderMaxValue : 0}
                            value={setWithdrawValue * 1}
                            onChange={this.handleSliderChange}
                            onMouseDown={this.validateWithdrawalSlider}
                        />
                        </Grid>
                        <Grid item>
                        <Input
                            disabled={isInteractionReady ? false : true}
                            className={classes.input}
                            value={setWithdrawValue}
                            margin="dense"
                            id="allowance"
                            name="allowance"
                            label="allowance"
                            onChange={this.handleInputChange}
                            onMouseDown={this.validateWithdrawalSlider}
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
                    <Fab onClick={() => this.triggerRevocation()} color="primary" variant="extended" disabled={(setWithdrawValue === 0) || (setWithdrawValue > maxWithdrawValue) || !isInteractionReady} className={classes.fab}>
                        <RegisterIcon className={classes.extendedIcon} />
                        Withdraw {tokenValueFormatDisplay(setWithdrawValue, 2, 'dB')}
                    </Fab>
                    {this.getWithdrawOutput({classes, setWithdrawValue, input})}
                </Form>
            </div>
        )
    }
};

export default withStyles(styles, {withTheme: true})(SetPledgeRevocation);