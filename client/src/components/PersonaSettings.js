import React, { Component, Fragment } from 'react';
import {withStyles} from "@material-ui/core/styles";
import {Redirect} from 'react-router-dom';
import PersonaSettingsTabs from './PersonaSettingsTabs';

const styles = theme => ({
    titleContainer: {
        padding: theme.spacing(2),
        paddingBottom: '0px',
    }
})

class PersonaSettings extends Component {
    constructor(props){
        super(props);
        this.state = {}
        this.setRedirect = this.setRedirect.bind(this);
    }

    setRedirect(redirect) {
        this.setState({redirect});
    }

    render() {
        const {classes} = this.props;
        const { redirect } = this.state;
        return(
            <Fragment>
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect &&
                    <Fragment>
                        <div className={classes.titleContainer}>
                            <h1>Persona Settings</h1>
                        </div>
                        <PersonaSettingsTabs></PersonaSettingsTabs>
                    </Fragment>
                }
            </Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(PersonaSettings);