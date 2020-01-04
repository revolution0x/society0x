import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import {Route, withRouter, Switch} from "react-router-dom";
import HomePage from "./pages/HomePage";
import ElementPage from "./pages/ElementPage";
import RegisterPage from "./pages/RegisterPage";
import FundPage from "./pages/FundPage";
import FundsPage from "./pages/FundsPage";
import SponsorPage from "./pages/SponsorPage";
import FundCreationPage from "./pages/FundCreationPage";
import ProfilePage from "./pages/ProfilePage";
import AllowancePage from "./pages/AllowancePage";
import ExchangePage from "./pages/ExchangePage";
import FaucetPage from "./pages/FaucetPage";
import IncorrectEthNetPage from "./pages/IncorrectEthNetPage";
import EthNetFilter from "./EthNetFilter";
// import CreationPage from "./pages/CreationPage";
import SettingsPage from "./pages/SettingsPage";
import { connect } from "react-redux";
import {store} from "../state";
import {debounce, isConsideredMobile} from "../utils";
import { AcceptedEthNetIds } from "../utils/constants";
import { setConsideredMobile } from "../state/actions";

const styles = theme => ({
    pageContainer: {
        padding: theme.spacing(4)
    },
    fullScreen: {
        height: '100%'
    }
})

class PageContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showNavigationWrapperState: store.getState().showNavigationWrapper,
            clientProvidedEthNet: false,
        };
        store.subscribe(() => {
            this.setState({
                setConsideredMobile: store.getState().setConsideredMobile,
                showNavigationWrapperState: store.getState().showNavigationWrapper,
                clientProvidedEthNet: store.getState().setClientProvidedEthNetId,
            });
        });
    }

    resize = () => {
        this.props.dispatch(setConsideredMobile(isConsideredMobile()));
    }
    
    componentDidMount = async () => {
        window.addEventListener('resize', debounce(this.resize, 250));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    render() {
        const {classes} = this.props;
        const { showNavigationWrapperState, setConsideredMobile } = this.state;
        let mobilePagePaddingOverride = {};
        if(setConsideredMobile) {
            mobilePagePaddingOverride = { padding: 0 };
        }

        return (
            <React.Fragment>
                    <div style={mobilePagePaddingOverride} className={showNavigationWrapperState ? classes.pageContainer : classes.fullScreen}>
                        <Switch>
                            <Route path="/" exact render={(props) => homeRoute(props)} />
                            <Route path="/register" exact render={(props) => registerRoute(props)} />
                            {/* <Route path="/creation" exact render={(props) => creationRoute(props)} />
                            <Route path="/creation/:creationType" exact render={(props) => creationRoute(props)} /> */}
                            <Route path="/create/fund" exact render={(props) => fundCreationRoute(props)} />
                            <Route path="/faucet" exact render={(props) => faucetRoute(props)} />
                            <Route path="/sponsor" exact render={(props) => sponsorRoute(props)} />
                            <Route path="/allowance" exact render={(props) => allowanceRoute(props)} />
                            <Route path="/exchange" exact render={(props) => exchangeRoute(props)} />
                            <Route path="/funds" exact render={(props) => fundsRoute(props)} />
                            <Route path="/funds/:fundUrlSlug" exact render={(props) => fundRoute(props)} />
                            <Route path="/element/:elementName" exact render={(props) => elementRoute(props)} />
                            <Route path="/settings" exact render={(props) => settingsRoute(props)} />
                            <Route path="/settings/:setting" exact render={(props) => settingsRoute(props)} />
                            <Route path="/:requestedPersona" exact render={(props) => profileRoute(props)} />
                            <Route path="/network-error/:ethnet" exact render={(props) => incorrectEthNetRoute(props)} />
                        </Switch>
                    </div>
            </React.Fragment>
        )
    }   
}

const incorrectEthNetRoute = ({match}, props) => {
    if(match && match.params && match.params.ethnet) {
        const requestNetwork = match.params.ethnet;
        return <IncorrectEthNetPage requestNetwork={requestNetwork}/>
    }else{
        return <IncorrectEthNetPage requestNetwork={"rinkeby"}/>
    }
}

const homeRoute = (props) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <HomePage/>
        </EthNetFilter>
    )
}

const registerRoute = (props) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <RegisterPage/>
        </EthNetFilter>
    )
}

const allowanceRoute = (props) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <AllowancePage/>
        </EthNetFilter>
    )
}

const exchangeRoute = (props) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <ExchangePage/>
        </EthNetFilter>
    )
}

const faucetRoute = (props) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <FaucetPage currency="DAI"/>
        </EthNetFilter>
    )
}

// const creationRoute = ({match}, props) => {
//     if(match && match.params && match.params.creationType) {
//         const { creationType } = match.params;
//         return <CreationPage creationType={creationType}/>
//     }else{
//         return <CreationPage/>
//     }
// }

const elementRoute = ({match}) => {
    if(match && match.params && match.params.elementName) {
        const elementName = match.params.elementName;
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <ElementPage elementName={elementName}/>
            </EthNetFilter>
        )
    }else{
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <ElementPage/>
            </EthNetFilter>
        )
    }
}

const fundsRoute = ({match}) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <FundsPage/>
        </EthNetFilter>
    )
}

const fundRoute = ({match}) => {
    if(match && match.params && match.params.fundUrlSlug) {
        const fundUrlSlug = match.params.fundUrlSlug;
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <FundPage fundUrlSlug={fundUrlSlug}/>
            </EthNetFilter>
        )
    }
}

const fundCreationRoute = ({match}) => {
    return (
        <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
            <FundCreationPage/>
        </EthNetFilter>
    )
}

const sponsorRoute = ({match}) => {
    return (
        <EthNetFilter requiredNetworks={["main", "private", "rinkeby"]}>
            <SponsorPage/>
        </EthNetFilter>
    )
}

const profileRoute = ({match}) => {
    if(match && match.params && match.params.requestedPersona) {
        const requestedPersona = match.params.requestedPersona;
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <ProfilePage requestedPersona={requestedPersona}/>
            </EthNetFilter>
        )
    }else{
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <ProfilePage/>
            </EthNetFilter>
        )
    }
}

const settingsRoute = ({match}) => {
    if(match && match.params && match.params.setting) {
        const setting = match.params.setting;
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <SettingsPage setting={setting}/>
            </EthNetFilter>
        )
    }else{
        return (
            <EthNetFilter requiredNetworks={AcceptedEthNetIds}>
                <SettingsPage/>
            </EthNetFilter>
        )
    }
}

export default withRouter(withStyles(styles, { withTheme: true })(connect()(PageContainer)));