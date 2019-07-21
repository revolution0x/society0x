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
import LoveIcon from '@material-ui/icons/Favorite';
import RegisterIcon from "@material-ui/icons/VerifiedUser";
import {store} from '../state';
import {connect} from 'react-redux';
import {showLeftMenu} from '../state/actions';
import {Link} from 'react-router-dom';


const styles = {
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
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
                showNavigationWrapper: store.getState().showNavigationWrapper
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
    const {showNavigationWrapper} = this.state;
    const sideList = (
      <div className={classes.list}>
        <List>
            {(process.env["NODE_ENV"] === 'development') &&
              <Fragment>
                <Link to={'/register'} className={"no-decorate"}>
                  <ListItem button key={"Register"}>
                    <ListItemIcon><RegisterIcon /></ListItemIcon>
                    <ListItemText primary={"Register"} />
                  </ListItem>
                </Link>
                <Link to={'/creation'} className={"no-decorate"}>
                  <ListItem button key={"Creation"}>
                    <ListItemIcon><CreateIcon /></ListItemIcon>
                    <ListItemText primary={"Creation"} />
                  </ListItem>
                </Link>
              </Fragment>
            }
            <Link to={'/'} className={"no-decorate"}>
                <ListItem button key={"⎊ With Love ⎊"}>
                <ListItemIcon><LoveIcon /></ListItemIcon>
                <ListItemText primary={"⎊ With Love ⎊"} />
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