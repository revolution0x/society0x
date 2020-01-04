pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { Society0x } from "../Society0x.sol";

contract ISociety0xPersona {
    struct Profile {
        address id;
        string pseudonym;
        string profilePictureIpfsHash;
        string coverPictureIpfsHash;
        string profileMetaData;
        uint256 signalReceived;
        uint256 signalGiven;
        uint8 accountMode;
        uint256 updatedTimestamp;
        uint256 createdTimestamp;
    }
    mapping (address => mapping(address => bool)) public pendingConnections;
    mapping (address => mapping(address => bool)) public connections;
    mapping (string => address) private profileNameToAddress;
    mapping (address => Profile) private addressToProfile;
    function registerProfile(string memory _profileName, address _originalMsgSender) public;
    function editProfileImage(string memory _profilePictureIpfsHash, address _originalMsgSender) public returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function editCoverImage(string memory _coverPictureIpfsHash, address _originalMsgSender) public returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function fetchProfileNameFromAddress(address _address) public view returns(string memory);
    function fetchProfileFromAddress(address _address) public view returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function createConnectionRequest(address _requestConnectionFromAddress, address _originalMsgSender) public returns (bool);
    function acceptConnectionRequest(address _acceptConnectionFromAddress, address _originalMsgSender) public returns (bool);
    function cancelOutgoingConnectionRequest(address _cancelConnectionToAddress, address _originalMsgSender) public returns (bool);
    function declineConnectionRequest(address _declineConnectionFromAddress, address _originalMsgSender) public returns (bool);
    function terminateConnection(address _terminateConnectionToAddress, address _originalMsgSender) public returns (bool);
    function isEstablishedConnection(address _targetAddress, address _originalMsgSender) public view returns (bool);
    function isPendingIncomingConnection(address _incomingCheckAddress, address _originalMsgSender) public view returns (bool);
    function isPendingOutgoingConnection(address _outgoingCheckAddress, address _originalMsgSender) public view returns (bool);
    function fetchProfileFromProfileName(string memory _profileName) public view returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256);
    function fetchAddressFromProfileName(string memory _profileName) public view returns(address);
    function isRegisteredAddress(address _address) public view returns(bool);
    function isNotRegisteredAddress(address _address) public view returns(bool);
    function isRegisteredName(string memory _profileName) public view returns(bool);
}