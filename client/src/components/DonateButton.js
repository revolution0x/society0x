import React, {Fragment} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import FundsIcon from '@material-ui/icons/EmojiNature';
import {
    pledgeSignalToFund,
    pledgeDaiToDonation,
} from '../services/society0x';
import {store} from '../state';
import {setModalConfig} from '../state/actions';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: '200px',
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
    textField: {
        marginLeft: 0,
        marginBottom: 0,
        marginRight: 0,
        marginTop: 0,
    },
    button: {
        width: '64px',
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px',
    },
}));

export default function DonateButton({fundId, isSociety0xDonation = false}) {
    const classes = useStyles();

    const [donationValue, setStateDonationValue] = React.useState(0);

    const setDonationValue = () => event => {
        store.dispatch(setModalConfig({substituteValue1: event.target.value}));
        setStateDonationValue(event.target.value);
    };

    const triggerDonation = async () => {
        const account = store.getState().myProfileMetaData.id;
        if(!isSociety0xDonation) {
            await pledgeSignalToFund(fundId, donationValue, account);
        } else {
            await pledgeDaiToDonation(donationValue, "test");
        }
    }

    return (
        <Fragment>
            <Paper className={classes.root}>
                <TextField
                    id="outlined-dense-multiline"
                    label={isSociety0xDonation ? `Donate DAI` : `Donate Signal`}
                    className={classes.textField + " donate-button-text-field"}
                    margin="dense"
                    variant="outlined"
                    rowsMax="4"
                    onChange={setDonationValue()}
                />
                <Button onClick={() => triggerDonation()} variant="contained" color="primary" size="large" className={classes.button}>
                    <FundsIcon className={classes.extendedIcon} />
                </Button>
            </Paper>
        </Fragment>
    );
}