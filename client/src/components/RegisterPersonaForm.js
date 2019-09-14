import React, {Component} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { SimpleFileUpload, TextField } from 'formik-material-ui';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import CreateIcon from '@material-ui/icons/LeakAdd';
import * as yup from "yup";
import {uploadToIPFS} from "../utils/ipfs";
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

var Buffer = require('buffer/').Buffer

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
    inputMargin: {
        marginBottom: theme.spacing.unit * 2,
    },
    contentContainer:{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    LottieRender: {
        width: '100%',
        marginBottom: theme.spacing.unit * 2,
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
        const FILE_SIZE = 3 * 1000 * 1000; //3 MB
        const SUPPORTED_FORMATS = [
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/gif",
        ];
        const validationSchema = yup.object().shape({
        recaptcha: yup.array(),
        // profilePicture: yup
        //     .mixed()
        //     .required("A profile picture is required")
        //     .test(
        //     "fileSize",
        //     "File too large (Limit is " + FILE_SIZE/1000/1000 + " MB)",
        //     value => value && value.size <= FILE_SIZE
        //     )
        //     .test(
        //     "fileFormat",
        //     "Unsupported Format",
        //     value => value && SUPPORTED_FORMATS.includes(value.type)
        //     ),
        // coverPicture: yup
        //     .mixed()
        //     .required("A profile picture is required")
        //     .test(
        //     "fileSize",
        //     "File too large (Limit is " + FILE_SIZE/1000/1000 + " MB)",
        //     value => value && value.size <= FILE_SIZE
        //     )
        //     .test(
        //     "fileFormat",
        //     "Unsupported Format",
        //     value => value && SUPPORTED_FORMATS.includes(value.type)
        //     ),
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
                    initialValues={{ file: "", pseudonym: "" }}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    onSubmit={async (values, { setSubmitting }) => {
                        const currentId = store.getState().setMyProfileMetaData.id;
                        const pseudonym = values.pseudonym;
                        const profileMetaData = Object.assign(DefaultProfileMetaData, {id: currentId, pseudonym});
                        let profileMetaDataBuffer = Buffer.from(JSON.stringify(profileMetaData));
                        uploadToIPFS(profileMetaDataBuffer).then(async (IpfsMetaDataUploadResponse) => {
                            try{
                                const registerResponse = await registerProfile(currentId, pseudonym, IpfsMetaDataUploadResponse[0].hash);
                                console.log('registerResponse', registerResponse);
                                store.dispatch(setMyProfileMetaData(Object.assign(profileMetaData)))
                                thisPersist.setRedirect(`/${pseudonym}`);
                                setSubmitting(false);
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
                        })
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
                                {/* <pre>{JSON.stringify({name: values.file.name, type: values.file.type, size: values.file.size})}</pre> */}
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