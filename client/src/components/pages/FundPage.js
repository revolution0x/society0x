import React, { Component, Fragment } from "react";
import {withStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import Button from "@material-ui/core/Button";
import LinearProgressBuffer from "../LinearProgressBuffer";
import DonateButton from "../DonateButton";
import OurChartContainerVX from "../charts/VX/OurChartContainerVX";
import FundPageTabs from "../FundPageTabs";
import {withRouter} from "react-router";
import {
    fetchSociety0xFundFromUrlSlug,
    fetchSociety0xFundMilestones,
    updateFundIdTimeseries,
    fetchValueForwardableToBeneficiary,
    forwardFundsToBeneficiary,
    isFundManager,
    isFundOverLatestMilestone,
} from "../../services/society0x";
import {debounce} from "../../utils";
import {store} from "../../state";
import {IPFS_DATA_GATEWAY} from "../../utils/constants";
import {
    weiToEther,
    tokenValueFormatDisplay,
    percToColor,
    percentageOf,
    openSetPledgeRevocationModal,
    openSetFundMilestoneModal,
    toNumber,
} from "../../utils";
import { WrapConditionalLink } from "../WrapConditionalLink"
import {
    setFundBalances,
    setFundBeneficiaryWithdrawn
} from "../../state/actions";

const styles = theme => ({
    fab: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    button: {
        marginTop: theme.spacing(1),
        width: '100%',
        color: 'white!important',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    profileContainer: {
        position: "relative",
        overflow: "inherit",
        textAlign: "center",
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
        width: "calc(100% - 5vw)",
        position: "absolute",
        top: "100%",
        transform: "translateY(-50%)",
        zIndex: '1',
        overflow: 'visible'
    },
    profilePicCardPreview: {
        width: "calc(100% - 10vw)",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: '1'
    },
    coverImgContainer: {
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 260px)',
        minHeight: 'calc(100vh - 260px)',
        minWidth: '100%',
        overflow: "hidden",
        borderRadius: theme.shape.borderRadius,
    },
    coverImgContainerPreview: {
        maxWidth: '100%',
        maxHeight: 'calc(400px)',
        minHeight: 'calc(400px)',
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
    fundTitle: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
        width: 'calc(100% - 220px)',
        display: 'inline-block',
        textAlign: 'left',
        lineHeight: '40px',
    },
    progressBar: {
        marginBottom: theme.spacing(1)
    },
    donateButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
        display: 'inline-block',
        verticalAlign: 'top',
    },
    titleWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    milestoneAchieved: {
        color: 'limegreen'
    },
    milestonePending: {
        color: 'red'
    },
    chartContainer: {
        marginTop: theme.spacing(4),
    },
    variableActionContainer: {
        marginTop: theme.spacing(12)
    }
});

class FundPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            minCoverHeight: null,
            fundName: "Loading...",
            fundId: false,
            fundUrlSlug: props.fundUrlSlug ? props.fundUrlSlug : '',
            coverPictureIpfsHash: "",
            lastTarget: 0,
            nextTarget: 0,
            signalReceived: 0,
            timeseriesData: [],
            completedProgressLinearBuffer: 0,
            bufferMilestones: [],
            fundMilestones: [],
            recipient: false,
            fundsWithdrawable: 0,
            valueForwardableToBeneficiary: 0,
        };
        this.profileIntroUpperLayer = React.createRef();
        this.coverImage = React.createRef();
        this.profileImage = React.createRef();
        this.profileIntroContainer = React.createRef();
        store.subscribe(() => {
            const reduxState = store.getState();
            const {myProfileMetaData, fundBalances} = reduxState;
            const {fundId, timeseriesData, fundMilestones} = this.state;
            if (
                myProfileMetaData && ((myProfileMetaData.id !== this.state.account) ||
                (fundId && fundBalances && fundBalances[fundId] && (fundBalances[fundId] !== this.state.signalReceived)))
            ) {
              this.setState({
                account: reduxState.myProfileMetaData.id,
                signalReceived: reduxState.fundBalances[fundId],
              });
            }
            let hasLatestTimeChanged = false;
            const reduxTimeseriesData = reduxState.fundTimeseries[fundId];
            if(timeseriesData[timeseriesData.length - 1] && reduxTimeseriesData && reduxTimeseriesData[reduxTimeseriesData.length - 1]){
                hasLatestTimeChanged = timeseriesData[timeseriesData.length - 1].xAxisValue !== reduxTimeseriesData[reduxTimeseriesData.length - 1].xAxisValue;
            }
            if(
                reduxState && reduxState.fundTimeseries[fundId] && reduxState.fundMilestones[fundId] && timeseriesData &&
                ((reduxState.fundTimeseries[fundId].length !== timeseriesData.length) || hasLatestTimeChanged || (reduxState.fundMilestones[fundId].length !== fundMilestones.length))
            ) {
                const mostRecentMilestones = reduxState.fundMilestones[fundId];
                const { recipient } = this.state;
                const signalReceived = reduxState.fundBalances[fundId];
                let nextTarget = mostRecentMilestones && mostRecentMilestones.length > 0 ? mostRecentMilestones[mostRecentMilestones.length - 1] : 0;
                let lastTarget = 0;
                if (mostRecentMilestones.length > 2) {
                    lastTarget = mostRecentMilestones[mostRecentMilestones.length - 2];
                }
                let bufferMilestones = this.generateBufferMilestones({fundMilestones: mostRecentMilestones, nextTarget, signalReceived, lastTarget, recipient});
                this.setState({
                    timeseriesData: [...reduxState.fundTimeseries[fundId]],
                    bufferMilestones: [...bufferMilestones],
                    fundMilestones: [...reduxState.fundMilestones[fundId]],
                    nextTarget: nextTarget,
                    lastTarget: lastTarget,
                    signalReceived: signalReceived,
                    isFundOverLatestMilestone: reduxState.fundOverLatestMilestone[fundId] || false,
                    fundsWithdrawable: reduxState.fundWithdrawable[fundId],
                    valueForwardableToBeneficiary: reduxState.fundForwardableToBeneficiary[fundId],
                });
            }
        });
    }

    generateBufferMilestones = ({fundMilestones, nextTarget, signalReceived, recipient}) => {
        let bufferMilestones = [];
        if(fundMilestones && fundMilestones.length > 0) {
            bufferMilestones = fundMilestones.map((item, index) => {
                const milestoneCompletion = percentageOf(signalReceived, item);
                let forceVisible = false;
                if(index === 1 || index === (fundMilestones.length - 1)){
                    forceVisible = true;
                }
                let value = item * 100 / nextTarget * 1;
                if((signalReceived * 1) >= (nextTarget * 1)) {
                    value= item * 95 / signalReceived * 1;
                }
                return {
                    label: tokenValueFormatDisplay(item, 2, "dB"),
                    value: value,
                    forceVisible: forceVisible,
                    milestoneCompletion: milestoneCompletion,
                    recipient: recipient,
                }
            });
        }
        return bufferMilestones;
    }

    componentDidUpdate = async (prevProps, prevState) => {
        const { fundUrlSlug, isPreview } = this.props;
        if(fundUrlSlug !== prevProps.fundUrlSlug) {
            try {
                let fund = await fetchSociety0xFundFromUrlSlug(fundUrlSlug);
                if(!isPreview) {
                    await updateFundIdTimeseries(fund.id, fund.createdBlockTimestamp);
                }
            } catch (error) {
                console.error(error);
            }
        }
        const {timeseriesData, fundId} = this.state;
        if(timeseriesData.length !== prevState.timeseriesData.length) {
            let isFundOverLatestMilestoneResult = await isFundOverLatestMilestone(fundId);
            this.setState({
                isFundOverLatestMilestone: isFundOverLatestMilestoneResult,
            })
        }
    }

    componentDidMount = async () => {
        window.addEventListener('resize', debounce(this.resize, 250));
        const { fundUrlSlug, isPreview } = this.props;
        try {
            if(fundUrlSlug){
                let fund = await fetchSociety0xFundFromUrlSlug(fundUrlSlug);
                if(fund){
                    let reduxState = store.getState();
                    let account = reduxState.myProfileMetaData.id;
                    let [
                        fundMilestones,
                        valueForwardableToBeneficiary,
                        isFundManagerResult,
                        isFundOverLatestMilestoneResult,
                    ] = await Promise.all([
                        fetchSociety0xFundMilestones(fund.id),
                        fetchValueForwardableToBeneficiary(fund.id),
                        isFundManager(fund.id, account),
                        isFundOverLatestMilestone(fund.id)
                    ]);
                    let recipient = fund.recipient;
                    let nextTarget = fundMilestones && fundMilestones.length > 0 ? fundMilestones[fundMilestones.length - 1] : 0;
                    let lastTarget = 0;
                    if (fundMilestones.length > 2) {
                        lastTarget = fundMilestones[fundMilestones.length - 2];
                    }
                    let signalReceived = weiToEther(fund.signalReceived);
                    let signalWithdrawn = weiToEther(fund.signalWithdrawn);
                    await store.dispatch(setFundBalances({fundId: fund.id, balance: signalReceived}));
                    await store.dispatch(setFundBeneficiaryWithdrawn({fundId: fund.id, signalWithdrawn: signalWithdrawn}));
                    let coverPictureIpfsHash = fund.coverPictureIpfsHash;
                    const {fundTimeseries} = store.getState();
                    let useTimeseriesData = [];
                    if(fundTimeseries[fund.id]) {
                        useTimeseriesData = Object.values(fundTimeseries[fund.id]);
                    }
                    let bufferMilestones = this.generateBufferMilestones({fundMilestones, nextTarget, signalReceived, recipient});
                    this.setState({
                        fundName: fund.fundName,
                        fundId: fund.id,
                        fundBeneficiary: fund.recipient,
                        signalWithdrawn: toNumber(signalWithdrawn),
                        nextTarget: nextTarget,
                        lastTarget: lastTarget,
                        coverPictureIpfsHash: coverPictureIpfsHash,
                        fundMilestones: fundMilestones,
                        signalReceived: signalReceived,
                        timeseriesData: useTimeseriesData,
                        bufferMilestones: bufferMilestones,
                        recipient: recipient,
                        valueForwardableToBeneficiary: valueForwardableToBeneficiary,
                        isFundManager: isFundManagerResult,
                        isFundOverLatestMilestone: isFundOverLatestMilestoneResult
                    })
                    if(!isPreview) {
                        await updateFundIdTimeseries(fund.id, fund.createdBlockTimestamp);
                    }
                }
            }
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

    initWithdrawal = async () => {
        const {
            fundId
        } = this.state;
        await openSetPledgeRevocationModal(fundId);
    }

    initMilestoneSetting = async () => {
        const {
            fundId
        } = this.state;
        await openSetFundMilestoneModal(fundId);
    }

    forwardFundsToBeneficiary = async () => {
        const {
            fundId,
            valueForwardableToBeneficiary,
            fundBeneficiary
        } = this.state;
        let reduxState = store.getState();
        let account = reduxState.myProfileMetaData.id;
        await forwardFundsToBeneficiary(fundId, valueForwardableToBeneficiary, fundBeneficiary, account);
    }

    render() {
        const {classes, isLinkToFund = false, isPreview = false} = this.props;
        const {
            minCoverHeight,
            coverPictureIpfsHash,
            coverImageStyleOverride,
            fundName,
            fundUrlSlug,
            lastTarget,
            nextTarget,
            signalReceived,
            fundMilestones,
            fundId,
            timeseriesData,
            bufferMilestones,
            valueForwardableToBeneficiary,
            fundsWithdrawable,
            isFundOverLatestMilestone,
            isFundManager,
            signalWithdrawn,
        } = this.state;
        let minCoverHeightStyle = {};
        if(minCoverHeight > 0){
            minCoverHeightStyle = {
                minHeight: minCoverHeight
            }
        }
        const completedProgressUnscaled = percentageOf(signalReceived, nextTarget);
        let bufferProgress = percentageOf(signalReceived, nextTarget);
        if((signalReceived * 1) > (nextTarget * 1)) {
            bufferProgress = 95;
        }
        let completedProgressLinearBuffer = percentageOf(lastTarget, nextTarget);
        for(let [index] of fundMilestones.entries()){
            if((signalReceived * 1) >= (nextTarget * 1)) {
                if(lastTarget === 0 && index === (fundMilestones.length - 1)) {
                    completedProgressLinearBuffer = signalWithdrawn * 95 / signalReceived * 1;
                } else if ((lastTarget !== 0) && (fundMilestones.length >= 2) && index === (fundMilestones.length - 2)) {
                    completedProgressLinearBuffer = signalWithdrawn * 95 / signalReceived * 1;
                }
            }
        };
        let classProfilePictureCard = isPreview ? classes.profilePicCardPreview : classes.profilePicCard;
        let classFundTitle = isPreview ? classes.fundTitle : classes.fundTitle;
        let coverImgContainer = isPreview ? classes.coverImgContainerPreview : classes.coverImgContainer;
        // let currentProgressMarker = {
        //     label: tokenValueFormatDisplay(signalReceived) + " dB",
        //     value: signalReceived,
        //     forceVisible: true,
        //     isCurrentProgress: true,
        // };
        let colorGradient = percToColor(completedProgressUnscaled);
        let chartPrimaryValueSubtitleClass = completedProgressUnscaled * 1 > 100 ? classes.milestoneAchieved : classes.milestonePending;
        let primaryValueSubtitle = (
            <Typography style={{color: colorGradient}} className={chartPrimaryValueSubtitleClass + " no-padding-top "} component="p">
                {completedProgressUnscaled ? tokenValueFormatDisplay(completedProgressUnscaled, 2, "%") : tokenValueFormatDisplay(0, 2, "%")}
            </Typography>
        );
        return (
            <React.Fragment>
                <div className={"text-align-center"}>
                    <div className={["max-page-width auto-margins",classes.profileContainer].join(" ")}>
                        {fundUrlSlug &&
                            <WrapConditionalLink condition={isLinkToFund} to={`/funds/${fundUrlSlug}`}>
                                <Card className={[classes.profileIntroUpperLayer].join(" ")} ref={this.profileIntroContainer}>
                                    <Card ref={this.profileIntroUpperLayer} raised className={["max-page-width auto-margins", classes.cardPadding, classProfilePictureCard].join(" ")}>
                                        <div className={classes.titleWrapper}>
                                            <Typography variant="h4" classes={{ h4: classFundTitle }} component="h2">
                                                {fundName}
                                            </Typography>
                                            {!isPreview && <div className={classes.donateButton}>
                                                <DonateButton fundId={fundId}/>
                                            </div>}
                                        </div>
                                        <div className={classes.progressBar}>
                                            <LinearProgressBuffer initMilestones={bufferMilestones} initCompleted={completedProgressLinearBuffer} initBuffer={bufferProgress}/>
                                        </div>
                                    </Card>
                                    <div className={[coverImgContainer].join(" ")} style={minCoverHeightStyle}>
                                        {coverPictureIpfsHash && 
                                            <img onLoad={(e) => this.coverHasLoaded(e)} ref={this.coverImage} style={coverImageStyleOverride} className={classes.coverImg} src={IPFS_DATA_GATEWAY + coverPictureIpfsHash} alt="Cover"></img>
                                        }
                                    </div>
                                </Card>
                                {/* isChartLoading={isChartLoading} isConsideredMobile={isConsideredMobile} chartTitle={chartData.name} chartSubtitle={chartData.abbreviation} chartData={timeseriesData} chartCurrency={chartCurrency} */}
                                {!isPreview && 
                                    <Fragment>
                                        {/* <div style={{marginTop: '104px'}}> */}
                                        <div className={classes.variableActionContainer}>
                                            {(isFundOverLatestMilestone && isFundManager) &&
                                                <Button onClick={() => this.initMilestoneSetting()} variant="contained" color="secondary" size="large" className={classes.button}>
                                                    {`Set New Milestone`}
                                                </Button>
                                            }
                                            {(fundsWithdrawable > 0) &&
                                                <Button onClick={() => this.initWithdrawal()} variant="contained" color="primary" size="large" className={classes.button}>
                                                    {`Withdraw Up To ${tokenValueFormatDisplay(fundsWithdrawable, 2, "dB")}`}
                                                </Button>
                                            }
                                            {(valueForwardableToBeneficiary > 0) &&
                                                <Button onClick={() => this.forwardFundsToBeneficiary()} variant="contained" color="primary" size="large" className={classes.button}>
                                                    {`Forward ${tokenValueFormatDisplay(valueForwardableToBeneficiary, 2, 'dB')} To Beneficiary`}
                                                </Button>
                                            }
                                        </div>
                                        <div className={classes.chartContainer}>
                                            <OurChartContainerVX primaryValueSubtitle={primaryValueSubtitle} chartTitle={fundName} chartSubtitle={"Fundraising Progress"} chartData={timeseriesData} chartCurrency={"dB"}/>
                                        </div>
                                        {timeseriesData && (timeseriesData.length > 0) && 
                                            <div style={{marginTop: '31px'}}>
                                                <FundPageTabs bufferMilestones={bufferMilestones} timeseriesData={timeseriesData}/>
                                            </div>
                                        }
                                    </Fragment>
                                }
                            </WrapConditionalLink>
                        }
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withRouter(withStyles(styles, { withTheme: true })(FundPage));