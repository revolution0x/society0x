import React, { Component, Fragment } from "react";
import {withStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import DemoImg0 from '../../images/demo-img-0.jpg';
import Fab from "@material-ui/core/Fab";
import RegisterIcon from "@material-ui/icons/LeakAdd";
import EditProfileIcon from "@material-ui/icons/AssignmentInd";
import Button from "@material-ui/core/Button";
import {withRouter} from "react-router";
//import PostCollection from "./../PostCollection";
import {getProfileFromName} from "../../services/society0x";
import {debounce} from "../../utils";
import Blockie from '../BlockiesIdenticon';
import {store} from "../../state";
import {IPFS_DATA_GATEWAY} from "../../utils/constants";

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
    profileIntroUpperLayer: {
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
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: '1'
    },
    coverImgContainer: {
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 130px)',
        minHeight: 'calc(100vh - 130px)',
        minWidth: '100%',
        overflow: "hidden",
        borderRadius: theme.shape.borderRadius,
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
})

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            minCoverHeight: null,
            profileName: "Loading...",
        };
        this.profileIntroUpperLayer = React.createRef();
        this.coverImage = React.createRef();
        this.profileImage = React.createRef();
        this.profileIntroContainer = React.createRef();
        store.subscribe(() => {
            if (store.getState().setMyProfileMetaData) {
                let myProfileEthereumAddress = store.getState().setMyProfileMetaData.id
                this.setState({
                    myProfileEthereumAddress
                })
            }
        });
    }

    componentDidUpdate = async (prevProps) => {
        if(this.props.requestedPersona !== prevProps.requestedPersona) {
            try {
                const {requestedPersona} = this.props;
                let memberProfile = await getProfileFromName(requestedPersona);
                let profileEthereumAddress = memberProfile[0];
                let profileName = memberProfile[1];
                let profilePictureIpfsHash = memberProfile[2];
                let coverPictureIpfsHash = memberProfile[3];
                this.resize();
                this.setState({
                    profileName,
                    profileEthereumAddress,
                    profilePictureIpfsHash,
                    coverPictureIpfsHash,
                })
            } catch (error) {
                console.error(error);
            }
        }
    }

    componentDidMount = async () => {
        window.addEventListener('resize', debounce(this.resize, 250));
        try {
            const {requestedPersona} = this.props;
            let memberProfile = await getProfileFromName(requestedPersona);
            let profileEthereumAddress = memberProfile[0];
            let profileName = memberProfile[1];
            let profilePictureIpfsHash = memberProfile[2];
            let coverPictureIpfsHash = memberProfile[3];
            let myProfileEthereumAddress = null;
            if(store.getState().setMyProfileMetaData){
                myProfileEthereumAddress = store.getState().setMyProfileMetaData.id;
            }
            this.setState({
                profileName,
                profilePictureIpfsHash,
                coverPictureIpfsHash,
                profileEthereumAddress,
                myProfileEthereumAddress,
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
            if (((currentAspectRatio !== naturalAspectRatio) || (coverImageCurrentHeight < profileIntroContainerHeight)) && (!coverImageBreakPoint || profileIntroContainerWidth <= coverImageBreakPoint)) {
                let coverImageStyleOverride = { minHeight: minCoverHeight, maxWidth: naturalAspectRatio * minCoverHeight, left: '50%', position: 'relative', transform: 'translateX(-50%)' };
                if (!this.state.coverImageBreakPoint) {
                    this.setState({ coverImageStyleOverride })
                } else {
                    this.setState({ coverImageStyleOverride, coverImageBreakPoint: profileIntroContainerWidth })
                }
            } else if (coverImageCurrentWidth < profileIntroContainerWidth) {
                let coverImageStyleOverride = { minHeight: minCoverHeight, minWidth: '100%' };
                this.setState({ coverImageStyleOverride })
            }
        }
    }

    coverHasLoaded(e) {
        if(e.target && e.target.height > 0) {
            let profileIntroUpperLayerHeight = this.profileIntroUpperLayer.current.clientHeight;
            let minCoverHeight = profileIntroUpperLayerHeight + 120;
            if(minCoverHeight !== this.state.minCoverHeight) {
                this.setState({minCoverHeight})
                this.resize();
            }
        }
    }

    render() {
        const {classes, hideButtons} = this.props;
        const {minCoverHeight, profileEthereumAddress, profilePictureIpfsHash, coverPictureIpfsHash, coverImageStyleOverride, profileName, myProfileEthereumAddress} = this.state;
        let minCoverHeightStyle = {};
        if(minCoverHeight > 0){
            minCoverHeightStyle = {
                minHeight: minCoverHeight
            }
        }
        return (
            <React.Fragment>
                <div className={"text-align-center"}>
                    <div className={["max-page-width auto-margins",classes.profileContainer].join(" ")}>
                            <Card className={[classes.profileIntroUpperLayer].join(" ")} ref={this.profileIntroContainer}>
                                <Card ref={this.profileIntroUpperLayer} raised className={["max-page-width auto-margins", classes.cardPadding, classes.profilePicCard].join(" ")}>
                                    {profilePictureIpfsHash &&
                                        <div className={classes.profileImgContainer}>
                                            <img className={classes.profileImg} ref={this.profileImage} src={IPFS_DATA_GATEWAY + profilePictureIpfsHash} alt="Profile"></img>
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
                                        <Button variant="contained" color="primary" size="large" className={classes.button}>
                                            <RegisterIcon className={classes.extendedIcon} />
                                            Connect
                                        </Button>
                                    </Fragment>}
                                    </div>
                                </Card>
                                <div className={classes.coverImgContainer} style={minCoverHeightStyle}>
                                    {coverPictureIpfsHash && 
                                        <img onLoad={(e) => this.coverHasLoaded(e)} ref={this.coverImage} style={coverImageStyleOverride} className={classes.coverImg} src={IPFS_DATA_GATEWAY + coverPictureIpfsHash} alt="Cover"></img>
                                    }
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

export default withRouter(withStyles(styles, { withTheme: true })(ProfilePage));