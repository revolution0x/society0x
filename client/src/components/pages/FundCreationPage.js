import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import FundCreationForm from "../FundCreationForm";

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing(2),
    }
})

class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <div className="text-align-center">
                    <Card className={["max-page-width-medium auto-margins", classes.cardPadding].join(" ")}>
                        <h1>Fund Creator</h1>
                        <FundCreationForm/>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(RegisterPage);