import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {connect} from 'react-redux';
import {store} from '../state';
import {showLeftMenu} from '../state/actions';
import society0xLogo from "../images/society0x_transparent_white_thicker.png";
import {Link} from "react-router-dom";
import Blockie from "./BlockiesIdenticon";
import {IPFS_DATA_GATEWAY} from "../utils/constants";
import {refreshCurrentDonationProgressViaServer} from '../services/society0x';
import {debounce} from "../utils";

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 5,
  },
  accountAddressStyle: {
    color: "white",
    display: "inline-block"
  },
  appBarProfilePic: {
    maxWidth: "45px",
  },
  appBarProfilePicContainer: {
    paddingTop: "0px",
    paddingBottom: "0px",
  }
};

class OurTopAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLeftMenu: store.getState().showLeftMenu,
      activeAccountAddress: store.getState().myProfileMetaData.id,
      activeAccountPseudonym: store.getState().myProfileMetaData.pseudonym,
      activeAccountProfilePic: store.getState().myProfileMetaData.profilePictureIpfsHash,
      showNavigationWrapper: store.getState().showNavigationWrapper,
    };
    store.subscribe(() => {
      const reduxState = store.getState();
      this.setState({
        showLeftMenu: reduxState.showLeftMenu,
        activeAccountAddress: reduxState.myProfileMetaData.id,
        activeAccountPseudonym: reduxState.myProfileMetaData.pseudonym,
        activeAccountProfilePic: reduxState.myProfileMetaData.profilePictureIpfsHash,
        showNavigationWrapper: reduxState.showNavigationWrapper,
      });
    });
  }

  state = {
    anchorEl: null,
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  toggleMenu = () => {
      debounce(refreshCurrentDonationProgressViaServer(), 250);
      this.props.dispatch(showLeftMenu(!this.state.showLeftMenu));
  }

  render() {
    const { classes } = this.props;
    const { activeAccountAddress, activeAccountPseudonym, activeAccountProfilePic, anchorEl, showNavigationWrapper } = this.state;
    const open = Boolean(anchorEl);
    return (
      showNavigationWrapper && <div className={classes.root}>
      <AppBar position="static" className="transparent our-gradient">
          <Toolbar>
          </Toolbar>
        </AppBar>
        <AppBar position="fixed" className="our-gradient">
          <Toolbar>
            <IconButton onClick={() => this.toggleMenu()} className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <div className={["logo-container", classes.grow].join(" ")}>
              <Link to="/">
                <img src={society0xLogo} alt="society0x Logo"/>
              </Link>
            </div>
            {activeAccountAddress && (
              <div>
                <Typography className={classes.accountAddressStyle}>
                  {activeAccountPseudonym ? activeAccountPseudonym : activeAccountAddress}
                </Typography>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : undefined}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                  className={classes.appBarProfilePicContainer}
                  style={{borderRadius: '20px', padding:'0px', marginLeft:'25px', marginRight:'5px', fontSize: '0px'}}
                >
                <Link className={"no-decorate"} to={`/${activeAccountPseudonym ? activeAccountPseudonym : `register`}`}>
                  {activeAccountProfilePic && <img className={classes.appBarProfilePic} src={IPFS_DATA_GATEWAY + activeAccountProfilePic} alt="Profile"></img>}
                  {!activeAccountProfilePic && <Blockie seed={activeAccountAddress}></Blockie>}
                </Link>
                </IconButton>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

OurTopAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect()(OurTopAppBar));