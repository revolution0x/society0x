import React, { Component, Fragment } from "react";
import {withStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import RegisterIcon from "@material-ui/icons/LeakAdd";
import EditProfileIcon from "@material-ui/icons/AssignmentInd";
import Button from "@material-ui/core/Button";
import {withRouter} from "react-router";
//import PostCollection from "./../PostCollection";
import {
    getProfileFromNameOrAddress,
    createConnectionRequest,
    acceptConnectionRequest,
    terminateConnection,
    isAddress,
    refreshConnectionStatus,
    cancelOutgoingConnectionRequest
} from "../../services/society0x";
import {debounce} from "../../utils";
import Blockie from '../BlockiesIdenticon';
import {store} from "../../state";
import {IPFS_DATA_GATEWAY} from "../../utils/constants";
import { WrapConditionalLink } from "../WrapConditionalLink"

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    button: {
        marginTop: theme.spacing(1),
        width: '100%'
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    profileContainer: {
        position: "relative",
        overflow: "inherit",
        textAlign: "left",
    },
    profileIntroUpperLayer: {
        zIndex: 10,
        overflow: "inherit",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    profileLowerLayer: {
        marginTop: theme.spacing(2),
        zIndex: 5,
        overflow: "inherit",
        position: "relative",
    },
    cardPadding: {
        padding: theme.spacing(2),
    },
    profilePicCard: {
        maxWidth: "315px",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: '1'
    },
    coverImageContainer: {
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 130px)',
        minHeight: 'calc(100vh - 130px)',
        minWidth: '100%',
        overflow: "hidden",
        borderRadius: theme.shape.borderRadius,
        position: 'relative',
    },
    coverImageInner: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateY(-50%)translateX(-50%)',
        minWidth: '100%',
    },
    coverImageContainerPreview: {
        maxWidth: '100%',
        maxHeight: 'calc(50vh)',
        minHeight: 'calc(500px)',
        minWidth: '100%',
        overflow: "hidden",
        borderRadius: theme.shape.borderRadius,
        position: 'relative',
    },
    coverImg: {
        minWidth: '100%',
        display:'flex',
    },
    profileImgContainer: {
        backgroundColor: 'black',
        minHeight: 'calc(315px - 32px)',
        minWidth: 'calc(315px - 32px)',
        marginBottom: '16px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
    },
    profileImgInner: {
        display: 'flex'
    }
})

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            minCoverHeight: null,
            profileName: "Loading...",
            requestedPersonaLink: props.requestedPersona,
            hideButtons: props.hideButtons || true,
            profileEthereumAddress: false,
            isPendingIncomingConnectionState: false,
            isPendingOutgoingConnectionState: false,
            isEstablishedConnectionState: false,
        };
        this.profileIntroUpperLayer = React.createRef();
        this.coverImage = React.createRef();
        this.profileImage = React.createRef();
        this.profileIntroContainer = React.createRef();
        store.subscribe(() => {
            const reduxState = store.getState();
            const { profileEthereumAddress } = this.state;
            let isPendingIncomingConnectionState = false;
            let isPendingOutgoingConnectionState = false;
            let isEstablishedConnectionState = null;
            let hideConnectionButtons = reduxState.myProfileMetaData.pseudonym ? false : true;
            if (reduxState.myProfileMetaData && profileEthereumAddress) {
                const myProfileEthereumAddress = reduxState.myProfileMetaData.id;
                if(profileEthereumAddress.toLowerCase() !== myProfileEthereumAddress.toLowerCase()){
                    if(reduxState.personaConnectionsEstablished.indexOf(profileEthereumAddress) > -1){
                        isEstablishedConnectionState = true;
                    }
                    if(reduxState.personaConnectionsIncoming.indexOf(profileEthereumAddress) > -1){
                        isPendingIncomingConnectionState = true;
                    }
                    if(reduxState.personaConnectionsOutgoing.indexOf(profileEthereumAddress) > -1){
                        isPendingOutgoingConnectionState = true;
                    }
                }
                this.setState({
                    myProfileEthereumAddress,
                    isPendingIncomingConnectionState,
                    isPendingOutgoingConnectionState,
                    isEstablishedConnectionState,
                    hideButtons: hideConnectionButtons,
                })
            } else if(reduxState.myProfileMetaData) {
                const myProfileEthereumAddress = reduxState.myProfileMetaData.id;
                this.setState({
                    myProfileEthereumAddress,
                    hideButtons: hideConnectionButtons,
                })
            }
        });
    }

    componentDidUpdate = async (prevProps) => {
        if(this.props.requestedPersona !== prevProps.requestedPersona) {
            try {
                this.resize();
                let { requestedPersonaLink } = this.state;
                const {requestedPersona} = this.props;
                let memberProfile = await getProfileFromNameOrAddress(requestedPersona);
                let profileEthereumAddress = memberProfile[0];
                let profileName = memberProfile[1];
                if(isAddress(requestedPersona)){
                    requestedPersonaLink = profileName;
                }
                let profilePictureIpfsHash = memberProfile[2];
                let coverPictureIpfsHash = memberProfile[3];
                let myProfileEthereumAddress = null;
                let myProfilePseudonym = null;
                if(store.getState().myProfileMetaData){
                    myProfileEthereumAddress = await store.getState().myProfileMetaData.id;
                    myProfilePseudonym = await store.getState().myProfileMetaData.pseudonym;
                }
                if (myProfilePseudonym) {
                    refreshConnectionStatus(myProfileEthereumAddress, profileEthereumAddress);
                };
                this.setState({
                    profileName,
                    profileEthereumAddress,
                    profilePictureIpfsHash,
                    coverPictureIpfsHash,
                    myProfileEthereumAddress,
                    requestedPersonaLink,
                })
            } catch (error) {
                console.error(error);
            }
        }
    }

    componentDidMount = async () => {
        window.addEventListener('resize', debounce(this.resize, 100));
        try {
            let { requestedPersonaLink } = this.state;
            const { requestedPersona } = this.props;
            let memberProfile = await getProfileFromNameOrAddress(requestedPersona);
            let profileEthereumAddress = memberProfile[0];
            let profileName = memberProfile[1];
            if(isAddress(requestedPersona)){
                requestedPersonaLink = profileName;
            }
            let profilePictureIpfsHash = memberProfile[2];
            let coverPictureIpfsHash = memberProfile[3];
            let myProfileEthereumAddress = null;
            let myProfilePseudonym = null;
            if(store.getState().myProfileMetaData){
                myProfileEthereumAddress = await store.getState().myProfileMetaData.id;
                myProfilePseudonym = await store.getState().myProfileMetaData.pseudonym;
            }
            if (myProfilePseudonym) {
                refreshConnectionStatus(myProfileEthereumAddress, profileEthereumAddress);
            };
            this.resize();
            this.setState({
                profileName,
                profilePictureIpfsHash,
                coverPictureIpfsHash,
                profileEthereumAddress,
                myProfileEthereumAddress,
                requestedPersonaLink,
            })
            
        } catch (error) {
            console.error(error);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    resize = () => {
        const { current : profileIntroUpperLayerElement } = this.profileIntroUpperLayer;
        const { current : profileIntroContainerElement } = this.profileIntroContainer;
        const { current : coverImage } = this.coverImage;
        const { coverImageBreakPoint } = this.state;
        if (profileIntroUpperLayerElement && profileIntroContainerElement && coverImage) {
            let profileIntroUpperLayerHeight = profileIntroUpperLayerElement.clientHeight;
            let profileIntroContainerWidth = profileIntroContainerElement.clientWidth;
            let profileIntroContainerHeight = profileIntroContainerElement.clientHeight;
            let coverImageCurrentHeight = coverImage.clientHeight;
            let coverImageCurrentWidth = coverImage.clientWidth;
            let coverImageNaturalHeight = coverImage.naturalHeight;
            let coverImageNaturalWidth = coverImage.naturalWidth;
            let naturalAspectRatio = (coverImageNaturalWidth / coverImageNaturalHeight).toFixed(2);
            let currentAspectRatio = (coverImageCurrentWidth / coverImageCurrentHeight).toFixed(2);
            let minCoverHeight = profileIntroUpperLayerHeight + 120;
            if (((currentAspectRatio !== naturalAspectRatio) || (coverImageCurrentHeight < profileIntroContainerHeight)) && (!coverImageBreakPoint || profileIntroContainerWidth <= coverImageBreakPoint) && (coverImageCurrentHeight < profileIntroContainerHeight)) {
                let coverImageStyleOverride = { minHeight: minCoverHeight, maxWidth: naturalAspectRatio * minCoverHeight, left: '50%', position: 'relative', transform: 'translateX(-50%)' };
                if (!this.state.coverImageBreakPoint) {
                    this.setState({ coverImageStyleOverride, maxCoverHeight: coverImageCurrentHeight })
                } else {
                    this.setState({ coverImageStyleOverride, maxCoverHeight: coverImageCurrentHeight, coverImageBreakPoint: profileIntroContainerWidth })
                }
            } else if (coverImageCurrentWidth < profileIntroContainerWidth) {
                let coverImageStyleOverride = { minHeight: minCoverHeight, minWidth: '100%' };
                this.setState({ coverImageStyleOverride, maxCoverHeight: coverImageCurrentHeight})
            } else if (coverImageCurrentHeight > profileIntroContainerHeight) {
                this.setState({ maxCoverHeight: coverImageCurrentHeight})
            }
        }
    }

    coverHasLoaded(e) {
        if(e.target && e.target.height > 0) {
            let profileIntroUpperLayerHeight = this.profileIntroUpperLayer.current.clientHeight;
            let minCoverHeight = profileIntroUpperLayerHeight + 120;
            this.resize();
            if(minCoverHeight !== this.state.minCoverHeight) {
                this.setState({minCoverHeight});
            }
        }
    }

    processCreateConnectionRequest = async (myProfileEthereumAddress, profileEthereumAddress) => {
        await createConnectionRequest(myProfileEthereumAddress, profileEthereumAddress);
    }

    processAcceptConnectionRequest = async (myProfileEthereumAddress, profileEthereumAddress) => {
        await acceptConnectionRequest(myProfileEthereumAddress, profileEthereumAddress);
    }

    processTerminateConnection = async (myProfileEthereumAddress, profileEthereumAddress) => {
        await terminateConnection(myProfileEthereumAddress, profileEthereumAddress);
    }

    processCancelConnectionRequest = async (myProfileEthereumAddress, profileEthereumAddress) => {
        await cancelOutgoingConnectionRequest(myProfileEthereumAddress, profileEthereumAddress);
    }

    render() {
        const {
            classes,
            isPreview,
            isLinkToProfile
        } = this.props;
        const {
            minCoverHeight,
            maxCoverHeight,
            profileEthereumAddress,
            profilePictureIpfsHash,
            coverPictureIpfsHash,
            coverImageStyleOverride,
            profileName,
            myProfileEthereumAddress,
            isEstablishedConnectionState,
            isPendingIncomingConnectionState,
            isPendingOutgoingConnectionState,
            requestedPersonaLink,
            hideButtons
        } = this.state;
        let minCoverHeightStyle = {};
        if(minCoverHeight > 0){
            minCoverHeightStyle = {
                minHeight: minCoverHeight,
                height: maxCoverHeight,
            }
        }
        let coverImageContainerClass = classes.coverImageContainer;
        if(isPreview) {
            coverImageContainerClass = classes.coverImageContainerPreview;
        }
        return (
            <React.Fragment>
                <div className={"text-align-center"}>
                    <div className={["max-page-width auto-margins",classes.profileContainer].join(" ")}>
                            <WrapConditionalLink condition={isLinkToProfile} to={`/${requestedPersonaLink}`}>
                                <Card className={[classes.profileIntroUpperLayer].join(" ")} ref={this.profileIntroContainer}>
                                    <Card ref={this.profileIntroUpperLayer} raised className={["max-page-width auto-margins", classes.cardPadding, classes.profilePicCard].join(" ")}>
                                        {profilePictureIpfsHash &&
                                            <div className={classes.profileImgContainer}>
                                                <div className={classes.profileImgInner}>
                                                    <img className={classes.profileImg} ref={this.profileImage} src={IPFS_DATA_GATEWAY + profilePictureIpfsHash} alt="Profile"></img>
                                                </div>
                                            </div>
                                        }
                                        {!profilePictureIpfsHash &&
                                            <div className={classes.profileImgContainer}>
                                                <Blockie seed={profileEthereumAddress} size={15} scale={19}></Blockie>
                                            </div>
                                        }
                                        <Typography variant="h4" gutterBottom component="h2">
                                            {profileName}
                                        </Typography>
                                        <div>
                                        {(!hideButtons && profileEthereumAddress && (myProfileEthereumAddress === profileEthereumAddress)) && <Button onClick={() => this.props.history.push('/settings/persona')} variant="contained" color="primary" size="large" className={classes.button}>
                                            <EditProfileIcon className={classes.extendedIcon} />
                                            Edit Profile
                                        </Button>}
                                        {(!hideButtons && profileEthereumAddress && (myProfileEthereumAddress !== profileEthereumAddress)) && 
                                        <Fragment>
                                            {(!isPendingOutgoingConnectionState && !isPendingIncomingConnectionState && !isEstablishedConnectionState) &&
                                                <Button onClick={() => this.processCreateConnectionRequest(myProfileEthereumAddress, profileEthereumAddress)} variant="contained" color="primary" size="large" className={classes.button}>
                                                    <RegisterIcon className={classes.extendedIcon} />
                                                    Connect
                                                </Button>
                                            }
                                            {(isPendingOutgoingConnectionState && !isEstablishedConnectionState) &&
                                                <Button onClick={() => this.processCancelConnectionRequest(myProfileEthereumAddress, profileEthereumAddress)} variant="contained" color="primary" size="large" className={classes.button}>
                                                    <RegisterIcon className={classes.extendedIcon} />
                                                    Connection Pending
                                                </Button>
                                            }
                                            {(isPendingIncomingConnectionState && !isEstablishedConnectionState) &&
                                                <Button onClick={() => this.processAcceptConnectionRequest(myProfileEthereumAddress, profileEthereumAddress)} variant="contained" color="primary" size="large" className={classes.button}>
                                                    <RegisterIcon className={classes.extendedIcon} />
                                                    Accept Connection
                                                </Button>
                                            }
                                            {(isEstablishedConnectionState) &&
                                                <Button onClick={() => this.processTerminateConnection(myProfileEthereumAddress, profileEthereumAddress)} variant="contained" color="primary" size="large" className={classes.button}>
                                                    <RegisterIcon className={classes.extendedIcon} />
                                                    Connected
                                                </Button>
                                            }
                                        </Fragment>}
                                        </div>
                                    </Card>
                                    <div className={[coverImageContainerClass].join(" ")} style={minCoverHeightStyle}>
                                        <div className={classes.coverImageInner}>
                                            {coverPictureIpfsHash && 
                                                <img onLoad={(e) => this.coverHasLoaded(e)} ref={this.coverImage} style={coverImageStyleOverride} className={classes.coverImg} src={IPFS_DATA_GATEWAY + coverPictureIpfsHash} alt="Cover"></img>
                                            }
                                        </div>
                                    </div>
                                </Card>
                            </WrapConditionalLink>
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

export default withRouter(withStyles(styles, { withTheme: true })(ProfilePage));