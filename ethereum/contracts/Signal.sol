pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { IERC20 } from "./interface/IERC20.sol";
import { ERC20Taxable } from "./ERC20Taxable.sol";


/**
 * @title Signal
 * @dev ERC20Taxable Signal token can be used for constructive or destructive interference in harmony with other signals.
 */
contract Signal is ERC20Taxable {

    string public version = "0.0.1";
    string public constant name = "Signal";
    string public constant symbol = "dB";

    uint8 public constant decimals = 18;
    uint8 public taxRatePercent;
    uint8 public signalPerDai;

    IERC20 public dai;
    address public governance;
    address public taxCommunityPool;
    address public taxDevelopmentPool;

    constructor(address _governance, uint8 _taxRatePercent, address _taxCommunityPool, address _taxDevelopmentPool, IERC20 _dai, uint8 _signalPerDai) public ERC20Taxable(_governance, _taxRatePercent, _taxCommunityPool, _taxDevelopmentPool, _dai, _signalPerDai) {
        governance = _governance;
        taxRatePercent = _taxRatePercent;
        taxCommunityPool = _taxCommunityPool;
        taxDevelopmentPool = _taxDevelopmentPool;
        dai = _dai;
        signalPerDai = _signalPerDai;
    }

    function mint(uint256 signalValue) public {
        require(
            signalValue.mod(10000) == 0,
            "Signal::mint: Signal input value must contain zero in the last 4 units of the Signal amount (prevents Signal undercollatoralisation risk)."
        );
        require(
            totalSupply().add(signalValue) > 0,
            "Signal::mint: Supply would exceed maximum safe uint (2^256)."
        );
        require(
            dai.allowance(msg.sender, address(this)) >= signalValue.div(signalPerDai),
            "Signal::mint: DAI allowance is not sufficient for minting requested value of Signal."
        );
        require(
            dai.transferFrom(msg.sender, address(this), signalValue.div(signalPerDai)),
            "Signal::mint: DAI transfer failed, make sure DAI balance is sufficient for minting requested value of Signal."
        );
        require(
            signalValue.div(signalPerDai).mul(signalPerDai) == signalValue,
            "Signal::mint:  Signal undercollatoralisation risk (try using less degrees of precision/decimal places)."
        );
        _mint(msg.sender, signalValue);
    }

    function withdraw(uint256 signalValue) public {
        require(
            signalValue.mod(10000) == 0,
            "Signal::_withdraw: Signal input value must contain zero in the last 4 units of the wei unit (prevents Signal undercollatoralisation risk)."
        );
        require(
            msg.sender != 0x0000000000000000000000000000000000000000,
            "Signal::withdraw: Withdraw address can not be void address"
        );
        require(
            balanceOf(msg.sender).sub(signalValue) >= 0,
            "Signal::withdraw: Withdraw address does not have balance sufficient to fulfil withdraw request"
        );
        require(
            dai.balanceOf(address(this)) >= signalValue.div(signalPerDai),
            "Signal::withdraw: DAI reserve is not large enough to fulfil this withdraw request"
        );
        _withdraw(msg.sender, signalValue.div(signalPerDai), signalValue);
    }

    function getTaxedValue(uint256 _value) public view returns(uint256) {
        // This function simulates transaction taxation, the internal _tax function should be used for actual Signal taxation
        require(
            _value.mod(10000) == 0,
            "ERC20::_tax: _value must contain zero in the last 4 units of the wei unit (prevents Signal undercollatoralisation risk)."
        );
        uint256 taxValue = _value.mul(taxRatePercent).div(100); // Whole value of taxable _value
        require(taxValue > 0, "_tax: averted");
        uint256 amountMinusTax = _value.sub(taxValue); // Total transfer minus tax
        require(amountMinusTax > 0, "_tax: pointless transaction");
        return amountMinusTax;
    }

    function setTaxCommunityPool(address _taxCommunityPool) public {
        require(msg.sender == governance, "Governance::setTaxCommunityPool: Community tax pool address can only be set via governance");
        taxCommunityPool = _taxCommunityPool;
    }

    function setTaxDevelopmentPool(address _taxDevelopmentPool) public {
        require(msg.sender == governance, "Governance::setTaxDevelopmentPool: Development tax pool can only be set via governance");
        taxDevelopmentPool = _taxDevelopmentPool;
    }

}
