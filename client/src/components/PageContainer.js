import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import {Route, withRouter, Switch} from "react-router-dom";
import HomePage from "./pages/HomePage";
import ElementPage from "./pages/ElementPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import IncorrectEthNetPage from "./pages/IncorrectEthNetPage";
// import CreationPage from "./pages/CreationPage";
import SettingsPage from "./pages/SettingsPage";
import { connect } from "react-redux";
import {store} from "../state";
import {debounce, isConsideredMobile} from "../utils";
import { AcceptedEthNetIds } from "../utils/constants";
import { setConsideredMobile } from "../state/actions";

const styles = theme => ({
    pageContainer: {
        padding: theme.spacing.unit * 4
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
        const { showNavigationWrapperState, setConsideredMobile, clientProvidedEthNet } = this.state;
        let mobilePagePaddingOverride = {};
        if(setConsideredMobile) {
            mobilePagePaddingOverride = { padding: 0 };
        }
        console.log('AcceptedEthNetIds.indexOf(clientProvidedEthNet)',AcceptedEthNetIds.indexOf(clientProvidedEthNet));
        console.log({clientProvidedEthNet});

        return (
            <React.Fragment>
                    <div style={mobilePagePaddingOverride} className={showNavigationWrapperState ? classes.pageContainer : classes.fullScreen}>
                        {(AcceptedEthNetIds.indexOf(clientProvidedEthNet) === -1) &&
                            <Switch>
                                <Route path="*" exact render={(props) => incorrectEthNetRoute(props)} />
                            </Switch>
                        }
                        {(AcceptedEthNetIds.indexOf(clientProvidedEthNet) > -1) &&
                            <Switch>
                                <Route path="/" exact render={(props) => homeRoute(props)} />
                                <Route path="/register" exact render={(props) => registerRoute(props)} />
                                {/* <Route path="/creation" exact render={(props) => creationRoute(props)} />
                                <Route path="/creation/:creationType" exact render={(props) => creationRoute(props)} /> */}
                                <Route path="/element/:elementName" exact render={(props) => elementRoute(props)} />
                                <Route path="/settings" exact render={(props) => settingsRoute(props)} />
                                <Route path="/settings/:setting" exact render={(props) => settingsRoute(props)} />
                                <Route path="/:requestedPersona" exact render={(props) => profileRoute(props)} />
                            </Switch>
                        }
                    </div>
            </React.Fragment>
        )
    }   
}

const incorrectEthNetRoute = (props) => {
    return <IncorrectEthNetPage/>
}

const homeRoute = (props) => {
    return <HomePage/>
}

const registerRoute = (props) => {
    return <RegisterPage/>
}

// const creationRoute = ({match}, props) => {
//     if(match && match.params && match.params.creationType) {
//         const { creationType } = match.params;
//         return <CreationPage creationType={creationType}/>
//     }else{
//         return <CreationPage/>
//     }
// }

const elementRoute = ({match}, props) => {
    if(match && match.params && match.params.elementName) {
        const elementName = match.params.elementName;
        return <ElementPage elementName={elementName}/>
    }else{
        return <ElementPage/>
    }
}

const profileRoute = ({match}, props) => {
    if(match && match.params && match.params.requestedPersona) {
        const requestedPersona = match.params.requestedPersona;
        return <ProfilePage requestedPersona={requestedPersona}/>
    }else{
        return <ProfilePage/>
    }
}

const settingsRoute = ({match}, props) => {
    if(match && match.params && match.params.setting) {
        const setting = match.params.setting;
        return <SettingsPage setting={setting}/>
    }else{
        return <SettingsPage/>
    }
}

export default withRouter(withStyles(styles, { withTheme: true })(connect()(PageContainer)));