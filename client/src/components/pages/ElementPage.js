import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing.unit * 2,
    }
})

class ElementPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {classes, elementName} = this.props;
        return (
            <React.Fragment>
                <div className="text-align-center">
                    <Card className={"max-page-width auto-margins " + classes.cardPadding}>
                        <h1>Element: {elementName}</h1>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(ElementPage);