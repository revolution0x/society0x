import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import FaucetIcon from '@material-ui/icons/EvStation';
import Fab from '@material-ui/core/Fab';
import {store} from "../../state";
import {getTestDai} from "../../services/society0x";

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing(2),
    },
    fab: {
        width: '100%',
        maxWidth: '300px',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
})

class FaucetPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: store.getState().myProfileMetaData.id,
            isGettingFaucetPayload: false,
        };
        store.subscribe(() => {
            if (store.getState().myProfileMetaData) {
              this.setState({
                account: store.getState().myProfileMetaData.id,
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
                        <h1>{currency} Faucet (Testnet)</h1>
                        <Fab onClick={() => this.triggerGetTestDai(account)} color="primary" variant="extended" className={classes.fab}>
                            <FaucetIcon className={classes.extendedIcon} />
                            Withdraw 100 DAI (Testnet)
                        </Fab>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(FaucetPage);