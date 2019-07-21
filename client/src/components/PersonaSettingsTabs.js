import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import PersonaImageCropper from './PersonaImageCropper';

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
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function PersonaSettingsTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue)
  }

  const TabData = [
    {
      tabTitle: "Profile Picture",
      componentType: "cropper",
      componentProps: {
        cropperType: 'profile'
      }
    }, 
    {
      tabTitle: "Cover Picture",
      componentType: "cropper",
      componentProps: {
        cropperType: 'cover'
      }
    }
  ];

  const getTabContent = (componentType, componentProps) => {
    switch(componentType) {
      case "cropper":
        return <PersonaImageCropper type={componentProps.cropperType}/>
      default:
        return null
    }
  }
  
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
            {TabData.map((item) => <Tab key={"persona-settings-tab-selector-"+ item.tabTitle} label={item.tabTitle} />)}
        </Tabs>
      </AppBar>
      {TabData.map((item, index) => index === value && <TabContainer key={"persona-settings-tab-container-"+ item.tabTitle}>{getTabContent(item.componentType, item.componentProps)}</TabContainer>)}
    </div>
  );
}