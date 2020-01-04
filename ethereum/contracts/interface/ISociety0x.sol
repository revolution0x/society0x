pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract ISociety0x {
    function getDiscoveryIndexForMsgSender() public view returns (uint256);
    function getDiscoveryIndexLength() public view returns (uint256);
    function getInteractionFee() public view returns (uint256);
    function joinDiscoveryIndex() public returns(bool);
    function leaveDiscoveryIndex() public returns(bool);
    function registerProfile(string memory _profileName) public;
    function editProfileImage(string memory _profilePictureIpfsHash) public returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function editCoverImage(string memory _coverPictureIpfsHash) public returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function fetchProfileNameFromAddress(address _address) public view returns(string memory);
    function fetchProfileFromAddress(address _address) public view returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function createConnectionRequest(address _requestConnectionFromAddress) public returns (bool);
    function acceptConnectionRequest(address _acceptConnectionFromAddress) public returns (bool);
    function declineConnectionRequest(address _declineConnectionFromAddress) public returns (bool);
    function terminateConnection(address _terminateConnectionToAddress) public returns (bool);
    function isEstablishedConnection(address _targetAddress) public view returns (bool);
    function isPendingIncomingConnection(address _incomingCheckAddress) public view returns (bool);
    function isPendingOutgoingConnection(address _outgoingCheckAddress) public view returns (bool);
    function pledgeSignalToFund(uint256 _fundId, uint256 _signalValue) public returns (bool);
    function unpledgeSignalToFund(uint256 _fundId, uint256 _signalValue) public returns (bool);
    function forwardFundsToBeneficiary(uint256 _fundId) public returns (bool);
    function fetchProfileFromProfileName(string memory _profileName) public view returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function fetchAddressFromProfileName(string memory _profileName) public view returns(address);
    function isRegisteredAddress(address _address) public view returns(bool);
    function isNotRegisteredAddress(address _address) public view returns(bool);
    function isRegisteredName(string memory _profileName) public view returns(bool);
}