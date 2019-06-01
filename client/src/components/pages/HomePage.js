import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import OurCard from '../OurCard';

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing.unit * 2,
    }
})


class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <div className="text-align-center our-flex-wrap">
                    
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(HomePage);