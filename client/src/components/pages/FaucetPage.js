import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import FaucetIcon from '@material-ui/icons/EvStation';
import Fab from '@material-ui/core/Fab';
import {store} from "../../state";
import {getTestDai} from "../../services/society0x";

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing.unit * 2,
    },
    fab: {
        width: '100%',
        maxWidth: '300px',
        marginTop: theme.spacing.unit * 1,
        marginBottom: theme.spacing.unit * 2,
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
})

class FaucetPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: store.getState().setMyProfileMetaData.id,
            isGettingFaucetPayload: false,
        };
        store.subscribe(() => {
            if (store.getState().setMyProfileMetaData) {
              this.setState({
                account: store.getState().setMyProfileMetaData.id,
                isGettingFaucetPayload: false,
              });
            }
        });
    }

    triggerGetTestDai = async (account) => {
        this.setState({
            isGettingFaucetPayload: true
        })
        await getTestDai(account);
    }

    render() {
        const {account} = this.state;
        const {classes, currency} = this.props;
        return (
            <React.Fragment>
                <div className="text-align-center">
                    <Card className={"max-page-width auto-margins " + classes.cardPadding}>
                        <h1>{currency} Faucet</h1>
                        <Fab onClick={() => this.triggerGetTestDai(account)} color="primary" variant="extended" className={classes.fab}>
                            <FaucetIcon className={classes.extendedIcon} />
                            Withdraw 100 Test DAI
                        </Fab>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(FaucetPage);