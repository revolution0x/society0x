import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import AllowanceTabs from "../AllowanceTabs";

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing.unit * 2,
    }
})

class AllowancePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <div className="text-align-center">
                    <Card className={"max-page-width-medium auto-margins " + classes.cardPadding}>
                        <h1>Allowance Manager</h1>
                        <AllowanceTabs/>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(AllowancePage);