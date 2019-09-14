pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Society0x {

    struct Profile {
        address id;
        string pseudonym;
        string profilePictureIpfsHash;
        string coverPictureIpfsHash;
        string profileMetaIpfsHash;
        uint256 signalReceived;
        uint256 signalGiven;
        uint8 accountMode;
        uint256 updatedTimestamp;
        uint256 createdTimestamp;
    }
    
    struct Signal {
        address receiver;
        address giver;
        uint256 amount;
        uint256 time;
    }
    
    IERC20 public signal;
    uint public signalCount;
    uint public profileCount;
    uint public interactionFee;
    address[] public discoveryIndex;
    mapping (address => uint256) private discoveryAddressIndex;
    mapping (address => mapping(address => bool)) public pendingConnections;
    mapping (address => mapping(address => bool)) public connections;
    mapping (string => address) private profileNameToAddress;
    mapping (address => Profile) private addressToProfile;
    
    constructor(IERC20 _signal) public {
        signalCount = 0;
        profileCount = 0;
        signal = _signal;
        interactionFee = 1000000000000000000; // 1 SIGNAL (dB)
    }

    modifier isRegisteredMessageSender {
        require(
            isRegisteredAddress(msg.sender),
            "Society0x::isRegisteredMessageSender: Address not registered"
        );
        _;
    }

    modifier processInteractionFee {
        require(
            signal.allowance(msg.sender, address(this)) >= interactionFee,
            "Society0x::registerProfile: Signal allowance is not more than interaction fee."
        );
        require(
            signal.transferFrom(msg.sender, address(this), interactionFee),
            "Society0x::registerProfile: Signal transfer failed, make sure Signal balance exceeds interactionFee"
        );
        _;
    }

    function getDiscoveryIndexForMsgSender() public view returns (uint256) {
        return discoveryAddressIndex[msg.sender];
    }

    function getDiscoveryIndexLength() public view returns (uint) {
        return discoveryIndex.length;
    }

    function joinDiscoveryIndex() public isRegisteredMessageSender processInteractionFee returns(bool) {
        uint256 addressIndex = discoveryAddressIndex[msg.sender];
        require(
            discoveryIndex.length == 0 || discoveryIndex[addressIndex] != msg.sender,
            "Society0x::joinDiscoveryIndex: Already on Discovery Index"
        );
        discoveryAddressIndex[msg.sender] = discoveryIndex.push(msg.sender) - 1;
        return true;
    }

    function leaveDiscoveryIndex() public isRegisteredMessageSender processInteractionFee returns(bool) {
        require(
            discoveryIndex[discoveryAddressIndex[msg.sender]] == msg.sender,
            "Society0x::leaveDiscoveryIndex: Not on Discovery Index"
        );
        delete discoveryIndex[discoveryAddressIndex[msg.sender]];
        return true;
    }
    
    function registerProfile(string memory _profileName, string memory _profileMetaIpfsHash) public processInteractionFee {
        require(
            !isRegisteredAddress(msg.sender),
            "Is Registered Address"
        );
        require(
            !isRegisteredName(_profileName),
            "Is Registered Profile Name"
        );
        require(
            (bytes(_profileName).length > 0),
            "registerProfile: Profile Pseudonym Not Provided."
        );
        require(
            (bytes(_profileMetaIpfsHash).length > 0),
            "registerProfile: Profile Meta Data Hash Not Provided."
        );

        addressToProfile[msg.sender] = Profile(
            msg.sender,
            _profileName,
            "",
            "",
            _profileMetaIpfsHash,
            0,
            0,
            0,
            block.timestamp,
            block.timestamp
        );

        profileNameToAddress[_profileName] = msg.sender;
        profileCount++;
    }

    function editProfileImage(string memory _profilePictureIpfsHash) public processInteractionFee isRegisteredMessageSender returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256) {
        require(
            isRegisteredAddress(msg.sender),
            "Is Not Registered Address"
        );
        require(
            bytes(_profilePictureIpfsHash).length > 0,
            "_profilePictureIpfsHash Not Provided"
        );
        Profile memory c = addressToProfile[msg.sender];
        addressToProfile[msg.sender] = Profile(
            c.id,
            c.pseudonym,
            _profilePictureIpfsHash,
            c.coverPictureIpfsHash,
            c.profileMetaIpfsHash,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            block.timestamp,
            c.createdTimestamp
        );
        return (
            c.id,
            c.pseudonym,
            _profilePictureIpfsHash,
            c.coverPictureIpfsHash,
            c.profileMetaIpfsHash,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            c.updatedTimestamp,
            c.createdTimestamp
        );
    }

    function editCoverImage(string memory _coverPictureIpfsHash) public processInteractionFee isRegisteredMessageSender returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256) {
        require(
            isRegisteredAddress(msg.sender),
            "Is Not Registered Address"
        );
        require(
            bytes(_coverPictureIpfsHash).length > 0,
            "_coverPictureIpfsHash Not Provided"
        );
        Profile memory c = addressToProfile[msg.sender];
        addressToProfile[msg.sender] = Profile(
            c.id,
            c.pseudonym,
            c.profilePictureIpfsHash,
            _coverPictureIpfsHash,
            c.profileMetaIpfsHash,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            block.timestamp,
            c.createdTimestamp
        );
        return (
            c.id,
            c.pseudonym,
            c.profilePictureIpfsHash,
            _coverPictureIpfsHash,
            c.profileMetaIpfsHash,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            c.updatedTimestamp,
            c.createdTimestamp
        );
    }

    function fetchProfileNameFromAddress(address _address) public view returns(string memory) {
        require(
            isRegisteredAddress(_address),
            "Is Not Registered Address"
        );
        return addressToProfile[_address].pseudonym;
    }

    function fetchProfileFromAddress(address _address) public view returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256) {
        require(
            isRegisteredAddress(_address),
            "Society0x::fetchProfileFromAddress: _address is not a registered address"
        );
        Profile memory c = addressToProfile[_address];
        return (
            c.id,
            c.pseudonym,
            c.profilePictureIpfsHash,
            c.coverPictureIpfsHash,
            c.profileMetaIpfsHash,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            c.updatedTimestamp,
            c.createdTimestamp
        );
    }

    function createConnectionRequest(address _requestConnectionFromAddress) public processInteractionFee isRegisteredMessageSender returns (bool) {
        require(
            isRegisteredAddress(_requestConnectionFromAddress),
            "Society0x::createConnectionRequest: _requestConnectionFromAddress is not a registered address"
        );
        require(
            !isPendingOutgoingConnection(_requestConnectionFromAddress),
            "Society0x::createConnectionRequest: Outgoing Connection Request Already Exists"
        );
        require(
            !isEstablishedConnection(_requestConnectionFromAddress),
            "Society0x::createConnectionRequest: Established Connection Already Exists"
        );
        if(!isPendingIncomingConnection(_requestConnectionFromAddress)){
            pendingConnections[msg.sender][_requestConnectionFromAddress] = true;
        }else{
            connections[_requestConnectionFromAddress][msg.sender] = true;
            connections[msg.sender][_requestConnectionFromAddress] = true;
        }
    }

    function acceptConnectionRequest(address _acceptConnectionFromAddress) public processInteractionFee isRegisteredMessageSender returns (bool) {
        require(
            isRegisteredAddress(_acceptConnectionFromAddress),
            "Society0x::acceptConnectionRequest: _requestConnectionFromAddress is not a registered address"
        );
        require(
            isPendingIncomingConnection(_acceptConnectionFromAddress),
            "Society0x::acceptConnectionRequest: Pending Incoming Connection Does Not Exist"
        );
        require(
            !isEstablishedConnection(_acceptConnectionFromAddress),
            "Society0x::acceptConnectionRequest: Established Connection Already Exists"
        );
        pendingConnections[_acceptConnectionFromAddress][msg.sender] = false;
        pendingConnections[msg.sender][_acceptConnectionFromAddress] = false;
        connections[_acceptConnectionFromAddress][msg.sender] = true;
        connections[msg.sender][_acceptConnectionFromAddress] = true;
    }

    function declineConnectionRequest(address _declineConnectionFromAddress) public processInteractionFee isRegisteredMessageSender returns (bool) {
        require(
            isRegisteredAddress(_declineConnectionFromAddress),
            "Society0x::declineConnectionRequest: _requestConnectionFromAddress is not a registered address"
        );
        require(
            isPendingIncomingConnection(_declineConnectionFromAddress),
            "Society0x::declineConnectionRequest: Pending Incoming Connection Does Not Exist"
        );
        require(
            !isEstablishedConnection(_declineConnectionFromAddress),
            "Society0x::declineConnectionRequest: Established Connection Already Exists"
        );
        pendingConnections[_declineConnectionFromAddress][msg.sender] = false;
        pendingConnections[msg.sender][_declineConnectionFromAddress] = false;
    }

    function terminateConnection(address _terminateConnectionToAddress) public processInteractionFee isRegisteredMessageSender returns (bool) {
        require(
            isRegisteredAddress(_terminateConnectionToAddress),
            "Society0x::terminateConnection: _terminateConnectionToAddress is not a registered address"
        );
        require(
            isEstablishedConnection(_terminateConnectionToAddress),
            "Society0x::terminateConnection: Connection Is Not Established For Termination"
        );
        connections[_terminateConnectionToAddress][msg.sender] = false;
        connections[msg.sender][_terminateConnectionToAddress] = false;
    }

    function isEstablishedConnection(address _targetAddress) public view isRegisteredMessageSender returns (bool) {
       return (connections[msg.sender][_targetAddress] == true) && (connections[_targetAddress][msg.sender] == true);
    }

    function isPendingIncomingConnection(address _incomingCheckAddress) public view isRegisteredMessageSender returns (bool) {
        require(
            isRegisteredAddress(_incomingCheckAddress),
            "Society0x::isPendingIncomingConnection: _incomingCheckAddress is not registered"
        );
        if(!pendingConnections[_incomingCheckAddress][msg.sender]){
            return false;
        }else{
            return true;
        }
    }

    function isPendingOutgoingConnection(address _outgoingCheckAddress) public view isRegisteredMessageSender returns (bool) {
        require(
            isRegisteredAddress(_outgoingCheckAddress),
            "Society0x::isPendingOutgoingConnection: _outgoingCheckAddress is not registered"
        );
        if(!pendingConnections[msg.sender][_outgoingCheckAddress]){
            return false;
        }else{
            return true;
        }
    }

    function fetchProfileFromProfileName(string memory _profileName) public view returns(address, string memory, string memory, string memory, string memory, uint256, uint256, uint8, uint256, uint256) {
        require(
            isRegisteredName(_profileName),
            "Is Not Registered Profile Name"
        );
        return fetchProfileFromAddress(profileNameToAddress[_profileName]);
    }

    function fetchAddressFromProfileName(string memory _profileName) public view returns(address) {
        require(
            isRegisteredName(_profileName),
            "Is Not Registered Profile Name"
        );
        address _profileAddress = profileNameToAddress[_profileName];
        return _profileAddress;
    }

    function isRegisteredAddress(address _address) public view returns(bool) {
        return addressToProfile[_address].id != 0x0000000000000000000000000000000000000000;
    }

    function isNotRegisteredAddress(address _address) public view returns(bool) {
        return addressToProfile[_address].id == 0x0000000000000000000000000000000000000000;
    }

    function isRegisteredName(string memory _profileName) public view returns(bool) {
        require(
            (bytes(_profileName).length > 0),
            "Profile Name Required But Not Provided."
        );
        return profileNameToAddress[_profileName] != 0x0000000000000000000000000000000000000000;
    }
}