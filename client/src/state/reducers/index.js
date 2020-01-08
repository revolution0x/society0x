import {combineReducers} from "redux";
import showLeftMenu from "./showLeftMenu";
import setActiveAccount from "./setActiveAccount";
import setWeb3 from "./setWeb3";
import showNavigationWrapper from "./showNavigationWrapper";
import setConsideredMobile from './setConsideredMobile';
import myProfileMetaData from './myProfileMetaData';
import setClientProvidedEthNetId from './setClientProvidedEthNetId';
import discoveryIndex from './discoveryIndex';
import fundBalances from './fundBalances';
import fundTimeseries from './fundTimeseries';
import fundMilestones from './fundMilestones';
import fundOverLatestMilestone from './fundOverLatestMilestone';
import selfSignalBalance from './selfSignalBalance';
import selfSignalAllowance from './selfSignalAllowance';
import selfDaiBalance from './selfDaiBalance';
import selfDaiAllowance from './selfDaiAllowance';
import interactionFee from './interactionFee';
import deploymentTimestamp from './deploymentTimestamp';
import society0xDonationsBalance from './society0xDonationsBalance';
import society0xDonationsTimeseries from './society0xDonationsTimeseries';
import modalConfig from './modalConfig';
import currentDonationProgressViaServer from './currentDonationProgressViaServer';
import fundWithdrawable from './fundWithdrawable';
import fundForwardableToBeneficiary from './fundForwardableToBeneficiary';
import personaConnectionsEstablished from './personaConnectionsEstablished';
import personaConnectionsOutgoing from './personaConnectionsOutgoing';
import personaConnectionsIncoming from './personaConnectionsIncoming';
import fundBeneficiaryWithdrawn from './fundBeneficiaryWithdrawn';

export default combineReducers({
    showLeftMenu,
    setActiveAccount,
    setWeb3,
    showNavigationWrapper,
    setConsideredMobile,
    setClientProvidedEthNetId,
    myProfileMetaData,
    discoveryIndex,
    fundBalances,
    fundTimeseries,
    fundMilestones,
    fundOverLatestMilestone,
    selfSignalBalance,
    selfSignalAllowance,
    selfDaiBalance,
    selfDaiAllowance,
    interactionFee,
    deploymentTimestamp,
    society0xDonationsBalance,
    society0xDonationsTimeseries,
    modalConfig,
    currentDonationProgressViaServer,
    fundWithdrawable,
    fundForwardableToBeneficiary,
    personaConnectionsEstablished,
    personaConnectionsOutgoing,
    personaConnectionsIncoming,
    fundBeneficiaryWithdrawn,
})