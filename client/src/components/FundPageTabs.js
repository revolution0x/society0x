import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import OurTable from './OurTable';
import Card from '@material-ui/core/Card';
import TableCell from '@material-ui/core/TableCell';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import {
  tokenValueFormatDisplay,
  percToColor,
} from "../utils";
import LoveIcon from '@material-ui/icons/Favorite';
import moment from 'moment';
import MilestoneIcon from '@material-ui/icons/Flag';

const TabContainer = (props) => {
  return (
    <Typography component="div">
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: '100%',
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white'
  },
  tabContents: {
    // backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  }
}));

const primaryTextMilestoneListItem = (item) => {
  let colorGradient = percToColor(item.milestoneCompletion);
  return (
      <Fragment>
          {item.label}
          <span style={{float: 'right', color: colorGradient}}>{tokenValueFormatDisplay(item.milestoneCompletion, 2, '%')}</span>
      </Fragment>
  )
}

const primaryTextDonationListItem = (item) => {
  const donationValue = tokenValueFormatDisplay(item.pledgeValue, 2, 'dB')
  return (
      <Fragment>
          {item.incoming ? 
            <span style={{color: 'rgb(0, 255, 0)'}}>+ {donationValue}</span> : 
            <span style={{color: 'rgb(255, 0, 0)'}}>- {donationValue}</span>
          }
          <span style={{float: 'right'}}>{moment(item.xAxisValue).fromNow()}</span>
      </Fragment>
  )
}

const renderMilestoneListItem = (bufferMilestones) => {
  let milestoneListDisplayRender = bufferMilestones.filter(item => item.value > 0).map(item => {
    return (
        <TableCell component="th" scope="row">
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <MilestoneIcon />
                    </Avatar>
                </ListItemAvatar>
                {/* TODO milestoneTldr and descriptions */}
                <ListItemText primary={primaryTextMilestoneListItem(item)} secondary={item.recipient} />
            </ListItem>
        </TableCell>
    )
  });
  return milestoneListDisplayRender;
}

const renderDonationListItem = (timeseriesData) => {
  let donationListDisplay = timeseriesData.filter(item => item.pledgerAddress).map(item => {
    const donationListItem = (
        <TableCell component="th" scope="row">
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <LoveIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={primaryTextDonationListItem(item)} secondary={item.pledgerAddress} />
            </ListItem>
        </TableCell>
    )
    return donationListItem;
  });
  return donationListDisplay;
}

export default function FundPageTabs({timeseriesData, bufferMilestones}) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [donationList, setDonationList] = React.useState([]);
  const [milestoneList, setMilestoneList] = React.useState([]);

  useEffect(() => {
    let donationListDisplay = renderDonationListItem(timeseriesData);
    setDonationList([...donationListDisplay].reverse());
  }, [timeseriesData]);

  useEffect(() => {
    let milestoneListDisplayRender = renderMilestoneListItem(bufferMilestones).reverse();
    setMilestoneList(milestoneListDisplayRender);
  }, [bufferMilestones]);

  function handleChange(event, newValue) {
    let milestoneListDisplayRender = renderMilestoneListItem(bufferMilestones);
    let donationListDisplay = renderDonationListItem(timeseriesData);
    setMilestoneList([...milestoneListDisplayRender].reverse());
    setDonationList([...donationListDisplay].reverse());
    setValue(newValue);
  }

  const TabData = [
    {
      tabTitle: "Milestones",
      componentType: "milestones",
    },
    {
      tabTitle: "Donations",
      componentType: "donations",
    }
  ];

  const getTabContent = (componentType) => {
    switch(componentType) {
        case "donations":
            return (
              <div>
                <OurTable initTableData={donationList}></OurTable>
              </div>
            )
        case "milestones":
            return (
              <div>
                <OurTable initTableData={milestoneList}></OurTable>
              </div>
            )
        default:
            return null
    }
  }
  
  return (
    <div className={classes.root}>
        <Tabs centered={true} value={value} onChange={handleChange}>
            {TabData.map((item) => <Tab key={"fund-tab-selector-"+ item.tabTitle} label={item.tabTitle} />)}
        </Tabs>
        <Card className={classes.tabContents}>
            {TabData.map((item, index) => index === value && <TabContainer key={"fund-tab-container-"+ item.tabTitle}>{getTabContent(item.componentType)}</TabContainer>)}
        </Card>
    </div>
  );
}