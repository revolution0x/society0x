import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import { Loader } from 'rimble-ui';
import PageContainer from "./components/PageContainer";
import { Router, Link } from 'react-router-dom';
import {configureHistory, ethToBrowserFormatProfileMetaData} from "./utils";
import { DefaultProfileMetaData } from './utils/constants';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import OurAppBar from "./components/OurAppBar";
import OurDrawers from "./components/OurDrawers";
import { Provider } from "react-redux";
import {setActiveAccount, setWeb3, setMyProfileMetaData} from './state/actions';
import { PersistGate } from 'redux-persist/lib/integration/react';
import {getProfileFromAddress} from "./services/society0x";
import {connect} from 'react-redux';
import {store, persistor} from "./state";
import "./App.css";

const history = configureHistory();

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    type: 'dark',
    primary: {
      50: '#FFFFFF',
      100: '#2C2C2C',
      200: '#242424',
      300: '#0F0F0F',
      500: '#000000',
      A100: '#000000',
      A200: '#0F0F0F',
      A400: '#242424',
      A700: '#2C2C2C'
    },
  }
});
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    store.subscribe(() => {
      if (store.getState().setMyProfileMetaData) {
        this.setState({
          activeAccountAddress: store.getState().setMyProfileMetaData.id,
          activeAccountProfilePic: store.getState().setMyProfileMetaData.profilePicIpfsHash,
          activeAccountCoverPic: store.getState().setMyProfileMetaData.profilePicIpfsHash,
          web3: store.getState().setWeb3
        });
      }
    });
  }

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  renderLoader() {
    return (
      <div className={"loader"} style={{color: 'white'}}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  render() {
    // if (!store.getState().setWeb3) {
    //   return this.renderLoader();
    // }
    return (
      <Router history={history}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <MuiThemeProvider theme={theme}>
              <React.Fragment>
                <OurDrawers/>
                <OurAppBar {...this.state}/>
                <PageContainer />
              </React.Fragment>
            </MuiThemeProvider>
          </PersistGate>
        </Provider>
      </Router>
    );
  }
}

export default App;
