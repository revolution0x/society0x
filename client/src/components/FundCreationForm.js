import React, {Component} from 'react';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Fab from '@material-ui/core/Fab';
import {withStyles} from '@material-ui/core/styles';
import * as yup from "yup";
import {uploadToIPFS} from "../utils/ipfs";
import {createSociety0xFund} from "../services/society0x";
import {store} from '../state';
import {Redirect} from 'react-router-dom';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import Typography from '@material-ui/core/Typography';
import {stringToUrlSlug, dispatchSetModalConfig} from "../utils";
import {RequiresInteractionFee} from "./RequiresInteractionFee";
import ImageCropper from './PersonaImageCropper';

var Buffer = require('buffer/').Buffer

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
    },
    minFormWidth: {
        minWidth: '518px'
    }
});

class RegisterPersonaForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            croppedImageBase64: false,
        }
    }

    setRedirect(redirect) {
        this.setState({redirect});
    }

    setCroppedImageData(data) {
        this.setState({croppedImageBase64: data});
    }
    
    render(){
        const {redirect, croppedImageBase64} = this.state;
        const {classes} = this.props;
        const thisPersist = this;
        // const FILE_SIZE = 3 * 1000 * 1000; //3 MB
        // const SUPPORTED_FORMATS = [
        //     "image/jpg",
        //     "image/jpeg",
        //     "image/png",
        //     "image/gif",
        // ];
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
        fundName: yup
            .string()
            .required("A fund name is required")
            .test('isValidFundNameLength', 'Must be more than 0 characters and up to 32 characters', val => (val && (val.length >= 0) && (val.length <= 32))),
        initialMilestone: yup
            .number()
            .required("An initial Signal milestone is required.")
            .test('isValidMilestoneSize', 'Must be more than 0 characters and up to 32 characters', val => (val && (val >= 0)))
        });
        return(
            <div className={classes.contentContainer}>
                {/* <div className={classes.LottieRender}>
                                <LottieRender lottieJSON={fingerprintLottieJSON} width={400} height={150}/>
                </div> */}
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect && 
                    <Formik
                    initialValues={{ fundName: "", initialMilestone: "" }}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    onSubmit={async (values, { setSubmitting }) => {
                        const currentId = store.getState().myProfileMetaData.id;
                        const fundName = values.fundName;
                        const urlSlug = stringToUrlSlug(fundName);
                        const initialMilestone = values.initialMilestone;
                        try{
                            fetch(croppedImageBase64)
                                .then(res => res.blob())
                                .then(async (blob) => {
                                    const croppedImageFileReader = new FileReader();
                                    await croppedImageFileReader.readAsArrayBuffer(blob);
                                    croppedImageFileReader.onloadend = () => {
                                        const croppedPictureData = Buffer.from(croppedImageFileReader.result);
                                        dispatchSetModalConfig({
                                            stage: `fund_creation_uploading_cover_image`,
                                            disableBackdropClick: false,
                                            show: true,
                                        });
                                        uploadToIPFS(croppedPictureData).then(async (IpfsImageUploadResponse) => {
                                            if(IpfsImageUploadResponse && IpfsImageUploadResponse[0]){
                                                let ipfsCoverImageHash = IpfsImageUploadResponse[0].hash;
                                                let fundCreationResponse = await createSociety0xFund(currentId, fundName, urlSlug, initialMilestone, ipfsCoverImageHash);
                                                if(fundCreationResponse) {
                                                    thisPersist.setRedirect(`/funds/${urlSlug}`);
                                                }
                                            }
                                        })
                                    }
                                })
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
                            <Form className={classes.minFormWidth}>
                                <Typography align="left" variant="h6" component="h2">
                                    For the betterment of society:
                                </Typography>
                                <Field className={"fullwidth " + classes.inputMargin} type="text" name="fundName" placeholder="The name of your fund" component={TextField}/>
                                <Field className={"fullwidth " + classes.inputMargin} type="number" name="initialMilestone" placeholder="The initial Signal milestone" component={TextField}/>
                                <ImageCropper
                                    onRef={ref => (this.setCroppedImageData = ref)}
                                    parentReference={this.setCroppedImageData.bind(this)}
                                    includeForm={false}
                                    cropperHeight={350}
                                    titleElementHorizontalPadding={false}
                                    alignInput={"left"}
                                    hideSaveButton={true}
                                    type={"cover"}
                                />
                                <Fab color="primary" variant="extended" type="submit" disabled={isSubmitting} aria-label="Submit" className={classes.fab}>
                                    <RegisterIcon className={classes.extendedIcon} />
                                    Create New Fund
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