import React, { Component } from "react";
import { getGanacheWeb3 } from "./utils/getWeb3";
import { Loader } from 'rimble-ui';
import PageContainer from "./components/PageContainer";
import { Router} from 'react-router-dom';
import {configureHistory} from "./utils";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import OurTopAppBar from "./components/OurTopAppBar";
import OurSidebar from "./components/OurSidebar";
import OurModal from './components/OurModal';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/lib/integration/react';
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
      if (store.getState().myProfileMetaData) {
        this.setState({
          activeAccountAddress: store.getState().myProfileMetaData.id,
          activeAccountProfilePic: store.getState().myProfileMetaData.profilePicIpfsHash,
          activeAccountCoverPic: store.getState().myProfileMetaData.profilePicIpfsHash,
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
                <OurSidebar/>
                <OurTopAppBar {...this.state}/>
                <PageContainer />
                <OurModal/>
              </React.Fragment>
            </MuiThemeProvider>
          </PersistGate>
        </Provider>
      </Router>
    );
  }
}

export default App;
