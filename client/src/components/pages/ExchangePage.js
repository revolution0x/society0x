import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import ExchangeTabs from "../ExchangeTabs";

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing(2),
    }
})

class ExchangePage extends Component {
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
                        <h1>Signal Exchange</h1>
                        <ExchangeTabs/>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(ExchangePage);