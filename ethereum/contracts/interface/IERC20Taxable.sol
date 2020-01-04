pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

interface IERC20Taxable {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
    function mint(address account, uint256 value) external;
    function withdraw(uint256 signalValue) external;
    function setCommunityTaxPoolAddress(address _communityTaxPoolAddress) external;
    function setDevelopmentTaxPoolAddress(address _developmentTaxPoolAddress) external;
    function getTaxedValue(uint256 _value) external returns (uint256);
    function setTaxRate(uint256 _taxRate) external;
}