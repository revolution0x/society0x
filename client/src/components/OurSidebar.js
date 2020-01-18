import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import CreateIcon from '@material-ui/icons/LeakAdd';
import RegisterIcon from '@material-ui/icons/VerifiedUser';
import Typography from '@material-ui/core/Typography';
import {store} from '../state';
import {connect} from 'react-redux';
import {showLeftMenu} from '../state/actions';
import {Link} from 'react-router-dom';
import AllowanceIcon from '@material-ui/icons/SignalCellularAlt';
// import TribesIcon from '@material-ui/icons/Pages';
import FundsIcon from '@material-ui/icons/EmojiNature';
// import PollsIcon from '@material-ui/icons/Poll';
// import EventsIcon from '@material-ui/icons/LocalActivity';
// import LoveIcon from '@material-ui/icons/Favorite';
import ExchangeIcon from '@material-ui/icons/SettingsEthernet';
import FaucetIcon from '@material-ui/icons/EvStation';
import DiscussionIcon from '@material-ui/icons/SettingsInputAntenna';
import PersonaSettingsIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/SettingsApplications';
import society0xLogo from "../images/society0x_transparent_white_thicker.png";
import {tokenValueFormatDisplay, centerShortenLongString,
// percToColor
} from "../utils";
import Blockie from "./BlockiesIdenticon";
import {IPFS_DATA_GATEWAY} from "../utils/constants";
import FinanceIcon from '@material-ui/icons/AccountBalanceWallet';
import SocialIcon from '@material-ui/icons/EmojiPeople';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  link: {
    color: '#ffffff',
  },
  sidebarHeaderContainer: {
    height: 'auto',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0),
    width: '100%',
  },
  sidebarHeaderBalance: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  sidebarProfilePicture:{
    maxWidth: '150px',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,1)',
  },
  sidebarProfilePictureContainer: {
    marginBottom: theme.spacing(1),
    minHeight: '156px',
  },
  sidebarProfileContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '250px',
    paddingTop: theme.spacing(4),
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  unnested: {
    borderLeft: '1px solid white',
  },
});

class OurSidebar extends React.Component {

    constructor(props) {
        super(props);
        let constructorReduxState = store.getState();
        this.state = {
            top: false,
            left: constructorReduxState.showLeftMenu,
            showNavigationWrapper: constructorReduxState.showNavigationWrapper,
            activeAccountProfilePic: constructorReduxState.myProfileMetaData.profilePictureIpfsHash,
            activeAccountAddress: constructorReduxState.myProfileMetaData.id,
            activeAccountPseudonym: constructorReduxState.myProfileMetaData.pseudonym,
            currentDonationProgressViaServer:  constructorReduxState.currentDonationProgressViaServer,
            expandedListItems: [],
            bottom: false,
            right: false,
            easterEggIndex: 0,
            easterEggText: ["WITH", "LOVE"],
        };
        store.subscribe(() => {
            let reduxState = store.getState();
            this.setState({
                left: reduxState.showLeftMenu,
                signalBalance: tokenValueFormatDisplay(reduxState.selfSignalBalance, 2, "dB"),
                daiBalance: tokenValueFormatDisplay(reduxState.selfDaiBalance, 2, "DAI"),
                showNavigationWrapper: reduxState.showNavigationWrapper,
                activeAccountPseudonym: reduxState.myProfileMetaData.pseudonym,
                activeAccountProfilePic: reduxState.myProfileMetaData.profilePictureIpfsHash,
                activeAccountAddress: reduxState.myProfileMetaData.id,
                currentDonationProgressViaServer: reduxState.currentDonationProgressViaServer,
            });
        });
        this.toggleEasterEgg = this.toggleEasterEgg.bind(this);
    }

  toggleDrawer = (side, open) => () => {
    if(side === "left"){
        this.props.dispatch(showLeftMenu(open));
    }
  };

  toggleEasterEgg = () => {
    let setEasterEggIndex = this.state.easterEggIndex + 1;
    let easterEggCollection = [
      ["WITH", "LOVE"],
      ["BRING", "PEACE"],
      ["HONOUR", "NATURE"],
      ["PROTECT", "FREEDOM"],
      ["MANIFEST", "FAIRNESS"],
      ["EMPOWER", "BRAVERY"],
      ["CREATE", "AMENDS"],
      ["CARRY", "MERCY"]
    ]
    if(!easterEggCollection[setEasterEggIndex]){
      setEasterEggIndex = 0;
    }
    this.setState({
      easterEggIndex: setEasterEggIndex,
      easterEggText: easterEggCollection[setEasterEggIndex]
    })
  }

  isExpandedListItem = (listItem) => {
    return this.state.expandedListItems.indexOf(listItem) > -1;
  }

  toggleListItemExpansion = (e, listItem) => {
    e.preventDefault();
    e.stopPropagation();
    let { expandedListItems } = this.state;
    let indexOfMatch = expandedListItems.indexOf(listItem);
    if(indexOfMatch === -1) {
      this.setState({
        expandedListItems: [...expandedListItems, listItem]
      })
    }else{
      expandedListItems.splice(indexOfMatch, 1);
      this.setState({
        expandedListItems: [...expandedListItems]
      })
    }
  }

  render() {
    const { classes } = this.props;
    const {
      showNavigationWrapper,
      activeAccountPseudonym,
      easterEggText,
      activeAccountProfilePic,
      activeAccountAddress,
      signalBalance,
      daiBalance,
      // currentDonationProgressViaServer
    } = this.state;
    // let donationColorProgress = percToColor(currentDonationProgressViaServer);
    const sideList = (
      <div className={classes.list}>
        <List>
            {/* {(process.env["NODE_ENV"] === 'development') &&
              <Fragment>
                <Link to={'/creation'} className={"no-decorate"}>
                  <ListItem button key={"Creation"}>
                    <ListItemIcon><CreateIcon /></ListItemIcon>
                    <ListItemText primary={"Creation"} />
                  </ListItem>
                </Link>
              </Fragment>
            } */}
            {!activeAccountPseudonym && <Link to={'/register'} className={["no-decorate", classes.link].join(" ")}>
              <ListItem className={classes.unnested} button key={"Register"}>
                <ListItemIcon><RegisterIcon /></ListItemIcon>
                <ListItemText primary={"Register"} />
              </ListItem>
            </Link>}
            <ListItem className={classes.unnested} button onClick={(e) => this.toggleListItemExpansion(e, 'social')}>
              <ListItemIcon>
                <SocialIcon />
              </ListItemIcon>
              <ListItemText primary="Social" />
              {this.isExpandedListItem('social') ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse className={"opacity-hover-subtle"} in={this.isExpandedListItem('social')} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {activeAccountPseudonym && 
                  <Link to={'/funds'} className={["no-decorate", classes.link].join(" ")}>
                    <ListItem className={classes.nested} button key={"Funds"}>
                      <ListItemIcon><FundsIcon /></ListItemIcon>
                      <ListItemText primary={"Funds"} />
                    </ListItem>
                  </Link>
                }
                <a href={"https://discord.gg/UAJMkPV"} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Discussion"}>
                    <ListItemIcon><DiscussionIcon /></ListItemIcon>
                    <ListItemText primary={"Discussion"} />
                  </ListItem>
                </a>
                {/* <Link to={'/tribes'} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Tribes"}>
                    <ListItemIcon><TribesIcon /></ListItemIcon>
                    <ListItemText primary={"Tribes"} />
                  </ListItem>
                </Link>
                <Link to={'/polls'} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Polls"}>
                    <ListItemIcon><PollsIcon /></ListItemIcon>
                    <ListItemText primary={"Polls"} />
                  </ListItem>
                </Link>
                <Link to={'/events'} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Events"}>
                    <ListItemIcon><EventsIcon /></ListItemIcon>
                    <ListItemText primary={"Events"} />
                  </ListItem>
                </Link> */}
              </List>
            </Collapse>
            <ListItem className={classes.unnested} button onClick={(e) => this.toggleListItemExpansion(e, 'finance')}>
              <ListItemIcon>
                <FinanceIcon />
              </ListItemIcon>
              <ListItemText primary="Finance" />
              {this.isExpandedListItem('finance') ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.isExpandedListItem('finance')} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Link to={'/exchange'} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Exchange"}>
                    <ListItemIcon><ExchangeIcon /></ListItemIcon>
                    <ListItemText primary={"Exchange"} />
                  </ListItem>
                </Link>
                <Link to={'/allowance'} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Allowance"}>
                    <ListItemIcon><AllowanceIcon /></ListItemIcon>
                    <ListItemText primary={"Allowance"} />
                  </ListItem>
                </Link>
                <Link to={'/faucet'} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem className={classes.nested} button key={"Faucet"}>
                    <ListItemIcon><FaucetIcon /></ListItemIcon>
                    <ListItemText primary={"Faucet"} />
                  </ListItem>
                </Link>
              </List>
            </Collapse>
            {activeAccountPseudonym && 
              <Fragment>
                <ListItem className={classes.unnested} button onClick={(e) => this.toggleListItemExpansion(e, 'settings')}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                  {this.isExpandedListItem('settings') ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={this.isExpandedListItem('settings')} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Link to={'/settings/persona'} className={["no-decorate", classes.link].join(" ")}>
                      <ListItem className={classes.nested} button key={"Persona"}>
                        <ListItemIcon><PersonaSettingsIcon /></ListItemIcon>
                        <ListItemText primary={"Persona"} />
                      </ListItem>
                    </Link>
                  </List>
                </Collapse>
              </Fragment>
            }
            {/* <Link to={'/sponsor'} className={["no-decorate", classes.link].join(" ")}>
              <ListItem className={classes.unnested} button key={"Sponsor"}>
                <ListItemIcon><LoveIcon /></ListItemIcon>
                <ListItemText primary={"Sponsor"} /> */}
                {/* <Typography variant="h6" style={{color:donationColorProgress}} className={[classes.accountAddressStyle, "monospace"].join(" ")}>
                  {currentDonationProgressViaServer}
                </Typography> */}
                {/* <p style={{color:donationColorProgress, paddingTop: '5px', marginTop: '0px', marginBottom: '0px'}} className={["monospace", classes.sidebarHeaderBalance].join(" ")}>
                  <span className={classes.sidebarHeaderBalanceValue}>{currentDonationProgressViaServer}%</span>
                </p>
              </ListItem>
            </Link> */}
        </List>
      </div>
    );

    return (
      showNavigationWrapper && 
      <div>
        <Drawer className={"space-between"} PaperProps={{classes: {root: 'our-gradient space-between'}}} open={this.state.left} onClose={this.toggleDrawer('left', false)}>
          <div>
            <div className={classes.sidebarProfileContainer}>
              <Link
                onClick={this.toggleDrawer('left', false)}
                onKeyDown={this.toggleDrawer('left', false)}
                className={["no-decorate", classes.sidebarProfilePictureContainer].join(" ")}
                to={`/${activeAccountPseudonym ? activeAccountPseudonym : `register`}`}
              >
                  {activeAccountProfilePic && <img className={classes.sidebarProfilePicture} src={IPFS_DATA_GATEWAY + activeAccountProfilePic} alt="Profile"></img>}
                  {!activeAccountProfilePic && <Blockie className={classes.sidebarProfilePicture} scale={9} seed={activeAccountAddress}></Blockie>}
              </Link>
              <Link
                onClick={this.toggleDrawer('left', false)}
                onKeyDown={this.toggleDrawer('left', false)}
                className={["no-decorate", classes.link].join(" ")}
                to={`/${activeAccountPseudonym ? activeAccountPseudonym : `register`}`}
              >
              <Typography variant="h6" className={[classes.accountAddressStyle, "monospace"].join(" ")}>
                {activeAccountPseudonym ? activeAccountPseudonym : centerShortenLongString(activeAccountAddress, 16)}
              </Typography>
              </Link>
            </div>
            <div className={classes.sidebarHeaderContainer}>
              <p style={{marginTop: '0px', marginBottom: '0px'}} className={["monospace", classes.sidebarHeaderBalance].join(" ")}>Signal: <span className={classes.sidebarHeaderBalanceValue}>{signalBalance}</span></p>
              <p style={{marginTop: '0px', marginBottom: '0px'}} className={["monospace", classes.sidebarHeaderBalance].join(" ")}>DAI: <span className={classes.sidebarHeaderBalanceValue}>{daiBalance}</span></p>
            </div>
            <div
              tabIndex={0}
              role="button"
              onClick={this.toggleDrawer('left', false)}
              onKeyDown={this.toggleDrawer('left', false)}
            >
              {sideList}
            </div>
          </div>
          <div onClick={() => this.toggleEasterEgg()} className={"opacity-hover"} style={{paddingTop: '15px', paddingBottom: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}>
            <p className={"monospace"} style={{display:'inline-block', paddingRight: '10px'}}>{easterEggText[0]}</p>
            <img style={{width: '70px'}} src={society0xLogo} alt="society0x Logo"/>
            <p className={"monospace"} style={{display:'inline-block', paddingLeft: '10px'}}>{easterEggText[1]}</p>
          </div>
        </Drawer>
      </div>
    );
  }
}

OurSidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect()(OurSidebar));