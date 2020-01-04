pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract MockDAI is ERC20 {

    string public version = "0.0.1";
    string public constant name = "DAI";
    string public constant symbol = "DAI";
    uint8 public constant decimals = 18;
    uint256 public constant MOCK_SUPPLY = 100e18;

    constructor() public {
        _mint(msg.sender, MOCK_SUPPLY);
    }

    function mint(address account, uint value) public {
        _mint(account, value);
    }

}