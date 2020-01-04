import React, { Component, Fragment } from 'react';
import Cropper from 'react-cropper';
import { Formik, Form, Field } from 'formik';
import { SimpleFileUpload } from 'formik-material-ui';
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import SaveIcon from '@material-ui/icons/Save';
import '../cropper.css';
import Typography from '@material-ui/core/Typography';
import {Redirect} from 'react-router-dom';

import * as yup from "yup";
import {uploadToIPFS} from "../utils/ipfs";
import {debounce, capitaliseFirstLetter, dispatchSetModalConfig, getApproxBase64FileSizeMegaBytes} from "../utils";
import {editProfileImage, editCoverImage} from "../services/society0x";
import {setMyProfileMetaData} from "../state/actions";
import {store} from '../state';


const styles = theme => ({
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    button: {
        width: '100%'
    },
    previewTitle: {
        marginTop: theme.spacing(2),
    },
    previewContainer: {
        textAlign: 'center',
    },
    titleElementContainer: {
        padding: theme.spacing(2),
        paddingTop: '0px',
    },
    titleContainer: {
        padding: theme.spacing(2),
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
            fileSizeExceeded: false,
        }
        this.cropper = React.createRef();
        this.setRedirect = this.setRedirect.bind(this);
        this.fileInputToBase64 = this.fileInputToBase64.bind(this);
    }

    crop(){
        // image in dataUrl
        let croppedImageBase64Data = this.cropper.current.getCroppedCanvas().toDataURL("image/jpeg",0.9);
        let y = 1;
        if(croppedImageBase64Data.slice(-2) === "==") {
            y = 2;
        }
        let croppedImageSize = getApproxBase64FileSizeMegaBytes(croppedImageBase64Data.length, y);
        let fileSizeExceeded = false;
        if(croppedImageSize > 3) {
            dispatchSetModalConfig({
                stage: `image_cropper_file_size_exceeded`,
                disableBackdropClick: false,
                substituteValue1: '3 MB',
                show: true,
            });
            fileSizeExceeded = true;
        }
        this.setState({croppedImageBase64: croppedImageBase64Data, fileSizeExceeded});
        if(this.props.parentReference) {
            this.props.parentReference(croppedImageBase64Data)
        }
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
        const {
            classes,
            hideSaveButton = false,
            alignInput = false,
            titleElementHorizontalPadding = true,
            cropperHeight = 500,
            includeForm = true,
        } = this.props;
        const {formInputImageBase64, croppedImageBase64, redirect, cropperType, fileSizeExceeded} = this.state;
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
                // .test(
                // "fileSize",
                // "File too large (Limit is " + FILE_SIZE/1000/1000 + " MB)",
                // value => value && value.size <= FILE_SIZE
                // )
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
        let titleElementStyle = null;
        if(alignInput === "left") {
            titleElementStyle = {textAlign: "left"};
        }
        if(titleElementHorizontalPadding === false) {
            Object.assign(titleElementStyle, {paddingLeft: "0px", paddingRight: "0px"})
        }
        let committedHiddenSaveButton = false;
        if(hideSaveButton || fileSizeExceeded) {
            committedHiddenSaveButton = true;
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
                                    const currentProfile = store.getState().myProfileMetaData;
                                    fetch(croppedImageBase64)
                                    .then(res => res.blob())
                                    .then(async (blob) => {
                                        const croppedImageFileReader = new FileReader();
                                        await croppedImageFileReader.readAsArrayBuffer(blob);
                                        croppedImageFileReader.onloadend = () => {
                                            const croppedPictureData = Buffer.from(croppedImageFileReader.result);
                                            dispatchSetModalConfig({
                                                stage: `uploading_persona_${cropperType}_picture_pending`,
                                                disableBackdropClick: false,
                                                show: true,
                                            });
                                            uploadToIPFS(croppedPictureData).then(async (IpfsImageUploadResponse) => {
                                                if(cropperType === "profile") {
                                                    const IpfsCroppedImageHash = IpfsImageUploadResponse[0]['hash'];
                                                    let profilePictureSettingResponse = await editProfileImage(currentProfile.id, IpfsCroppedImageHash);
                                                    if(profilePictureSettingResponse){
                                                        const profileMetaData = Object.assign(currentProfile, {profilePictureIpfsHash: IpfsCroppedImageHash});
                                                        store.dispatch(setMyProfileMetaData(Object.assign(profileMetaData)))
                                                    }
                                                }else if(cropperType === "cover"){
                                                    const IpfsCroppedImageHash = IpfsImageUploadResponse[0]['hash'];
                                                    await editCoverImage(currentProfile.id, IpfsCroppedImageHash);
                                                    const profileMetaData = Object.assign(currentProfile, {coverPictureIpfsHash: IpfsCroppedImageHash});
                                                    store.dispatch(setMyProfileMetaData(Object.assign(profileMetaData)))
                                                }
                                            })
                                        }
                                    }).catch(setSubmitting(false));
                                }
                            }}
                        >
                            {({ isSubmitting, values }) => {
                                let innerContent = (
                                    <Fragment>
                                        <div className={classes.titleElementContainer} style={titleElementStyle}>
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
                                                    style={{height: cropperHeight, width: '100%'}}
                                                    viewMode={2}
                                                    autoCropArea={1}
                                                    guides={true}
                                                    zoomOnWheel={false}
                                                    crop={debounce(this.crop.bind(this), 250)}
                                                    cropmove={(e) => debounce(this.onCropMove(minAspectRatio, maxAspectRatio), 150)}
                                                />
                                                <div className={classes.previewContainer}>
                                                    <Button style={committedHiddenSaveButton ? {"display": "none"} : null} type="submit" aria-label="Submit" disabled={isSubmitting} variant="contained" color="primary" size="large" className={classes.button}>
                                                        <SaveIcon className={classes.extendedIcon} />
                                                        Save
                                                    </Button>
                                                    <h2 className={classes.previewTitle}>Preview</h2>
                                                    <img alt="Cropped Preview" className={classes.previewImage} src={croppedImageBase64}></img>
                                                </div>
                                            </Fragment>
                                        }
                                    </Fragment>
                                )
                                if(includeForm){
                                    return (
                                        <Form>
                                            {innerContent}
                                        </Form>
                                    )
                                }else{
                                    return (
                                        innerContent
                                    )
                                }
                            }}
                        </Formik>
                    </Fragment>
                }
            </Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(PersonaImageSettings);