pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


/**
 * @title Signal
 * @dev ERC20 token that can be used as a signalling mechanism in the context of Society0x
 */
contract Signal is ERC20 {

    string public constant name = "Signal";
    string public constant symbol = "SIG";
    uint8 public constant decimals = 18;
    string public version = "0.0.1";

    uint public constant INITIAL_SUPPLY = 25000000e18; // 25 million
    uint public constant FINAL_SUPPLY = 100000000e18; // 100 million

    address public registry;

    constructor(address _registry) public {
        registry = _registry;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mint(address account, uint256 value) public {
        require(msg.sender == registry, "Signal::mint: Only the registry can mint new tokens");
        require(totalSupply().add(value) <= FINAL_SUPPLY, "Signal::mint: Exceeds final supply");

        _mint(account, value);
    }

}
