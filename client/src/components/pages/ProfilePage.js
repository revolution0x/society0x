import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import DemoImg0 from '../../images/demo-img-0.jpg';
import Fab from "@material-ui/core/Fab";
import RegisterIcon from "@material-ui/icons/LeakAdd";
import SubscribeIcon from "@material-ui/icons/AddAlert";
import BroadcastIcon from "@material-ui/icons/SettingsInputAntenna";
import Button from "@material-ui/core/Button";
import {getMemberProfileFromName} from "../../services/social0x";

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing.unit,
    },
    button: {
        marginTop: theme.spacing.unit,
        width: '100%'
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
    profileContainer: {
        position: "relative",
        overflow: "inherit",
        textAlign: "left",
    },
    profileUpperLayer: {
        zIndex: 10,
        overflow: "inherit",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyCcontent: "center",
    },
    profileLowerLayer: {
        marginTop: theme.spacing.unit * 2,
        zIndex: 5,
        overflow: "inherit",
        position: "relative",
    },
    cardPadding: {
        padding: theme.spacing.unit * 2,
    },
    profilePicCard: {
        maxWidth: "315px",
        position: "absolute",
        top: "15%",
    },
    coverImgContainer: {
        maxHeight:"80vh",
        overflow: "hidden",
        borderRadius: theme.shape.borderRadius,
    }
})

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxCoverHeight: null,
        };
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if(this.props.memberName !== prevProps.memberName) {
            try {
                const {memberName} = this.props;
                let memberProfile = await getMemberProfileFromName(memberName);
                let profilePictureIpfsHash = memberProfile[2];
                let coverPictureIpfsHash = memberProfile[3];
                this.setState({
                    profilePictureIpfsHash,
                    coverPictureIpfsHash
                })
            } catch (error) {
                console.error(error);
            }
        }
    }

    componentDidMount = async () => {
        try {
            const {memberName} = this.props;
            let memberProfile = await getMemberProfileFromName(memberName);
            console.log('memberProfile',memberProfile);
            let profilePictureIpfsHash = memberProfile[2];
            let coverPictureIpfsHash = memberProfile[3];
            this.setState({
                profilePictureIpfsHash,
                coverPictureIpfsHash
            })
        } catch (error) {
            console.error(error);
        }
    }

    coverHasLoaded(e) {
        if(e.target && e.target.height > 0) {
            let maxCoverHeight = Math.floor(e.target.height);
            if(maxCoverHeight !== this.state.maxCoverHeight) {
                this.setState({maxCoverHeight})
            }
        }
    }

    render() {
        const {classes, memberName} = this.props;
        const {maxCoverHeight, profilePictureIpfsHash, coverPictureIpfsHash} = this.state;

        const isSubmitting = false;

        let maxCoverHeightStyle = {};
        if(maxCoverHeight > 0){
            maxCoverHeightStyle = {
                maxHeight: maxCoverHeight,
            }
        }

        return (
            <React.Fragment>
                <div className={"text-align-center"}>
                    <div className={"max-page-width auto-margins " + classes.profileContainer}>
                        <Card className={classes.profileUpperLayer}>
                            <Card raised className={"max-page-width auto-margins " + classes.cardPadding + " " + classes.profilePicCard}>
                                {profilePictureIpfsHash && <img src={"https://ipfs.infura.io/ipfs/" + profilePictureIpfsHash} alt="Profile"></img>}
                                <Typography variant="h4" component="h2">
                                    {memberName}
                                </Typography>
                                <Typography variant="h5">
                                    @{memberName}
                                </Typography>
                                <div>
                                <Button variant="contained" color="primary" size="large" className={classes.button}>
                                    <RegisterIcon className={classes.extendedIcon} />
                                    Connect
                                </Button>
                                <Button variant="contained" color="primary" size="large" className={classes.button}>
                                    <SubscribeIcon className={classes.extendedIcon} />
                                    <span>Subscribe</span>
                                </Button>
                                <Button variant="contained" color="primary" size="large" className={classes.button}>
                                    <BroadcastIcon className={classes.extendedIcon} />
                                    <span>Broadcast</span>
                                </Button>
                                </div>
                            </Card>
                            <div className={classes.coverImgContainer}>
                                <div style={maxCoverHeightStyle}>
                                    {coverPictureIpfsHash && <img onLoad={(e) => this.coverHasLoaded(e)} className={classes.coverReversePadding} src={"https://ipfs.infura.io/ipfs/" + coverPictureIpfsHash} alt="Cover"></img>}
                                </div>
                            </div>
                        </Card>
                        {/* <Card className={classes.profileLowerLayer}>
                            <p>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                            </p>
                        </Card> */}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(ProfilePage);