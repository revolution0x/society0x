import React, {Component} from 'react';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import * as yup from "yup";
import {registerProfile} from "../services/society0x";
import {store} from '../state';
import {setMyProfileMetaData} from "../state/actions";
import {Redirect} from 'react-router-dom';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import Typography from '@material-ui/core/Typography';
import { DefaultProfileMetaData } from "../utils/constants";
import LottieRender from "./LottieRender";
import {RequiresInteractionFee} from "./RequiresInteractionFee";
const fingerprintLottieJSON = require("../lottie/fingerprint.json");

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    inputMargin: {
        marginBottom: theme.spacing(2),
    },
    contentContainer:{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    LottieRender: {
        width: '100%',
        marginBottom: theme.spacing(2),
    }
});

class RegisterPersonaForm extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    setRedirect(redirect) {
        this.setState({redirect});
    }
    
    render(){
        const {redirect} = this.state;
        const {classes} = this.props;
        const thisPersist = this;
        const validationSchema = yup.object().shape({
        recaptcha: yup.array(),
        pseudonym: yup
            .string()
            .required("A pseudonym is required")
            .test('len', 'Must be more than 0 characters and less than 24 characters', val => (val && (val.length >= 0) && (val.length <= 24)))
        });
        return(
            <div className={classes.contentContainer}>
                <div className={classes.LottieRender}>
                                <LottieRender lottieJSON={fingerprintLottieJSON} width={400} height={150}/>
                </div>
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect && 
                    <Formik
                    initialValues={{ pseudonym: "" }}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    onSubmit={async (values, { setSubmitting }) => {
                        const currentId = store.getState().myProfileMetaData.id;
                        const pseudonym = values.pseudonym;
                        const profileMetaData = Object.assign(DefaultProfileMetaData, {id: currentId, pseudonym});
                        try{
                            let personaRegistrationResponse = await registerProfile(currentId, pseudonym);
                            if(personaRegistrationResponse){
                                store.dispatch(setMyProfileMetaData(Object.assign(profileMetaData)));
                                thisPersist.setRedirect(`/${pseudonym}`);
                            }else{
                                setSubmitting(false);
                            }
                        } catch(e) {
                            let firstErrorLine = e.message.split("\n")[0]
                            let scanString = "Reason given: ";
                            let indexOfScanString = firstErrorLine.indexOf(scanString);
                            if(indexOfScanString > -1){
                                let reasonGiven = firstErrorLine.substr(indexOfScanString + scanString.length);
                                console.log({reasonGiven});
                            }
                            setSubmitting(false);
                        }
                    }}
                    >
                    {({ isSubmitting }) => (
                        <RequiresInteractionFee>
                            <Form>
                                <Typography align="left" variant="h6" component="h2">
                                    Claim your pseudonym:
                                </Typography>
                                <Field className={"fullwidth " + classes.inputMargin} type="text" name="pseudonym" placeholder="Persona Pseudonym" component={TextField}/>
                                <Fab color="primary" variant="extended" type="submit" disabled={isSubmitting} aria-label="Submit" className={classes.fab}>
                                    <RegisterIcon className={classes.extendedIcon} />
                                    Generate Persona
                                </Fab>
                            </Form>
                        </RequiresInteractionFee>
                    )}
                    </Formik>
                }
            </div>
        )
    }
};

export default withStyles(styles, {withTheme: true})(RegisterPersonaForm);