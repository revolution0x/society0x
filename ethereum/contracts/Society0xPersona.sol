pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Society0xPersona {

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

    uint public profileCount;
    address public society0x;
    mapping (address => mapping(address => bool)) public pendingConnections;
    mapping (address => mapping(address => bool)) public connections;
    mapping (string => address) private profileNameToAddress;
    mapping (address => Profile) private addressToProfile;

    constructor(address _society0x) public {
        society0x = _society0x;
    }

    modifier isCalledBySociety0x {
        require(
            msg.sender == society0x,
            "Society0xPersona::isCalledBySociety0x: Only society0x can call this func"
        );
        _;
    }

    function registerProfile(
        string memory _profileName,
        address _originalMsgSender
    ) public isCalledBySociety0x {
        require(
            !isRegisteredAddress(_originalMsgSender),
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

        addressToProfile[_originalMsgSender] = Profile(
            _originalMsgSender,
            _profileName,
            "",
            "",
            "",
            0,
            0,
            0,
            block.timestamp,
            block.timestamp
        );

        profileNameToAddress[_profileName] = _originalMsgSender;
        profileCount++;
    }

    function editProfileImage(
        string memory _profilePictureIpfsHash,
        address _originalMsgSender
    ) public isCalledBySociety0x returns(
        address,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint8,
        uint256,
        uint256
    ) {
        require(
            isRegisteredAddress(_originalMsgSender),
            "Is Not Registered Address"
        );
        require(
            bytes(_profilePictureIpfsHash).length > 0,
            "_profilePictureIpfsHash Not Provided"
        );
        Profile memory c = addressToProfile[_originalMsgSender];
        addressToProfile[_originalMsgSender] = Profile(
            c.id,
            c.pseudonym,
            _profilePictureIpfsHash,
            c.coverPictureIpfsHash,
            c.profileMetaData,
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
            c.profileMetaData,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            c.updatedTimestamp,
            c.createdTimestamp
        );
    }

    function editCoverImage(
        string memory _coverPictureIpfsHash,
        address _originalMsgSender
    ) public isCalledBySociety0x returns(
        address,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint8,
        uint256,
        uint256
    ) {
        require(
            isRegisteredAddress(_originalMsgSender),
            "Is Not Registered Address"
        );
        require(
            bytes(_coverPictureIpfsHash).length > 0,
            "_coverPictureIpfsHash Not Provided"
        );
        Profile memory c = addressToProfile[_originalMsgSender];
        addressToProfile[_originalMsgSender] = Profile(
            c.id,
            c.pseudonym,
            c.profilePictureIpfsHash,
            _coverPictureIpfsHash,
            c.profileMetaData,
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
            c.profileMetaData,
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

    function fetchProfileFromAddress(address _address) public view returns(
        address,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint8,
        uint256,
        uint256
    ) {
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
            c.profileMetaData,
            c.signalReceived,
            c.signalGiven,
            c.accountMode,
            c.updatedTimestamp,
            c.createdTimestamp
        );
    }

    function createConnectionRequest(
        address _requestConnectionFromAddress,
        address _originalMsgSender
    ) public isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_requestConnectionFromAddress),
            "Society0x::createConnectionRequest: _requestConnectionFromAddress is not a registered address"
        );
        require(
            !isPendingOutgoingConnection(_requestConnectionFromAddress, _originalMsgSender),
            "Society0x::createConnectionRequest: Outgoing Connection Request Already Exists"
        );
        require(
            !isEstablishedConnection(_requestConnectionFromAddress, _originalMsgSender),
            "Society0x::createConnectionRequest: Established Connection Already Exists"
        );
        if(!isPendingIncomingConnection(_requestConnectionFromAddress, _originalMsgSender)){
            pendingConnections[_originalMsgSender][_requestConnectionFromAddress] = true;
        }else{
            connections[_requestConnectionFromAddress][_originalMsgSender] = true;
            connections[_originalMsgSender][_requestConnectionFromAddress] = true;
        }
    }

    function acceptConnectionRequest(
        address _acceptConnectionFromAddress,
        address _originalMsgSender
    ) public isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_acceptConnectionFromAddress),
            "Society0x::acceptConnectionRequest: _requestConnectionFromAddress is not a registered address"
        );
        require(
            isPendingIncomingConnection(_acceptConnectionFromAddress, _originalMsgSender),
            "Society0x::acceptConnectionRequest: Pending Incoming Connection Does Not Exist"
        );
        require(
            !isEstablishedConnection(_acceptConnectionFromAddress, _originalMsgSender),
            "Society0x::acceptConnectionRequest: Established Connection Already Exists"
        );
        pendingConnections[_acceptConnectionFromAddress][_originalMsgSender] = false;
        pendingConnections[_originalMsgSender][_acceptConnectionFromAddress] = false;
        connections[_acceptConnectionFromAddress][_originalMsgSender] = true;
        connections[_originalMsgSender][_acceptConnectionFromAddress] = true;
    }

    function cancelOutgoingConnectionRequest(
        address _cancelConnectionToAddress,
        address _originalMsgSender
    ) public isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_cancelConnectionToAddress),
            "Society0x::cancelOutgoingConnectionRequest:_cancelConnectionToAddress is not a registered address"
        );
        require(
            isPendingIncomingConnection(_originalMsgSender, _cancelConnectionToAddress),
            "Society0x::cancelOutgoingConnectionRequest: Pending Outgoing Connection Does Not Exist"
        );
        require(
            !isEstablishedConnection(_cancelConnectionToAddress, _originalMsgSender),
            "Society0x::cancelOutgoingConnectionRequest: Established Connection Already Exists"
        );
        pendingConnections[_cancelConnectionToAddress][_originalMsgSender] = false;
        pendingConnections[_originalMsgSender][_cancelConnectionToAddress] = false;
        return true;
    }

    function declineConnectionRequest(
        address _declineConnectionFromAddress,
        address _originalMsgSender
    ) public isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_declineConnectionFromAddress),
            "Society0x::declineConnectionRequest: _declineConnectionFromAddress is not a registered address"
        );
        require(
            isPendingIncomingConnection(_declineConnectionFromAddress, _originalMsgSender),
            "Society0x::declineConnectionRequest: Pending Incoming Connection Does Not Exist"
        );
        require(
            !isEstablishedConnection(_declineConnectionFromAddress, _originalMsgSender),
            "Society0x::declineConnectionRequest: Established Connection Already Exists"
        );
        pendingConnections[_declineConnectionFromAddress][_originalMsgSender] = false;
        pendingConnections[_originalMsgSender][_declineConnectionFromAddress] = false;
        return true;
    }

    function terminateConnection(
        address _terminateConnectionToAddress,
        address _originalMsgSender
    ) public isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_terminateConnectionToAddress),
            "Society0x::terminateConnection: _terminateConnectionToAddress is not a registered address"
        );
        require(
            isEstablishedConnection(_terminateConnectionToAddress, _originalMsgSender),
            "Society0x::terminateConnection: Connection Is Not Established For Termination"
        );
        connections[_terminateConnectionToAddress][_originalMsgSender] = false;
        connections[_originalMsgSender][_terminateConnectionToAddress] = false;
        return true;
    }

    function isEstablishedConnection(
        address _targetAddress,
        address _originalMsgSender
    ) public view isCalledBySociety0x returns (bool) {
       return (connections[_originalMsgSender][_targetAddress] == true) && (connections[_targetAddress][_originalMsgSender] == true);
    }

    function isPendingIncomingConnection(
        address _incomingCheckAddress,
        address _originalMsgSender
    ) public view isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_incomingCheckAddress),
            "Society0x::isPendingIncomingConnection: _incomingCheckAddress is not registered"
        );
        if(!pendingConnections[_incomingCheckAddress][_originalMsgSender]){
            return false;
        }else{
            return true;
        }
    }

    function isPendingOutgoingConnection(
        address _outgoingCheckAddress,
        address _originalMsgSender
    ) public view isCalledBySociety0x returns (bool) {
        require(
            isRegisteredAddress(_outgoingCheckAddress),
            "Society0x::isPendingOutgoingConnection: _outgoingCheckAddress is not registered"
        );
        if(!pendingConnections[_originalMsgSender][_outgoingCheckAddress]){
            return false;
        }else{
            return true;
        }
    }

    function fetchProfileFromProfileName(
        string memory _profileName
    ) public view returns(
        address,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint8,
        uint256,
        uint256
    ) {
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