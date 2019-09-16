import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import CreateIcon from '@material-ui/icons/LeakAdd';
import RegisterIcon from '@material-ui/icons/VerifiedUser';
import ProfileIcon from '@material-ui/icons/AccountCircle';
import {store} from '../state';
import {connect} from 'react-redux';
import {showLeftMenu} from '../state/actions';
import {Link} from 'react-router-dom';
import AllowanceIcon from '@material-ui/icons/SignalCellularAlt';
import ExchangeIcon from '@material-ui/icons/SettingsEthernet';
import FaucetIcon from '@material-ui/icons/EvStation';
import society0xLogo from "../images/society0x_transparent_white_thicker.png";

const styles = {
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  link: {
    color: '#ffffff',
  }
};

class OurSidebar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            top: false,
            left: store.getState().showLeftMenu,
            showNavigationWrapper: store.getState().showNavigationWrapper,
            bottom: false,
            right: false,
            easterEggIndex: 0,
            easterEggText: ["WITH", "LOVE"],
        };
        store.subscribe(() => {
            this.setState({
                left: store.getState().showLeftMenu,
                showNavigationWrapper: store.getState().showNavigationWrapper,
                activeAccountPseudonym: store.getState().setMyProfileMetaData.pseudonym,
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

  render() {
    const { classes } = this.props;
    const {showNavigationWrapper, activeAccountPseudonym, easterEggText} = this.state;
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
            <Link to={'/'} className={["no-decorate", classes.link].join(" ")}>
                <ListItem button key={"Home"}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={"Home"} />
                </ListItem>
            </Link>
            {!activeAccountPseudonym && <Link to={'/register'} className={["no-decorate", classes.link].join(" ")}>
              <ListItem button key={"Register"}>
                <ListItemIcon><RegisterIcon /></ListItemIcon>
                <ListItemText primary={"Register"} />
              </ListItem>
            </Link>}
            {activeAccountPseudonym && 
              <Fragment>
                <Link to={`/${activeAccountPseudonym}`} className={["no-decorate", classes.link].join(" ")}>
                  <ListItem button key={"Profile"}>
                    <ListItemIcon><ProfileIcon /></ListItemIcon>
                    <ListItemText primary={"Profile"} />
                  </ListItem>
                </Link>
              </Fragment>
            }
            <Link to={'/exchange'} className={["no-decorate", classes.link].join(" ")}>
              <ListItem button key={"Exchange"}>
                <ListItemIcon><ExchangeIcon /></ListItemIcon>
                <ListItemText primary={"Exchange"} />
              </ListItem>
            </Link>
            <Link to={'/allowance'} className={["no-decorate", classes.link].join(" ")}>
              <ListItem button key={"Allowance"}>
                <ListItemIcon><AllowanceIcon /></ListItemIcon>
                <ListItemText primary={"Allowance"} />
              </ListItem>
            </Link>
            <Link to={'/faucet'} className={["no-decorate", classes.link].join(" ")}>
              <ListItem button key={"Faucet"}>
                <ListItemIcon><FaucetIcon /></ListItemIcon>
                <ListItemText primary={"Faucet"} />
              </ListItem>
            </Link>
        </List>
      </div>
    );

    return (
      showNavigationWrapper && 
      <div>
        <Drawer className={"space-between"} PaperProps={{classes: {root: 'our-gradient space-between'}}} open={this.state.left} onClose={this.toggleDrawer('left', false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer('left', false)}
            onKeyDown={this.toggleDrawer('left', false)}
          >
            {sideList}
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