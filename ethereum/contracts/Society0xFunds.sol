pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { ISignal } from "./interface/ISignal.sol";

contract Society0xFunds {
    using SafeMath for uint256;

    struct Fund {
        uint256 id;
        string fundName;
        string urlSlug;
        string coverPictureIpfsHash;
        address recipient;
        address fundManager;
        uint256 signalReceived;
        uint256 signalWithdrawn;
        uint256 updatedBlockNumber;
        uint256 createdBlockNumber;
        uint256 createdBlockTimestamp;
    }

    struct Pledge {
        uint256 id;
        address pledgerAddress;
        uint256 pledgeToMilestone;
        uint256 fundId;
        uint256 signalValue;
        uint256 blockNumber;
        uint256 blockTimestamp;
        bool incoming;
    }

    event PledgeEvent (
        uint256 fundId,
        uint256 signalPledgeValue,
        uint256 signalTotal,
        uint256 blockNumber,
        uint256 blockTimestamp,
        bool incoming
    );

    address public society0x;
    Fund[] public funds;
    Pledge[] public pledges;
    ISignal public signal;
    mapping (uint256 => string) public fundIdToUrlSlug;
    mapping (string => uint256) public urlSlugToFundId;
    mapping (address => uint256[]) public creatorToFunds;
    mapping (uint256 => uint256[]) public fundIdToMilestones;
    mapping (uint256 => uint256) public fundIdToMilestoneCount;
    mapping (address => uint256[]) public pledgerToPledges;
    mapping (uint256 => Pledge[]) public fundIdToPledges;
    mapping (uint256 => mapping(uint256 => uint256)) public fundIdToMilestoneValueToCommittedFunds;
    mapping (address => mapping(uint256 => mapping(uint256 => uint256))) public pledgerToFundIdToMiletoneToCommittedFunds;
    
    constructor(address _society0x, ISignal _signal) public {
        society0x = _society0x;
        signal = _signal;
    }

    modifier isCalledBySociety0x {
        require(
            msg.sender == society0x,
            "Society0xFunds::isCalledBySociety0x: Only society0x can call this func"
        );
        _;
    }

    function createSociety0xFund(
        string memory _fundName,
        string memory _urlSlug,
        string memory _coverPictureIpfsHash,
        uint256 _initialMilestone,
        address _fundCreator,
        address _fundRecipient
    ) public isCalledBySociety0x returns (bool) {
        require(
            !isRegisteredUrlSlug(_urlSlug),
            "Society0xFunds::createSociety0xFund: Url Slug Is Already Registered"
        );
        require(
            _initialMilestone > 0,
            "Society0xFunds::createSociety0xFund: Initial Signal Milestone Must Be More Than Zero"
        );
        require(
            _fundCreator != 0x0000000000000000000000000000000000000000,
            "Society0xFunds::createSociety0xFund: _fundCreator can't be void address"
        );
        require(
            _fundRecipient != 0x0000000000000000000000000000000000000000,
            "Society0xFunds::createSociety0xFund: _fundRecipient can't be void address"
        );
        uint256 fundId = funds.length;
        funds.push(Fund(
            fundId,
            _fundName,
            _urlSlug,
            _coverPictureIpfsHash,
            _fundRecipient,
            _fundCreator,
            0,
            0,
            block.number,
            block.number,
            block.timestamp
        ));
        fundIdToMilestones[fundId].push(0);
        fundIdToMilestones[fundId].push(_initialMilestone);
        fundIdToUrlSlug[fundId] = _urlSlug;
        urlSlugToFundId[_urlSlug] = fundId;
        creatorToFunds[_fundCreator].push(fundId);
        fundIdToMilestoneCount[fundId] = 2;
        fundIdToMilestoneValueToCommittedFunds[fundId][_initialMilestone] = 0;
        return true;
    }

    function getFundsCommittedToMilestone(uint256 _fundId, uint256 _milestoneValue) public view returns (uint256) {
        require(
            (funds[_fundId].recipient != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::getFundsCommittedToMilestone: invalid _fundId"
        );
        return fundIdToMilestoneValueToCommittedFunds[_fundId][_milestoneValue];
    }

    function fetchFundIdFromUrlSlug(string memory _urlSlug) public view returns(uint256) {
        require(
            isRegisteredUrlSlug(_urlSlug),
            "Society0xFunds::fetchFundIdFromUrlSlug: Is Not Registered Url Slug"
        );
        return urlSlugToFundId[_urlSlug];
    }

    function fetchFundFromUrlSlug(string memory _urlSlug) public view returns (
        uint256,
        string memory,
        string memory,
        string memory,
        address,
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        uint256 fundId = fetchFundIdFromUrlSlug(_urlSlug);
        return fetchFundFromFundId(fundId);
    }

    function fetchFundFromFundId(uint256 _fundId) public view returns (
        uint256,
        string memory,
        string memory,
        string memory,
        address,
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        require(
            (funds.length > 0),
            "Society0xFunds::fetchFundFromFundId: No Funds Exist"
        );
        require(
            (funds[_fundId].recipient != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::fetchFundFromFundId: Fund With Provided ID Does Not Exist"
        );
        Fund memory fund = funds[_fundId];
        return(
            fund.id,
            fund.fundName,
            fund.urlSlug,
            fund.coverPictureIpfsHash,
            fund.recipient,
            fund.fundManager,
            fund.signalReceived,
            fund.signalWithdrawn,
            fund.updatedBlockNumber,
            fund.createdBlockNumber,
            fund.createdBlockTimestamp
        );
    }

    function getFundSignalReceived(uint256 _fundId) public view returns (uint256) {
        require(
            (funds.length > 0),
            "Society0xFunds::fetchFundFromFundId: No Funds Exist"
        );
        require(
            (funds[_fundId].recipient != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::fetchFundFromFundId: Fund With Provided ID Does Not Exist"
        );
        return funds[_fundId].signalReceived;
    }

    function getFundListLength() public view returns (uint256) {
        return funds.length;
    }

    function pledgeSignalToFund(
        uint256 _fundId,
        uint256 _signalValue,
        address _pledgerAddress
    ) public isCalledBySociety0x returns(
        bool
    ) {
        require(
            (funds.length > 0),
            "Society0xFunds::pledgeSignalToFund: No Funds Exist"
        );
        require(
            (funds[_fundId].recipient != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::pledgeSignalToFund: Fund With Provided ID Does Not Exist"
        );
        require(
            (_signalValue > 0),
            "Society0xFunds::pledgeSignalToFund: Signal quantity must be more than zero"
        );
        Fund storage fund = funds[_fundId];
        uint256 newBalance = fund.signalReceived.add(_signalValue);
        uint256 pledgeToMilestone = fundIdToMilestones[_fundId][fundIdToMilestones[_fundId].length.sub(1)];
        uint256 currentMilestoneCommitment = fundIdToMilestoneValueToCommittedFunds[_fundId][pledgeToMilestone];
        uint256 currentPledgerMilestoneCommitment = pledgerToFundIdToMiletoneToCommittedFunds[_pledgerAddress][_fundId][pledgeToMilestone];
        fund.signalReceived = newBalance;
        Pledge memory pledge = Pledge(
            pledges.length,
            _pledgerAddress,
            pledgeToMilestone,
            _fundId,
            _signalValue,
            block.number,
            block.timestamp,
            true
        );
        pledges.push(pledge);
        fundIdToPledges[_fundId].push(pledge);
        pledgerToPledges[_pledgerAddress].push(pledges.length);
        if(currentPledgerMilestoneCommitment > 0){
            pledgerToFundIdToMiletoneToCommittedFunds[_pledgerAddress][_fundId][pledgeToMilestone] = currentPledgerMilestoneCommitment.add(_signalValue);
        } else {
            pledgerToFundIdToMiletoneToCommittedFunds[_pledgerAddress][_fundId][pledgeToMilestone] = _signalValue;
        }
        if(currentMilestoneCommitment > 0){
            fundIdToMilestoneValueToCommittedFunds[_fundId][pledgeToMilestone] = currentMilestoneCommitment.add(_signalValue);
        }else{
            fundIdToMilestoneValueToCommittedFunds[_fundId][pledgeToMilestone] = _signalValue;
        }
        emit PledgeEvent(_fundId, _signalValue, newBalance, block.number, block.timestamp, true);
        return true;
    }

    function unpledgeSignalFromFund(
        uint256 _fundId,
        uint256 _signalValue,
        address _pledgerAddress
    ) public isCalledBySociety0x returns(
        bool
    ) {
        require(
            _signalValue > 0,
            "Society0xFunds::unpledgeSignalFromFund: Can't withdraw zero Signal"
        );
        uint256 fundsAvailableForWithdrawal = getPledgerFundsWithdrawable(_fundId, _pledgerAddress);
        require(
            fundsAvailableForWithdrawal > 0,
            "Society0xFunds::unpledgeSignalFromFund: No available funds for withdrawal"
        );
        require(
            fundsAvailableForWithdrawal >= _signalValue,
            "Society0x::unpledgeSignalFromFund: Requested withdrawal amount exceeds available allocation"
        );
        Fund storage fund = funds[_fundId];
        uint256 newBalance = fund.signalReceived.sub(_signalValue);
        uint256 unpledgeFromMilestone = fundIdToMilestones[_fundId][fundIdToMilestones[_fundId].length.sub(1)];
        uint256 currentMilestoneCommitment = fundIdToMilestoneValueToCommittedFunds[_fundId][unpledgeFromMilestone];
        uint256 currentPledgerMilestoneCommitment = pledgerToFundIdToMiletoneToCommittedFunds[_pledgerAddress][_fundId][unpledgeFromMilestone];
        require(
            (currentPledgerMilestoneCommitment > 0),
            "Society0xFunds::unpledgeSignalFromFund: currentPledgerMilestoneCommitment must be more than zero"
        );
        fund.signalReceived = newBalance;
        Pledge memory pledge = Pledge(
            pledges.length,
            _pledgerAddress,
            unpledgeFromMilestone,
            _fundId,
            _signalValue,
            block.number,
            block.timestamp,
            false
        );
        pledges.push(pledge);
        fundIdToPledges[_fundId].push(pledge);
        pledgerToPledges[_pledgerAddress].push(pledges.length);
        if(currentPledgerMilestoneCommitment > 0){
            pledgerToFundIdToMiletoneToCommittedFunds[_pledgerAddress][_fundId][unpledgeFromMilestone] = currentPledgerMilestoneCommitment.sub(_signalValue);
        } else {
            pledgerToFundIdToMiletoneToCommittedFunds[_pledgerAddress][_fundId][unpledgeFromMilestone] = _signalValue;
        }
        if(currentMilestoneCommitment > 0){
            fundIdToMilestoneValueToCommittedFunds[_fundId][unpledgeFromMilestone] = currentMilestoneCommitment.sub(_signalValue);
        }else{
            fundIdToMilestoneValueToCommittedFunds[_fundId][unpledgeFromMilestone] = _signalValue;
        }
        require(
            signal.transfer(_pledgerAddress, _signalValue),
            "Society0x::unpledgeSignalFromFund: Withdrawal failed"
        );
        emit PledgeEvent(_fundId, _signalValue, newBalance, block.number, block.timestamp, false);
        return true;
    }

    function valueForwardableToBeneficiary(uint256 _fundId) public view returns(uint256) {
        bool isFundOverLatestMilestone = isFundOverLatestMilestone(_fundId);
        uint256 fundSignalWithdrawn = funds[_fundId].signalWithdrawn;
        uint256 latestMilestone = fundIdToMilestones[_fundId][fundIdToMilestones[_fundId].length.sub(1)];
        if(isFundOverLatestMilestone && (latestMilestone > 0)) {
            return latestMilestone.sub(fundSignalWithdrawn);
        }else{
            return 0;
        }
    }

    function isFundOverLatestMilestone(uint256 _fundId) public view returns (bool) {
        require(
            (funds.length > 0),
            "Society0xFunds::fetchFundFromFundId: No Funds Exist"
        );
        require(
            (funds[_fundId].recipient != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::fetchFundFromFundId: Fund With Provided ID Does Not Exist"
        );
        uint256 latestMilestone = fundIdToMilestones[_fundId][fundIdToMilestones[_fundId].length.sub(1)];
        uint256 fundSignalReceived = funds[_fundId].signalReceived;
        if(fundSignalReceived >= latestMilestone) {
            return true;
        }else{
            return false;
        }
    }

    function forwardFundsToBeneficiary(uint256 _fundId, address _forwarderAddress) public isCalledBySociety0x returns (bool) {
        _forwardFundsToBeneficiary(_fundId, _forwarderAddress);
        return true;
    }

    function _forwardFundsToBeneficiary(uint256 _fundId, address _forwarderAddress) internal returns (bool) {
        uint256 valueForwardable = valueForwardableToBeneficiary(_fundId);
        require(
            valueForwardable > 0,
            "Society0xFunds::forwardFundsToBeneficiary: Forwardable balance not more than zero"
        );
        address beneficiary = funds[_fundId].recipient;
        require(
            signal.transfer(beneficiary, valueForwardable),
            "Society0xFunds::forwardFundsToBeneficiary: Signal transfer to beneficiary failed"
        );
        funds[_fundId].signalWithdrawn = funds[_fundId].signalWithdrawn.add(valueForwardable);
        return true;
    }

    function setNewMilestone(uint256 _fundId, uint256 _newMilestone, address _milestoneSetter) public isCalledBySociety0x returns (bool) {
        require(
            isFundOverLatestMilestone(_fundId),
            "Society0xFunds:setNewMilestone:: Fund is not over latest milestone"
        );
        require(
            isFundManager(_milestoneSetter, _fundId),
            "Society0xFunds:setNewMilestone:: _milestoneSetter is not equal to fundManager"
        );
        require(
            _newMilestone > fundIdToMilestones[_fundId][fundIdToMilestones[_fundId].length.sub(1)],
            "Society0xFunds:setNewMilestone:: _newMilestone is not greater than latest milestone"
        );
        require(
            _newMilestone > funds[_fundId].signalReceived,
            "Society0xFunds:setNewMilestone:: _newMilestone is not greater than signalReceived"
        );
        uint256 valueForwardable = valueForwardableToBeneficiary(_fundId);
        if(valueForwardable > 0) {
            require(
                _forwardFundsToBeneficiary(_fundId, _milestoneSetter),
                "Society0xFunds::setNewMilestone: Forwarding Funds To Beneficiary Failed"
            );
        }
        fundIdToMilestones[_fundId].push(_newMilestone);
        fundIdToMilestoneCount[_fundId] = fundIdToMilestoneCount[_fundId].add(1);
        fundIdToMilestoneValueToCommittedFunds[_fundId][_newMilestone] = 0;
        return true;
    }

    function isFundManager(address _checkAddress, uint256 _fundId) public view returns(bool) {
        return _checkAddress == funds[_fundId].fundManager;
    }

    function getFundPledgeCount(uint256 _fundId) public view returns(uint256) {
        return fundIdToPledges[_fundId].length;
    }

    function getFundPledgeByPledgeId(uint256 _fundId, uint256 _pledgeIndex) public view returns(
        uint256,
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        bool
    ) {
        require(
            (fundIdToPledges[_fundId].length > 0),
            "Society0xFunds::getFundPledgeByPledgeId: No Pledges Exist For Fund"
        );
        require(
            (fundIdToPledges[_fundId][_pledgeIndex].pledgerAddress != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::getFundPledgeByPledgeId: Pledge ID Does Not Exist For Fund"
        );
        Pledge memory pledge = fundIdToPledges[_fundId][_pledgeIndex];
        return(
            pledge.id,
            pledge.pledgerAddress,
            pledge.pledgeToMilestone,
            pledge.fundId,
            pledge.signalValue,
            pledge.blockNumber,
            pledge.blockTimestamp,
            pledge.incoming
        );
    }

    function getPledgerFundsWithdrawable(uint256 _fundId, address _pledger) public view returns(uint256) {
        require(
            (funds.length > 0),
            "Society0xFunds::getPledgerFundsWithdrawable: No Funds Exist"
        );
        require(
            (funds[_fundId].recipient != 0x0000000000000000000000000000000000000000),
            "Society0xFunds::getPledgerFundsWithdrawable: Fund With Provided ID Does Not Exist"
        );
        uint256 latestMilestone = fundIdToMilestones[_fundId][fundIdToMilestones[_fundId].length.sub(1)];
        Fund storage fund = funds[_fundId];
        uint256 currentFundSignalBalance = fund.signalReceived;
        if(latestMilestone > currentFundSignalBalance) {
            uint256 currentPledgerMilestoneCommitment = pledgerToFundIdToMiletoneToCommittedFunds[_pledger][_fundId][latestMilestone];
            return currentPledgerMilestoneCommitment;
        }else{
            return 0;
        }
    }

    function isRegisteredUrlSlug(string memory _urlSlug) public view returns(bool) {
        require(
            (bytes(_urlSlug).length > 0),
            "Url Slug Required But Not Provided."
        );
        if(urlSlugToFundId[_urlSlug] == 0) {
            if((funds.length > 0) && (keccak256(abi.encodePacked(funds[0].urlSlug)) == keccak256(abi.encodePacked(_urlSlug)))){
                return true;
            }else{
                return false;
            }
        }else{
            return true;
        }
    }
}