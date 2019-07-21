import React, { Component, Fragment } from 'react';
import Cropper from 'react-cropper';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { SimpleFileUpload } from 'formik-material-ui';
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import SaveIcon from '@material-ui/icons/Save';
import '../cropper.css';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import {Redirect} from 'react-router-dom';

import * as yup from "yup";
import {uploadToIPFS} from "../utils/ipfs";
import {debounce, capitaliseFirstLetter} from "../utils";
import defaultImage from '../images/society0x_transparent_white_thicker.png';
import {editProfileImage, editCoverImage} from "../services/society0x";
import {setMyProfileMetaData} from "../state/actions";
import {store} from '../state';


const styles = theme => ({
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
    button: {
        marginBottom: theme.spacing.unit * 2,
        width: '100%'
    },
    previewContainer: {
        textAlign: 'center',
    },
    titleElementContainer: {
        padding: theme.spacing.unit * 2,
        paddingTop: '0px',
    },
    titleContainer: {
        padding: theme.spacing.unit * 2,
        paddingBottom: '0px',
    },
    previewImage: {
        maxHeight: '85vh',
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    }
})

class PersonaImageSettings extends Component {
    constructor(props){
        super(props);
        this.state = {
            croppedImageBase64: null,
            cropperType: props.type,
            // cropperImage: defaultImage,
        }
        this.cropper = React.createRef();
        this.setRedirect = this.setRedirect.bind(this);
        this.fileInputToBase64 = this.fileInputToBase64.bind(this);
    }

    crop(){
        // image in dataUrl
        this.setState({croppedImageBase64: this.cropper.current.getCroppedCanvas().toDataURL("image/jpeg",0.9)})
    }

    setRedirect(redirect) {
        this.setState({redirect});
    }

    fileInputToBase64 = async (file) => {
        const profilePictureReader = new FileReader();
        if(file){
            await profilePictureReader.readAsDataURL(file)
            let returnBase64;
            profilePictureReader.onloadend = async () => {
                returnBase64 = profilePictureReader.result.toString();
                if (JSON.stringify(this.state.formInputImageBase64) !== JSON.stringify(returnBase64)) {
                    this.setState({ formInputImageBase64: returnBase64 })
                }
            }
        }
    }

    onCropMove(minAspectRatio, maxAspectRatio) {
        if(minAspectRatio && maxAspectRatio){
            const cropBoxData = this.cropper.current.getCropBoxData();
            var cropBoxWidth = cropBoxData.width;
            var aspectRatio = cropBoxWidth / cropBoxData.height;

            if (aspectRatio < minAspectRatio) {
                this.cropper.current.setCropBoxData({
                    height: cropBoxWidth / minAspectRatio
                });
            } else if (aspectRatio > maxAspectRatio) {
                this.cropper.current.setCropBoxData({
                    height: cropBoxWidth / maxAspectRatio
                });
            }
        }
    }

    render() {
        const {classes} = this.props;
        const {formInputImageBase64, croppedImageBase64, redirect, cropperImage, cropperType} = this.state;
        const FILE_SIZE = 3 * 1000 * 1000; //3 MB
        const SUPPORTED_FORMATS = [
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/gif",
        ];
        const validationSchema = yup.object().shape({
            recaptcha: yup.array(),
            profilePicture: yup
                .mixed()
                .required("A profile picture is required")
                .test(
                "fileSize",
                "File too large (Limit is " + FILE_SIZE/1000/1000 + " MB)",
                value => value && value.size <= FILE_SIZE
                )
                .test(
                "fileFormat",
                "Unsupported Format",
                value => value && SUPPORTED_FORMATS.includes(value.type)
                ),
            });
        let maxAspectRatio = null;
        let minAspectRatio = null;
        let aspectRatio = 1 / 1;
        if(cropperType === "cover"){
            maxAspectRatio = 16 / 10;
            minAspectRatio = 1 / 1;
            aspectRatio = null;
        }
        return(
            
            <Fragment>
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect &&
                    <Fragment>
                        <Formik
                            initialValues={{ file: "", pseudonym: "" }}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting }) => {
                                if (croppedImageBase64) {
                                    const thisPersist = this;
                                    const currentProfile = store.getState().setMyProfileMetaData;
                                    fetch(croppedImageBase64)
                                    .then(res => res.blob())
                                    .then(async (blob) => {
                                        const croppedImageFileReader = new FileReader();
                                        await croppedImageFileReader.readAsArrayBuffer(blob);
                                        croppedImageFileReader.onloadend = () => {
                                            const croppedPictureData = Buffer.from(croppedImageFileReader.result);
                                            uploadToIPFS(croppedPictureData).then(async (IpfsImageUploadResponse) => {
                                                if(cropperType === "profile") {
                                                    const IpfsCroppedImageHash = IpfsImageUploadResponse[0]['hash'];
                                                    await editProfileImage(currentProfile.id, IpfsCroppedImageHash);
                                                    const profileMetaData = Object.assign(currentProfile, {profilePictureIpfsHash: IpfsCroppedImageHash});
                                                    store.dispatch(setMyProfileMetaData(Object.assign(profileMetaData)))
                                                    thisPersist.setRedirect(`/${profileMetaData.pseudonym}`);
                                                }else if(cropperType === "cover"){
                                                    const IpfsCroppedImageHash = IpfsImageUploadResponse[0]['hash'];
                                                    await editCoverImage(currentProfile.id, IpfsCroppedImageHash);
                                                    const profileMetaData = Object.assign(currentProfile, {coverPictureIpfsHash: IpfsCroppedImageHash});
                                                    store.dispatch(setMyProfileMetaData(Object.assign(profileMetaData)))
                                                    thisPersist.setRedirect(`/${profileMetaData.pseudonym}`);
                                                }
                                            })
                                        }
                                    })
                                }
                            }}
                        >
                            {({ isSubmitting, setFieldValue, values }) => (
                                <Form>
                                    <div className={classes.titleElementContainer}>
                                        <Typography align="left" variant="h6" component="h2">
                                            Set {capitaliseFirstLetter(cropperType)} Image:
                                        </Typography>
                                        <Field type="file" name="profilePicture" placeholder="Profile Picture" component={SimpleFileUpload}/>
                                    </div>
                                    {(values.profilePicture && this.fileInputToBase64(values.profilePicture) && formInputImageBase64) &&
                                        <Fragment>
                                            <Cropper
                                                ref={this.cropper}
                                                src={formInputImageBase64}
                                                aspectRatio={aspectRatio}
                                                style={{height: 500, width: '100%'}}
                                                viewMode={2}
                                                autoCropArea={1}
                                                guides={true}
                                                zoomOnWheel={false}
                                                crop={debounce(this.crop.bind(this), 250)}
                                                cropmove={(e) => debounce(this.onCropMove(minAspectRatio, maxAspectRatio), 150)}
                                            />
                                            <div className={classes.previewContainer}>
                                                <Button type="submit" aria-label="Submit" disabled={isSubmitting} variant="contained" color="primary" size="large" className={classes.button}>
                                                    <SaveIcon className={classes.extendedIcon} />
                                                    Save
                                                </Button>
                                                <h2>Preview</h2>
                                                <img className={classes.previewImage} src={croppedImageBase64}></img>
                                            </div>
                                        </Fragment>
                                    }
                                </Form>
                            )}
                        </Formik>
                    </Fragment>
                }
            </Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(PersonaImageSettings);