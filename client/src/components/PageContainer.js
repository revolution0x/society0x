import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import {Route, withRouter, Switch} from "react-router-dom";
import HomePage from "./pages/HomePage";
import ElementPage from "./pages/ElementPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import { connect } from "react-redux";
import {showNavigationWrapper} from "../state/actions";
import store from "../state";

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
            showNavigationWrapper: store.getState().showNavigationWrapper,
          };
          store.subscribe(() => {
            this.setState({
              showNavigationWrapper: store.getState().showNavigationWrapper,
            });
          });
    }

    render() {
        const {classes} = this.props;
        const {showNavigationWrapper} = this.state;
        console.log("showNavigationWrapper",showNavigationWrapper);
        return (
            <React.Fragment>
                <div className={showNavigationWrapper ? classes.pageContainer : classes.fullScreen}>
                    <Switch>
                        {/* <Route path="/" exact render={(props) => homeRoute(props)} /> */}
                        <Route path="/" exact render={(props) => landingRoute(props)} />
                        <Route path="/register" exact render={(props) => registerRoute(props)} />
                        <Route path="/element/:elementName" exact render={(props) => elementRoute(props)} />
                        <Route path="/:memberName" exact render={(props) => profileRoute(props)} />
                    </Switch>
                </div>
            </React.Fragment>
        )
    }   
}

const landingRoute = (props) => {
    let willNavigationShow = store.getState().showNavigationWrapper;
    console.log({willNavigationShow})
    if(willNavigationShow){
        store.dispatch(showNavigationWrapper(false));
    }
    console.log("test");
    return <LandingPage/>
}

const homeRoute = (props) => {
    return <HomePage/>
}

const registerRoute = (props) => {
    return <RegisterPage/>
}

const elementRoute = ({match}, props) => {
    if(match && match.params && match.params.elementName) {
        const elementName = match.params.elementName;
        return <ElementPage elementName={elementName}/>
    }else{
        return <ElementPage/>
    }
}

const profileRoute = ({match}, props) => {
    if(match && match.params && match.params.memberName) {
        const memberName = match.params.memberName;
        return <ProfilePage memberName={memberName}/>
    }else{
        return <ProfilePage/>
    }
}

export default withRouter(withStyles(styles, { withTheme: true })(connect()(PageContainer)));