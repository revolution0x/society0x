import React, { Component } from "react";
import {withStyles} from "@material-ui/core/styles";
import {connect} from 'react-redux';
import ProfilePage from "./ProfilePage";
import {
    getDiscoveryIndex,
    joinDiscoveryIndex,
    isInDiscoveryIndex,
    leaveDiscoveryIndex,
    isRegisteredAddress
} from '../../services/society0x';
import { Button } from "@material-ui/core";
import {store} from "../../state";
import {setDiscoveryIndex} from '../../state/actions';
import {areEqualArrays} from "../../utils";

const styles = theme => ({
    segmentContainer: {
        paddingBottom: theme.spacing.unit * 4,
    }
})

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: store.getState().setMyProfileMetaData.id,
            discoveryIndex: store.getState().discoveryIndex,
        };
        store.subscribe(() => {
            if (store.getState().setMyProfileMetaData) {
              this.setState({
                account: store.getState().setMyProfileMetaData.id,
                discoveryIndex: store.getState().discoveryIndex
              });
            }
        });
    }

    componentDidMount = async () => {
        const {account} = this.state;
        let discoveryIndex = await getDiscoveryIndex();
        let hasJoinedIndex = await isInDiscoveryIndex(account);
        let isRegistered = await isRegisteredAddress(account);
        const shouldDiscoveryIndexReduxUpdate = !areEqualArrays(discoveryIndex, store.getState().discoveryIndex);
        if(shouldDiscoveryIndexReduxUpdate) {
            this.props.dispatch(setDiscoveryIndex(discoveryIndex));
        }
        this.setState({
            discoveryIndex: discoveryIndex,
            hasJoinedIndex: hasJoinedIndex,
            isRegistered: isRegistered,
        })
    }

    render() {
        const {classes} = this.props;
        const {account, discoveryIndex, hasJoinedIndex, isRegistered} = this.state;
        return (
            <React.Fragment>
                {isRegistered && <div style={{width: '100%', textAlign: 'center', marginBottom: '30px'}}>
                    {hasJoinedIndex && <Button onClick={(e) => leaveDiscoveryIndex(account)}>Leave Home Page</Button>}
                    {!hasJoinedIndex && <Button onClick={(e) => joinDiscoveryIndex(account)}>Join Home Page</Button>}
                </div>}
                {discoveryIndex.map((item) => <div key={item} className={classes.segmentContainer}><ProfilePage requestedPersona={item} hideButtons={true} isLinkToProfile={true}></ProfilePage></div>)}
            </React.Fragment>
        )
    }
}

export default withStyles(styles, { withTheme: true })(connect()(HomePage));