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

class OurDrawers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            top: false,
            left: store.getState().showLeftMenu,
            showNavigationWrapper: store.getState().showNavigationWrapper,
            bottom: false,
            right: false,
        };
        store.subscribe(() => {
            this.setState({
                left: store.getState().showLeftMenu,
                showNavigationWrapper: store.getState().showNavigationWrapper,
                activeAccountPseudonym: store.getState().setMyProfileMetaData.pseudonym,
            });
        });
    }

  toggleDrawer = (side, open) => () => {
    if(side === "left"){
        this.props.dispatch(showLeftMenu(open));
    }
  };

  render() {
    const { classes } = this.props;
    const {showNavigationWrapper, activeAccountPseudonym} = this.state;
    console.log({activeAccountPseudonym});
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
        </List>
      </div>
    );

    return (
      showNavigationWrapper && <div>
        <Drawer PaperProps={{classes: {root: 'our-gradient'}}} open={this.state.left} onClose={this.toggleDrawer('left', false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer('left', false)}
            onKeyDown={this.toggleDrawer('left', false)}
          >
            {sideList}
          </div>
        </Drawer>
      </div>
    );
  }
}

OurDrawers.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect()(OurDrawers));