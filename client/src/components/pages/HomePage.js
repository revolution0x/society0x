import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import OurCard from '../OurCard';
import ProfilePage from "./ProfilePage";
import {Link} from "react-router-dom";

const styles = theme => ({
    segmentContainer: {
        paddingBottom: theme.spacing.unit * 4,
    }
})

const demoAccounts = ["Anonymous", "Aesop", "Pseudonymous", "Animus", "GaiaPariah"]

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                {demoAccounts.map((item) => <div className={classes.segmentContainer}><ProfilePage requestedPersona={item} hideButtons={true} isLinkToProfile={true}></ProfilePage></div>)}
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(HomePage);