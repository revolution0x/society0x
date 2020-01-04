pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

contract ISociety0xFunds {
    mapping (address => uint256[]) public creatorToFunds;
    mapping (uint256 => uint256[]) public fundIdToMilestones;
    mapping (address => uint256[]) public pledgerToPledges;
    mapping (uint256 => mapping(uint256 => uint256)) public fundIdToMilestoneValueToCommittedFunds;
    function createSociety0xFund(string memory _fundName, string memory _urlSlug, string memory _coverPictureIpfsHash, uint256 _initialMilestone,  address _fundCreator, address _fundRecipient) public returns (bool);
    function fetchFundIdFromUrlSlug(string memory _urlSlug) public view returns(uint256);
    function fetchFundFromUrlSlug(string memory _urlSlug) public view returns (uint256, string memory, string memory, string memory, address, address, uint256, uint256, uint256, uint256, uint256);
    function fetchFundFromFundId(uint256 _fundId) public view returns (uint256, string memory, string memory, string memory, address, address, uint256, uint256, uint256, uint256, uint256);
    function getFundSignalReceived(uint256 _fundId) public view returns (uint256);
    function getFundsCommittedToMilestone(uint256 _fundId, uint256 _milestoneValue) public returns (uint256);
    function getFundListLength() public view returns (uint256);
    function forwardFundsToBeneficiary(uint256 _fundId, address _forwarderAddress) public returns (bool);
    function valueForwardableToBeneficiary(uint256 _fundId) public view returns(uint256);
    function isFundOverLatestMilestone(uint256 _fundId) public view returns (bool);
    function setNewMilestone(uint256 _fundId, uint256 _newMilestone, address _milestoneSetter) public returns (bool);
    function isFundManager(address _checkAddress, uint256 _fundId) public view returns(bool);
    function getFundPledgeCount(uint256 _fundId) public view returns(uint256);
    function getFundPledgeByPledgeId(uint256 _fundId, uint256 _pledgeIndex) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256, bool);
    function getPledgerFundsWithdrawable(uint256 _fundId) public view returns(uint256);
    function pledgeSignalToFund(uint256 _fundId, uint256 _signalValue, address _pledgerAddress) public returns(bool);
    function unpledgeSignalFromFund(uint256 _fundId, uint256 _signalValue, address _pledgerAddress) public returns(bool);
    function isRegisteredUrlSlug(string memory _urlSlug) public view returns(bool);
}