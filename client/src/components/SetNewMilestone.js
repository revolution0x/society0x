import React, {Component} from 'react';
import { Form } from 'formik';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import {RequiresInteractionFee} from "./RequiresInteractionFee";
import {
    refreshBalancesAndAllowances
} from "../services/society0x";
import {store} from '../state';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import AllowanceIcon from '@material-ui/icons/SignalCellularAlt';
import {
    tokenValueFormat,
    tokenValueFormatDisplay,
} from '../utils';
import {
    setNewFundMilestone,
    fetchMinimumNewFundMilestone
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
    },
    input: {
        width: '100%'
    },
    iconContainer: {
        margin: theme.spacing(2)
    },
    marginTop: {
        marginTop: theme.spacing(1)
    }
});

class SetPledgeRevocation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            setNewMilestoneValue: tokenValueFormat(0),
            helperTextEnum: false,
            initiatedValues: false,
            isInteractionReady: false,
            minNewMilestoneValue: 0,
            fundId: props.fundId,
        }
        this.handleBlur = this.handleBlur.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.triggerSaveMilestone = this.triggerSaveMilestone.bind(this);
    }
    
    handleInputChange = event => {
        this.setState({setNewMilestoneValue: event.target.value === '' ? '' : Number(event.target.value)})
    };
    
    handleBlur = () => {
        const {setNewMilestoneValue, minNewMilestoneValue} = this.state;
        if (setNewMilestoneValue * 1 <= minNewMilestoneValue) {
            this.setState({setNewMilestoneValue: tokenValueFormat(minNewMilestoneValue)});
        }
    };

    setRedirect(redirect) {
        this.setState({redirect});
    }

    componentDidMount = async () => {
        const {fundId} = this.state;
        const storeState = await store.getState();
        const account = storeState.myProfileMetaData.id;
        await refreshBalancesAndAllowances(account);
        const minNewMilestoneValue = await fetchMinimumNewFundMilestone(fundId);
        const milestoneState = storeState.fundMilestones;
        const fundBalanceState = storeState.fundBalances;
        let latestMilestone = 0;
        let fundBalance = 0;
        if(milestoneState && milestoneState[fundId] && milestoneState[fundId].length > 1){
            latestMilestone = milestoneState[fundId][milestoneState[fundId].length - 1];
        }
        if(fundBalanceState && fundBalanceState[fundId]){
            fundBalance = fundBalanceState[fundId];
        }
        this.setState({
            setNewMilestoneValue: minNewMilestoneValue,
            initiatedValues: true,
            isInteractionReady: true,
            minNewMilestoneValue: minNewMilestoneValue,
            latestMilestone: latestMilestone,
            fundBalance: fundBalance,
        })
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
            // Example:
            // case "dai_allowance_zero":
            //     return (
            //         <Typography align="center" variant="body1" component="p" gutterBottom>
            //             DAI Allowance Is Zero | <Link to={'/allowance'}>Click To Manage Allowance</Link>
            //         </Typography>
            //     );
            default:
                return null;
        }
    }

    triggerSaveMilestone = () => {
        const {setNewMilestoneValue, fundId} = this.state;
        let reduxState = store.getState();
        let account = reduxState.myProfileMetaData.id;
        setNewFundMilestone(fundId, setNewMilestoneValue, account);
    }
    
    render(){
        const {classes, input} = this.props;
        const {setNewMilestoneValue, minNewMilestoneValue, helperTextEnum, isInteractionReady, latestMilestone, fundBalance} = this.state;
        return(
            <div className={classes.contentContainer}>
                <Form className={classes.form}>
                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                            Previous Milestone: <span className={classes.signalValue}>{tokenValueFormatDisplay(latestMilestone, 2, "dB")}</span>
                    </Typography>
                    <Typography align="left" variant="h6" component="h2" gutterBottom>
                            Signal Received: <span className={classes.signalValue}>{tokenValueFormatDisplay(fundBalance, 2, "dB")}</span>
                    </Typography>
                    <Grid container className={classes.marginTop} spacing={2} alignItems="center">
                        <div className={classes.iconContainer}>
                            <AllowanceIcon/>
                        </div>
                        <Grid item xs={12} sm container>
                        <Input
                                    disabled={isInteractionReady ? false : true}
                                    className={classes.input}
                                    value={setNewMilestoneValue}
                                    margin="dense"
                                    id="allowance"
                                    name="allowance"
                                    label="allowance"
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleBlur}
                                    inputProps={{
                                    step: 1,
                                    min: minNewMilestoneValue,
                                    type: 'number',
                                    }}
                                />
                                <Typography align="left" variant="body1" component="p" gutterBottom>
                                    {this.getSymbol(input)}
                                </Typography>
                        </Grid>
                    </Grid>
                    {this.getHelperText(helperTextEnum)}
                    <RequiresInteractionFee>
                        <Fab onClick={() => this.triggerSaveMilestone()} color="primary" variant="extended" disabled={(setNewMilestoneValue <= minNewMilestoneValue) || !isInteractionReady} className={classes.fab}>
                            <RegisterIcon className={classes.extendedIcon} />
                            Set {tokenValueFormatDisplay(setNewMilestoneValue, 2, 'dB')} Milestone
                        </Fab>
                    </RequiresInteractionFee>
                </Form>
            </div>
        )
    }
};

export default withStyles(styles, {withTheme: true})(SetPledgeRevocation);