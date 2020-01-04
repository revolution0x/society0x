import React, {Component, Fragment} from 'react';
import { Form } from 'formik';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import {
    setSignalAllowance,
    setDaiAllowance,
    refreshBalancesAndAllowances,
} from "../services/society0x";
import {store} from '../state';
import {Redirect} from 'react-router-dom';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import AllowanceIcon from '@material-ui/icons/SignalCellularAlt';
import {tokenValueFormat} from '../utils';
import {Link} from 'react-router-dom';

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

class AdjustAllowance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: props.input,
            setAllowanceValue: 0,
            interactionFee: store.getState().interactionFee || "Loading...",
            allocatableAllowanceLimit: 0,
            signalBalance: store.getState().selfSignalBalance || "Loading...",
            signalAllowance: store.getState().selfSignalAllowance || "Loading...",
            daiBalance: store.getState().selfDaiBalance || "Loading...",
            daiAllowance: store.getState().selfDaiAllowance || "Loading...",
            isInteractionReady: false,
            helperTextEnum: false,
        }
        store.subscribe(() => {
            const storeState = store.getState();
            const storeInteractionFee = storeState.interactionFee;
            const storeSignalBalance = storeState.selfSignalBalance;
            const storeSignalAllowance = storeState.selfSignalAllowance;
            const storeDaiBalance = storeState.selfDaiBalance;
            const storeDaiAllowance = storeState.selfDaiAllowance;
            if (
                (storeSignalBalance && storeSignalBalance !== this.state.signalBalance) ||
                (storeSignalAllowance && storeSignalAllowance !== this.state.signalAllowance) ||
                (storeDaiBalance && storeDaiBalance !== this.state.daiBalance) ||
                (storeDaiAllowance && storeDaiAllowance !== this.state.daiAllowance) ||
                (storeInteractionFee && storeInteractionFee !== this.state.interactionFee)
                ){
                this.setState({
                    signalBalance: storeSignalBalance,
                    signalAllowance: storeSignalAllowance,
                    daiBalance: storeDaiBalance,
                    daiAllowance: storeDaiAllowance,
                    interactionFee: storeInteractionFee,
                })
            }
        });
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.triggerSetAllowance = this.triggerSetAllowance.bind(this);
    }

    componentWillUnmount() {
        this.handleBlur = null;
        this.handleSliderChange = null;
        this.handleInputChange = null;
        this.triggerSetAllowance = null;
    }

    handleSliderChange = (event, newValue) => {
        this.setState({setAllowanceValue: tokenValueFormat(newValue)})
    };
    
    handleInputChange = event => {
        this.setState({setAllowanceValue: event.target.value === '' ? '' : Number(event.target.value)})
    };
    
    handleBlur = () => {
        const {setAllowanceValue, allocatableAllowanceLimit} = this.state;
        if (setAllowanceValue * 1 < 0) {
            this.setState({setAllowanceValue: tokenValueFormat(0)});
        } else if (setAllowanceValue * 1 >= allocatableAllowanceLimit) {
            this.setState({setAllowanceValue: tokenValueFormat(allocatableAllowanceLimit)});
        }
    };

    setRedirect(redirect) {
        this.setState({redirect});
    }

    triggerSetAllowance = async () => {
        const {setAllowanceValue} = this.state;
        const {input} = this.props;
        const account = store.getState().myProfileMetaData.id;
        try{
            if(input === "DAI") {
                await setDaiAllowance(account, setAllowanceValue);
                this.setState({helperTextEnum: 'link_dai_exchange'});
            }else if (input === "dB"){
                await setSignalAllowance(account, setAllowanceValue);
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

    getHelperText = (helperTextEnum) => {
        switch(helperTextEnum){
            case "link_dai_exchange":
                return (
                    <Typography align="center" variant="body1" component="p" gutterBottom>
                        DAI Allowance Set | <Link to={'/exchange'}>{`Exchange DAI <-> Signal`}</Link>
                    </Typography>
                );
            default:
                return null;
        }
    }

    componentDidMount = async () => {
        const { input } = this.props;
        await refreshBalancesAndAllowances();
        const storeState = await store.getState();
        const interactionFee = storeState.interactionFee;
        const signalBalance = storeState.selfSignalBalance * 1;
        const signalAllowance = storeState.selfSignalAllowance * 1;
        const daiBalance = storeState.selfDaiBalance * 1;
        const daiAllowance = storeState.selfDaiAllowance * 1;
        let allocatableAllowanceLimit = 0;
        let setAllowanceValue = 0;
        if(input === "DAI") {
            allocatableAllowanceLimit = daiBalance;
            setAllowanceValue = daiBalance > daiAllowance ? daiAllowance : daiBalance;
        }
        if(input === "dB") {
            allocatableAllowanceLimit = signalBalance;
            setAllowanceValue = signalBalance > signalAllowance ? signalAllowance : signalBalance;
        }
        this.setState({
            allocatableAllowanceLimit: tokenValueFormat(allocatableAllowanceLimit),
            setAllowanceValue: tokenValueFormat(setAllowanceValue),
            interactionFee: tokenValueFormat(interactionFee),
            isInteractionReady: true,
        })
    }
    
    render(){
        const {classes, input} = this.props;
        const {setAllowanceValue, interactionFee, allocatableAllowanceLimit, signalBalance, signalAllowance, daiBalance, daiAllowance, isInteractionReady, redirect, helperTextEnum} = this.state;
        let isUpdateDisabled = (setAllowanceValue === signalAllowance) || !isInteractionReady;
        if(input === "DAI"){
            isUpdateDisabled = (setAllowanceValue === daiAllowance) || !isInteractionReady;
        }
        return(
            <div className={classes.contentContainer}>
                
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect && 
                    
                        <Form className={classes.form}>
                            {input === "dB" && 
                                <Fragment>
                                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                                            Interaction Fee: <span className={classes.signalValue}>{interactionFee} dB</span>
                                    </Typography>
                                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                                            Current Signal Balance: <span className={classes.signalValue}>{signalBalance} dB</span>
                                    </Typography>
                                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                                            Current Signal Allowance: <span className={classes.signalValue}>{signalAllowance} dB</span>
                                    </Typography>
                                </Fragment>
                            }
                            {input === "DAI" && 
                                <Fragment>
                                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                                            Current DAI Balance: <span className={classes.signalValue}>{daiBalance} DAI</span>
                                    </Typography>
                                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                                            Current DAI Allowance: <span className={classes.signalValue}>{daiAllowance} DAI</span>
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
                                    max={allocatableAllowanceLimit > 0 ? allocatableAllowanceLimit : 0}
                                    value={setAllowanceValue * 1}
                                    onChange={this.handleSliderChange}
                                />
                                </Grid>
                                <Grid item>
                                <Input
                                    disabled={isInteractionReady ? false : true}
                                    className={classes.input}
                                    value={setAllowanceValue}
                                    margin="dense"
                                    id="allowance"
                                    name="allowance"
                                    label="allowance"
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleBlur}
                                    lang="en-US"
                                    type="number"
                                    inputProps={{
                                    step: 1,
                                    min: 0,
                                    max: allocatableAllowanceLimit > 0 ? allocatableAllowanceLimit : 0.01,
                                    }}
                                />
                                <Typography align="left" variant="body1" component="p" gutterBottom>
                                        {input}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {helperTextEnum && this.getHelperText(helperTextEnum)}
                            <Fab onClick={() => this.triggerSetAllowance()} color="primary" variant="extended" disabled={isUpdateDisabled} className={classes.fab}>
                                <RegisterIcon className={classes.extendedIcon} />
                                Update Allowance
                            </Fab>
                        </Form>

                }
            </div>
        )
    }
};

export default withStyles(styles, {withTheme: true})(AdjustAllowance);