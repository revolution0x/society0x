import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import { Loader } from 'rimble-ui';
import PageContainer from "./components/PageContainer";
import { Router, Link } from 'react-router-dom';
import {configureHistory} from "./utils";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import OurAppBar from "./components/OurAppBar";
import OurDrawers from "./components/OurDrawers";
import { Provider } from "react-redux";
import {setActiveAccount, setWeb3} from './state/actions';
//import {getMemberProfileFromAddress} from "./services/social0x";
import {connect} from 'react-redux';
import store from "./state";
import "./App.css";

const history = configureHistory();

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  }
});
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    store.subscribe(() => {
      if (store.getState().setActiveAccount) {
        this.setState({
          activeAccountAddress: store.getState().setActiveAccount.address,
          activeAccountProfilePic: store.getState().setActiveAccount.profilePicIpfsHash,
          activeAccountCoverPic: store.getState().setActiveAccount.profilePicIpfsHash,
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

  componentDidMount = async () => {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const isMetaMask = await web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        if((accounts && accounts[0]) && (!store.getState().setActiveAccount || (store.getState().setActiveAccount.address !== accounts[0]))){
          try {
            //let memberProfile = await getMemberProfileFromAddress(accounts[0]);
            let memberProfile = false;
            if (memberProfile && (memberProfile[0] === accounts[0])) {
              store.dispatch(setActiveAccount({
                address: memberProfile[0],
                memberName: memberProfile[1],
                profilePicIpfsHash: memberProfile[2],
                coverPicIpfsHash: memberProfile[3],
              }));
            } else {
              store.dispatch(setActiveAccount({
                address: accounts[0],
                profilePicIpfsHash: "",
                coverPicIpfsHash: "",
              }));
            }
          } catch (e) {
            console.log('Error Retrieving Member Associated With Given Currently Active Address');
            store.dispatch(setActiveAccount({
              address: accounts[0],
              profilePicIpfsHash: "",
              coverPicIpfsHash: "",
            }));
          }
          store.dispatch(setWeb3(web3));
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  renderLoader() {
    return (
      <div className={"loader"}>
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
    console.log('store.getState()', store.getState());
    return (
      <Router history={history}>
        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
            <React.Fragment>
              <OurDrawers/>
              <OurAppBar {...this.state}/>
              <PageContainer />
              {/* <Web3Info {...this.state} /> */}
            </React.Fragment>
          </MuiThemeProvider>
        </Provider>
      </Router>
    );
  }
}

export default App;
