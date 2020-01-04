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
import {Redirect} from 'react-router-dom';

var Buffer = require('buffer/').Buffer

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    inputMargin: {
        marginBottom: theme.spacing(2),
    }
});

class CreationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    setRedirect(redirect) {
        this.setState({redirect});
    }
    
    render(){
        const {redirect} = this.state;
        const {classes, creationType} = this.props;
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
        coverPicture: yup
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
        pseudonym: yup
            .string()
            .required("A pseudonym is required")
            .test('len', 'Must be more than 0 characters and less than 24 characters', val => (val && (val.length >= 0) && (val.length <= 24)))
        });
        return(
            <div className={"center"}>
                {redirect && 
                    <Redirect to={redirect}/>
                }
                {!redirect && 
                    <Formik
                    initialValues={{ file: "", pseudonym: "" }}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    onSubmit={async (values, { setSubmitting }) => {
                        const currentId = store.getState().myProfileMetaData.id;
                        const profilePictureReader = new FileReader();
                        const coverPictureReader = new FileReader();
                        const pseudonym = values.pseudonym;
                        await profilePictureReader.readAsArrayBuffer(values.profilePicture)
                        profilePictureReader.onloadend = function() {
                            let profilePictureData = Buffer.from(profilePictureReader.result);
                            coverPictureReader.readAsArrayBuffer(values.coverPicture)
                            coverPictureReader.onloadend = function () {
                                let coverPictureData = Buffer.from(coverPictureReader.result);
                                uploadToIPFS([profilePictureData, coverPictureData]).then(async (IpfsImageUploadResponse) => {
                                    
                                });
                            };
                        };
                    }}
                    >
                    {({ isSubmitting }) => (
                        <Form>
                            <Fab color="primary" variant="extended" type="submit" disabled={isSubmitting} aria-label="Submit" className={classes.fab}>
                                <CreateIcon className={classes.extendedIcon} />
                                Create
                            </Fab>
                            {/* <pre>{JSON.stringify({name: values.file.name, type: values.file.type, size: values.file.size})}</pre> */}
                        </Form>
                    )}
                    </Formik>
                }
            </div>
        )
    }
};

export default withStyles(styles, {withTheme: true})(CreationForm);