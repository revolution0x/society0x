import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import {connect} from 'react-redux';
import {store} from '../state';
import {showLeftMenu, setActiveAccount} from '../state/actions';
import society0xLogo from "../images/society0x_transparent_white_thicker.png";
import {Link} from "react-router-dom";
import { PublicAddress, Blockie } from 'rimble-ui';

console.log('store',store.getState());

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

class OurAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLeftMenu: store.getState().showLeftMenu,
      activeAccountAddress: store.getState().setActiveAccount.address,
      activeAccountMemberName: store.getState().setActiveAccount.memberName,
      activeAccountProfilePic: store.getState().setActiveAccount.profilePicIpfsHash,
      showNavigationWrapper: store.getState().showNavigationWrapper,
    };
    store.subscribe(() => {
      this.setState({
        showLeftMenu: store.getState().showLeftMenu,
        activeAccountAddress: store.getState().setActiveAccount.address,
        activeAccountMemberName: store.getState().setActiveAccount.memberName,
        activeAccountProfilePic: store.getState().setActiveAccount.profilePicIpfsHash,
        showNavigationWrapper: store.getState().showNavigationWrapper,
      });
    });
  }

  state = {
    anchorEl: null,
  };

  componentDidMount() {
    const {accounts} = this.props;
    const {activeAccountAddress} = this.state;
    // if((accounts && accounts[0]) && (activeAccountAddress !== accounts[0])){
    //   this.props.dispatch(setActiveAccount(accounts[0]));
    // }
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  toggleMenu = () => {
      this.props.dispatch(showLeftMenu(!this.state.showLeftMenu));
  }

  render() {
    const { classes, accounts, dispatch } = this.props;
    const { activeAccountAddress, activeAccountMemberName, activeAccountProfilePic, anchorEl, showNavigationWrapper } = this.state;
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
            <Link to="/" className={"logo-container" + " " + classes.grow}>
              <img src={society0xLogo} alt="society0x Logo"/>
            </Link>
            {activeAccountAddress && (
              <div>
                <Typography className={classes.accountAddressStyle}>
                  {activeAccountMemberName ? activeAccountMemberName : activeAccountAddress}
                </Typography>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : undefined}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                  className={classes.appBarProfilePicContainer}
                >
                {activeAccountProfilePic && <img className={classes.appBarProfilePic} src={"https://ipfs.infura.io/ipfs/" + activeAccountProfilePic} alt="Profile"></img>}
                {!activeAccountProfilePic && <Blockie opts={{seed: activeAccountAddress, size: 15, scale: 3}}></Blockie>}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose}>
                    {activeAccountMemberName && <Link className={"no-decorate"} to={"/" + activeAccountMemberName}>Profile</Link>}
                    {!activeAccountMemberName && <Link className={"no-decorate"} to={"/register"}>Register</Link>}
                  </MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

OurAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect()(OurAppBar));