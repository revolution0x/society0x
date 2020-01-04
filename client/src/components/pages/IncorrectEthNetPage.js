import React, { Component, Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import RinkebyNetworkMetamask from '../../images/rinkeby_network_metamask.png';
import MainNetworkMetamask from '../../images/main_network_metamask.png';
import InstallMetaMask from '../../images/ethereum_metamask_chrome.png';

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing(2),
    },
    helperImage: {
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    }
})

class IncorrectEthNetPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requestNetwork: props.requestNetwork || false
        };
    }

    render() {
        const {classes} = this.props;
        const {requestNetwork} = this.state;
        let isMetaMask = false;
        if(typeof window.web3 !== "undefined" && window.web3.currentProvider.isMetaMask === true){
            isMetaMask = true;
        }
        return (
            <React.Fragment>
                <div className="text-align-center">
                    <Card className={"max-page-width auto-margins " + classes.cardPadding}>
                        {isMetaMask &&
                            <Fragment>
                                {requestNetwork === "rinkeby" && 
                                    <Fragment>
                                        <h1>Ethereum Network Mismatch</h1>
                                        <p>Please switch to the Rinkeby Network via MetaMask:</p>
                                        <img alt={"Rinkeby Network Requested"} src={RinkebyNetworkMetamask} className={classes.helperImage}></img>
                                    </Fragment>
                                }
                                {requestNetwork === "main" && 
                                    <Fragment>
                                        <h1>Ethereum Network Mismatch</h1>
                                        <p>Please switch to the Main Ethereum Network via MetaMask:</p>
                                        <img alt={"Mainnet Requested"} src={MainNetworkMetamask} className={classes.helperImage}></img>
                                    </Fragment>
                                }
                            </Fragment>
                        }
                        {!isMetaMask && 
                            <Fragment>
                                <h1>MetaMask Not Detected</h1>
                                <Typography variant="h6">
                                    Please install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> to interface with society0x.
                                </Typography>
                                <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
                                    <img alt={"MetaMask Install Requested"} src={InstallMetaMask}></img>
                                </a>
                            </Fragment>
                        }
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(IncorrectEthNetPage);