import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Card from '@material-ui/core/Card';
import { Link } from "react-router-dom";

import PersonaSettings from '../PersonaSettings';
import { capitaliseFirstLetter } from '../../utils';

const styles = theme => ({
    cardPadding: {
        padding: theme.spacing.unit * 2,
    },
    settingsZone: {
        marginTop: theme.spacing.unit,
    }
})


class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderSettingsComponent = (setting) => {
        switch(setting) {
            case 'persona':
                return <PersonaSettings />
            default:
                return null;
        }
    }

    render() {
        const {classes, setting} = this.props;
        return (
            <React.Fragment>
                <div className={["max-page-width auto-margins"].join(" ")}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="Breadcrumb">
                        <Link color="inherit" to="/settings">
                            Settings
                        </Link>
                        {setting && <Link
                            color="textPrimary"
                            to={`/settings/${setting}`}
                            aria-current="page"
                        >
                            {capitaliseFirstLetter(setting)}
                        </Link>}
                    </Breadcrumbs>
                    <Card className={classes.settingsZone}>
                        {this.renderSettingsComponent(setting)}
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(SettingsPage);