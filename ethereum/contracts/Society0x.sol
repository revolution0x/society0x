pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { ISignal } from "./interface/ISignal.sol";
import { ISociety0xFunds } from "./interface/ISociety0xFunds.sol";
import { ISociety0xPersona } from "./interface/ISociety0xPersona.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Society0x {
    using SafeMath for uint256;
    
    struct Signal {
        address receiver;
        address giver;
        uint256 amount;
        uint256 time;
    }
    
    ISignal public signal;
    ISociety0xFunds public society0xFunds;
    ISociety0xPersona public society0xPersona;
    uint256 public signalCount;
    uint256 public interactionFee;
    uint256 public deploymentTimestamp;
    address[] public discoveryIndex;
    mapping (address => uint256) private discoveryAddressIndex;

    constructor(ISignal _signal, ISociety0xFunds _society0xFunds, ISociety0xPersona _society0xPersona) public {
        signalCount = 0;
        signal = _signal;
        society0xFunds = _society0xFunds;
        society0xPersona = _society0xPersona;
        interactionFee = 1000000000000000000; // 1 SIGNAL (dB)
        deploymentTimestamp = block.timestamp;
    }

    modifier isRegisteredMessageSender {
        require(
            society0xPersona.isRegisteredAddress(msg.sender),
            "Society0x::isRegisteredMessageSender: Address not registered"
        );
        _;
    }

    modifier processInteractionFee {
        require(
            signal.allowance(msg.sender, address(this)) >= interactionFee,
            "Society0x::processInteractionFee: dB allowance less than interaction fee."
        );
        require(
            signal.transferFrom(msg.sender, address(this), interactionFee),
            "Society0x::processInteractionFee: Signal transfer failed, check allowance."
        );
        _;
    }

    function getInteractionFee() public view returns (uint256) {
        return interactionFee;
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
        discoveryAddressIndex[msg.sender] = discoveryIndex.push(msg.sender).sub(1);
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

    function createSociety0xFund(
        string memory _fundName,
        string memory _urlSlug,
        string memory _coverPictureIpfsHash,
        uint256 _initialMilestone
    ) public processInteractionFee isRegisteredMessageSender returns (bool) {
        society0xFunds.createSociety0xFund(_fundName, _urlSlug, _coverPictureIpfsHash, _initialMilestone, msg.sender, msg.sender);
        return true;
    }

    function setNewMilestone(
        uint256 _fundId,
        uint256 _newMilestone
    ) public processInteractionFee isRegisteredMessageSender returns (bool) {
        society0xFunds.setNewMilestone(_fundId, _newMilestone, msg.sender);
        return true;
    }

    function pledgeSignalToFund(
        uint256 _fundId,
        uint256 _signalValue
    ) public isRegisteredMessageSender returns (bool) {
        require(
            signal.allowance(msg.sender, address(this)) >= _signalValue,
            "Society0x::pledgeSignalToFund: dB allowance less than pledge amount."
        );
        require(
            signal.transferFrom(msg.sender, address(society0xFunds), _signalValue),
            "Society0x::pledgeSignalToFund: Signal transfer failed, check allowance."
        );
        uint256 signalAfterTax = signal.getTaxedValue(_signalValue);
        require(
            society0xFunds.pledgeSignalToFund(_fundId, signalAfterTax, msg.sender),
            "Society0x::pledgeSignalToFund: society0xFunds.pledgeSignalToFund failed."
        );
        return true;
    }

    function unpledgeSignalFromFund(
        uint256 _fundId,
        uint256 _signalValue
    ) public isRegisteredMessageSender returns (bool) {
        require(
            society0xFunds.unpledgeSignalFromFund(_fundId, _signalValue, msg.sender),
            "Society0x::processInteractionFee: society0xFunds.pledgeSignalToFund failed."
        );
        return true;
    }

    function forwardFundsToBeneficiary(
        uint256 _fundId
    ) public isRegisteredMessageSender returns (bool) {
        require(
            society0xFunds.forwardFundsToBeneficiary(_fundId, msg.sender),
            "Society0x::forwardFundsToBeneficiary: society0xFunds.forwardFundsToBeneficiary failed."
        );
        return true;
    }

    function registerProfile(string memory _profileName) public processInteractionFee {
        society0xPersona.registerProfile(_profileName, msg.sender);
    }

    function editProfileImage(string memory _profilePictureIpfsHash) public processInteractionFee isRegisteredMessageSender returns(
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
        return society0xPersona.editProfileImage(_profilePictureIpfsHash, msg.sender);
    }

    function editCoverImage(string memory _coverPictureIpfsHash) public processInteractionFee isRegisteredMessageSender returns(
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
        return society0xPersona.editCoverImage(_coverPictureIpfsHash, msg.sender);
    }

    function createConnectionRequest(
        address _requestConnectionFromAddress
    ) public processInteractionFee isRegisteredMessageSender returns (bool) {
        return society0xPersona.createConnectionRequest(_requestConnectionFromAddress, msg.sender);
    }
    
    function cancelOutgoingConnectionRequest(
        address _cancelConnectionToAddress
    ) public processInteractionFee isRegisteredMessageSender returns (bool) {
        return society0xPersona.cancelOutgoingConnectionRequest(_cancelConnectionToAddress, msg.sender);
    }

    function acceptConnectionRequest(
        address _acceptConnectionFromAddress
    ) public processInteractionFee isRegisteredMessageSender returns (bool) {
        return society0xPersona.acceptConnectionRequest(_acceptConnectionFromAddress, msg.sender);
    }

    function declineConnectionRequest(
        address _declineConnectionFromAddress
    ) public processInteractionFee isRegisteredMessageSender returns (bool) {
        return society0xPersona.declineConnectionRequest(_declineConnectionFromAddress, msg.sender);
    }

    function terminateConnection(address _terminateConnectionToAddress) public processInteractionFee isRegisteredMessageSender returns (bool) {
        return society0xPersona.terminateConnection(_terminateConnectionToAddress, msg.sender);
    }

    function isEstablishedConnection(address _targetAddress) public view isRegisteredMessageSender returns (bool) {
        return society0xPersona.isEstablishedConnection(_targetAddress, msg.sender);
    }

    function isPendingIncomingConnection(address _incomingCheckAddress) public view isRegisteredMessageSender returns (bool) {
        return society0xPersona.isPendingIncomingConnection(_incomingCheckAddress, msg.sender);
    }

    function isPendingOutgoingConnection(address _outgoingCheckAddress) public view isRegisteredMessageSender returns (bool) {
        return society0xPersona.isPendingOutgoingConnection(_outgoingCheckAddress, msg.sender);
    }

}