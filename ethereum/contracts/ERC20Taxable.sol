pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { IERC20 } from "./interface/IERC20.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @dev Implementation of the `IERC20` interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using `_mint`.
 * For a generic mechanism see `ERC20Mintable`.
 *
 * *For a detailed writeup see our guide [How to implement supply
 * mechanisms](https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226).*
 *
 * We have followed general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an `Approval` event is emitted on calls to `transferFrom`.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard `decreaseAllowance` and `increaseAllowance`
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See `IERC20.approve`.
 */
contract ERC20Taxable is IERC20 {
    using SafeMath for uint256;

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    IERC20 public dai;
    address public governance;
    address public taxCommunityPool;
    address public taxDevelopmentPool;
    uint8 public taxRatePercent;
    uint8 public signalPerDai;

    constructor(address _governance, uint8 _taxRatePercent, address _taxCommunityPool, address _taxDevelopmentPool, IERC20 _dai, uint8 _signalPerDai) public {
        governance = _governance;
        taxRatePercent = _taxRatePercent;
        taxCommunityPool = _taxCommunityPool;
        taxDevelopmentPool = _taxDevelopmentPool;
        dai = _dai;
        signalPerDai = _signalPerDai;
    }

    /**
     * @dev See `IERC20.totalSupply`.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See `IERC20.balanceOf`.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See `IERC20.transfer`.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        uint256 amountMinusTax = _tax(msg.sender, amount);
        _transfer(msg.sender, recipient, amountMinusTax);
        return true;
    }

    /**
     * @dev See `IERC20.allowance`.
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See `IERC20.approve`.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev See `IERC20.transferFrom`.
     *
     * Emits an `Approval` event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of `ERC20`;
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `value`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        uint256 amountMinusTax = _tax(sender, amount);
        _transfer(sender, recipient, amountMinusTax);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount));
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to `approve` that can be used as a mitigation for
     * problems described in `IERC20.approve`.
     *
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to `approve` that can be used as a mitigation for
     * problems described in `IERC20.approve`.
     *
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].sub(subtractedValue));
        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to `transfer`, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a `Transfer` event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    /**
     * @dev Moves tax segment based on `taxRatePercent` of `amount` from `sender` to `taxCommunityPool` & `taxDevelopmentPool`.
     *
     * This is internal function runs a taxation mechanism at a transaction level
     * i.e. never need any weird forms of taxations or inflation, just have a transaction tax *percentage* instead.
     *
     * Emits a `Tax` event.
     *
     * Requirements:
     *
     * - `taxAmountPerPool` must be more than zero.
     * - `amountMinusTax` must be more than zero.
     */
    function _tax(address sender, uint256 amount) internal returns(uint256) {
        // Taxation System Start
        require(
            amount.mod(10000) == 0,
            "ERC20::_tax: amount must contain zero in the last 4 units of the wei unit (prevents Signal undercollatoralisation risk)."
        );
        uint256 taxAmountPerPool = amount.mul(taxRatePercent).div(200); // Half of total taxable amount
        require(taxAmountPerPool > 0, "_tax: averted");
        uint256 totalTaxAmount = taxAmountPerPool.mul(2); // Defining this because we use it in the event that we emit, too
        uint256 amountMinusTax = amount.sub(totalTaxAmount); // Total transfer minus tax
        require(amountMinusTax > 0, "_tax: pointless transaction");
        require(
            totalTaxAmount.mul(100).div(taxRatePercent) == amount,
            "ERC20::_tax: transaction value would cause collatoralisation leak"
        );
        require((amountMinusTax + totalTaxAmount) == amount, "_tax: transaction too small to preserve integer integrity");
        _transfer(sender, taxCommunityPool, taxAmountPerPool); // Forwards half of taxation to Community Pool
        _transfer(sender, taxDevelopmentPool, taxAmountPerPool); // Forwards half of taxation to Development Pool
        emit Tax(sender, totalTaxAmount);
        return amountMinusTax;
        // Taxation System End
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a `Transfer` event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal {
        require(
            amount.mod(10000) == 0,
            "ERC20::_mint: amount must contain zero in the last 4 units of the wei unit (prevents Signal undercollatoralisation risk)."
        );
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    /** @dev Withdraws equivalent value of DAI from this contract in exchange for Signal.
     * Signal is burned when DAI is withdrawn from reserve.
     * 
     * Emits a `Withdraw` event with `to` set to the DAI receiving address
     */
    function _withdraw(address account, uint256 daiValue, uint256 signalValue) internal {
        require(
            dai.transfer(account, daiValue),
            "ERC20::_withdraw: withdraw DAI transferFrom failed"
        );
        _burn(msg.sender, signalValue);
        require(
            dai.balanceOf(address(this)).mul(signalPerDai) == totalSupply(),
            "ERC20:_withdraw: withdraw would cause Signal undercollatoralisation leak"
        );
    }

    /** @dev Returns the resultant hypothetical value after tax */
    function _valueMinusTax(uint256 value) internal returns(uint256) {
        uint256 taxableAmount = value.mul(taxRatePercent).div(100);
        require(
            value.mod(10000) == 0,
            "ERC20::_valueMinusTax: value must contain zero in the last 4 units of the wei unit (prevents Signal undercollatoralisation risk)."
        );
        require(taxableAmount > 0, "ERC20::_valueMinusTax: taxable value would not be more than zero");
        uint256 amountMinusTax = value.sub(taxableAmount); // Total Signal minus taxable amount
        return amountMinusTax;
    }

     /**
     * @dev Destoys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a `Transfer` event with `to` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 value) internal {
        require(
            value.mod(10000) == 0,
            "ERC20: value must contain zero in the last 4 units of the wei unit (precautionary safeguard for Signal under-collatoralisation)."
        );
        require(account != address(0), "ERC20: burn from the zero address");

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    /**
     * @dev Destoys `amount` tokens from `account`.`amount` is then deducted
     * from the caller's allowance.
     *
     * See `_burn` and `_approve`.
     */
    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
        _approve(account, msg.sender, _allowances[account][msg.sender].sub(amount));
    }
}