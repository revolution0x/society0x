pragma solidity >=0.4.22 <0.6.0;

contract Society0x {
    
    struct Member {
        address id;
        string name;
        string profilePictureIpfsHash;
        string coverPictureIpfsHash;
        uint256 tipReceived;
        uint256 tipGiven;
        uint256 reputation;
        uint8 accountMode;
    }
    
    struct Tip {
        address receiver;
        address giver;
        uint256 amount;
        uint256 time;
    }
    
    uint public tipCount;
    uint public memberCount;
    mapping (string => address) private memberNameToAddress;
    mapping (address => Member) private addressToMember;
    
    constructor() public {
        tipCount = 0;
        memberCount = 0;
    }
    
    function registerMember(string memory _memberName, string memory _profilePictureIpfsHash, string memory _coverPictureIpfsHash) public isNewMemberAddressAndName(_memberName) {
        require(
            (bytes(_memberName).length > 0),
            "Member Name Not Provided."
        );
        require(
            (bytes(_profilePictureIpfsHash).length > 0),
            "Profile Pic Hash Not Provided."
        );
        require(
            (bytes(_coverPictureIpfsHash).length > 0),
            "Cover Pic Hash Not Provided."
        );
        addressToMember[msg.sender] = Member(msg.sender, _memberName, _profilePictureIpfsHash, _coverPictureIpfsHash, 0, 0, 0, 0);
        memberNameToAddress[_memberName] = msg.sender;
        memberCount++;
    }

    function fetchMemberNameFromAddress(address _address) public view isRegisteredAddress(_address) returns(string memory) {
        return addressToMember[_address].name;
    }

    function fetchMemberFromAddress(address _address) public view isRegisteredAddress(_address) returns(address, string memory, string memory, string memory, uint256, uint256, uint256, uint8) {
        Member memory m = addressToMember[_address];
        return (
            m.id,
            m.name,
            m.profilePictureIpfsHash,
            m.coverPictureIpfsHash,
            m.tipReceived,
            m.tipGiven,
            m.reputation,
            m.accountMode
        );
    }

    function fetchMemberFromMemberName(string memory _memberName) public view isRegisteredName(_memberName) returns(address, string memory, string memory, string memory, uint256, uint256, uint256, uint8) {
        address _memberAddress = memberNameToAddress[_memberName];
        return fetchMemberFromAddress(_memberAddress);
    }

    function fetchAddressFromMemberName(string memory _memberName) public view isRegisteredName(_memberName) returns(address) {
        address _memberAddress = memberNameToAddress[_memberName];
        return _memberAddress;
    }

    modifier isRegisteredAddress(address _address) {
        require(
            (addressToMember[_address].id != 0x0000000000000000000000000000000000000000),
            "Address Is Not Registered"
        );
        _;
    }

    modifier isRegisteredName(string memory _memberName) {
        require(
            (memberNameToAddress[_memberName] != 0x0000000000000000000000000000000000000000),
            "Member Name Is Not Registered"
        );
        _;
    }
    
    modifier isNewMemberAddressAndName(string memory _memberName) {
        require(
            (bytes(_memberName).length > 0),
            "Member Name Required But Not Provided."
        );
        require(
            (addressToMember[msg.sender].id == 0x0000000000000000000000000000000000000000),
            "Ethereum Address Already Registered."
        );
        require(
            (memberNameToAddress[_memberName] == 0x0000000000000000000000000000000000000000),
            "Member Name Already Registered."
        );
        _;
    }
    
}