import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SignalExchange from './SignalExchange';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: '500px',
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

export default function ExchangeTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue)
  }

  const TabData = [
    {
      tabTitle: "Convert DAI into Signal",
      componentType: "daiToSignal",
    },
    {
      tabTitle: "Convert Signal into DAI",
      componentType: "signalToDai",
    } 
  ];

  const getTabContent = (componentType) => {
    switch(componentType) {
        case "signalToDai":
            return <SignalExchange input={"SIGNAL"}/>
        case "daiToSignal":
            return <SignalExchange input={"DAI"}/>
        default:
            return null
    }
  }
  
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs centered={true} value={value} onChange={handleChange}>
            {TabData.map((item) => <Tab key={"exchange-tab-selector-"+ item.tabTitle} label={item.tabTitle} />)}
        </Tabs>
      </AppBar>
      {TabData.map((item, index) => index === value && <TabContainer key={"exchange-tab-container-"+ item.tabTitle}>{getTabContent(item.componentType)}</TabContainer>)}
    </div>
  );
}