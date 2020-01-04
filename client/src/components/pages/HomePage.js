import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import {connect} from 'react-redux';
import ProfilePage from "./ProfilePage";
import {
    getDiscoveryIndex,
    joinDiscoveryIndex,
    isInDiscoveryIndex,
    leaveDiscoveryIndex,
    isRegisteredAddress,
    refreshDiscoveryIndex,
} from '../../services/society0x';
import {store} from "../../state";
import {areEqualArrays} from "../../utils";
import JoinHomePageIcon from '@material-ui/icons/FlightLand';
import LeaveHomePageIcon from '@material-ui/icons/FlightTakeoff';
import LoadingIcon from "@material-ui/icons/HourglassEmpty";
import Fab from '@material-ui/core/Fab';
import { RequiresInteractionFee } from "../RequiresInteractionFee";

const styles = theme => ({
    segmentContainer: {
        paddingBottom: theme.spacing(4),
    },
    fab: {
        width: '100%',
        maxWidth: '300px',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(5),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
})

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: store.getState().myProfileMetaData.id,
            discoveryIndex: store.getState().discoveryIndex,
            pseudonym: store.getState().myProfileMetaData.pseudonym,
            isLoading: true,
        };
        store.subscribe(() => {
            let reduxState = store.getState();
            let discoveryIndexSet = this.state.discoveryIndex;
            const shouldDiscoveryIndexReduxUpdate = !areEqualArrays(discoveryIndexSet, reduxState.discoveryIndex);
            if(shouldDiscoveryIndexReduxUpdate) {
                discoveryIndexSet = reduxState.discoveryIndex;
            }
            if (reduxState.myProfileMetaData) {
              this.setState({
                account: store.getState().myProfileMetaData.id,
                discoveryIndex: discoveryIndexSet,
                pseudonym: store.getState().myProfileMetaData.pseudonym,
              });
            }
        });
    }

    componentDidMount = async () => {
        const {account} = this.state;
        let isRegistered = await isRegisteredAddress(account);
        let hasJoinedIndex = await isInDiscoveryIndex(account);
        this.setState({
            hasJoinedIndex: hasJoinedIndex,
            isRegistered: isRegistered,
            isLoading: false,
        });
        let discoveryIndexLatest = await getDiscoveryIndex();
        const shouldDiscoveryIndexReduxUpdate = !areEqualArrays(discoveryIndexLatest, store.getState().discoveryIndex);
        if(shouldDiscoveryIndexReduxUpdate) {
            refreshDiscoveryIndex(discoveryIndexLatest);
        }
    }

    render() {
        const {classes} = this.props;
        const {account, discoveryIndex, hasJoinedIndex, isRegistered, isLoading, pseudonym} = this.state;
        return (
            <React.Fragment>
                {isRegistered && 
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <RequiresInteractionFee autoTrigger={false}>
                            {hasJoinedIndex &&
                                <Fab color="primary" onClick={(e) => leaveDiscoveryIndex(account)} variant="extended" className={classes.fab}>
                                    <LeaveHomePageIcon className={classes.extendedIcon} />
                                    Leave Home Page
                                </Fab>
                            }
                            {!hasJoinedIndex &&
                                <Fab color="primary" onClick={(e) => joinDiscoveryIndex(account)} variant="extended" className={classes.fab}>
                                    <JoinHomePageIcon className={classes.extendedIcon} />
                                    Join Home Page
                                </Fab>
                            }
                        </RequiresInteractionFee>
                    </div>
                }
                {(isLoading && pseudonym) &&
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <Fab color="primary" variant="extended" className={classes.fab}>
                            <LoadingIcon className={classes.extendedIcon} />
                            Loading...
                        </Fab>
                    </div>
                }
                {discoveryIndex.map((item) => <div key={item} className={classes.segmentContainer}><ProfilePage requestedPersona={item} isPreview={true} hideButtons={true} isLinkToProfile={true}></ProfilePage></div>)}
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(connect()(HomePage));