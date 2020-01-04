import React, {Fragment} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import {tokenValueFormatDisplay} from '../utils';
import LoveIcon from '@material-ui/icons/Favorite';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

const primary = (item) => {
    return (
        <Fragment>
            {tokenValueFormatDisplay(item.pledgeValue, 2, 'dB')}
            <span style={{float: 'right'}}>{moment(item.xAxisValue).fromNow()}</span>
        </Fragment>
    )
}

export default function DonationList({donationList}) {
  const classes = useStyles();

  return (
    <List className={classes.root}>
      {
        donationList && donationList.map(item => {
            return (
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>
                            <LoveIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={primary(item)} secondary={item.pledgerAddress} />
                </ListItem>
            )
        })
      }
    </List>
  );
}