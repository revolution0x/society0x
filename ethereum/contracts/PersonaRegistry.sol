pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { ISignal } from "./interface/ISignal.sol";

/**
 * @title PersonaRegistry
 * @dev A list of Ethereum addresses that belong to unique humans as determined by Humanity governance.
 */
contract PersonaRegistry {

    mapping (address => bool) public humans;

    ISignal public signal;
    address public governance;

    constructor(ISignal _signal, address _governance) public {
        signal = _signal;
        governance = _governance;
    }

    function add(address who) public {
        require(msg.sender == governance, "PersonaRegistry::add: Only governance can add an identity");
        require(humans[who] == false, "PersonaRegistry::add: Address is already on the registry");

        _reward(who);
        humans[who] = true;
    }

    function remove(address who) public {
        require(
            msg.sender == governance || msg.sender == who,
            "PersonaRegistry::remove: Only governance or the identity owner can remove an identity"
        );
        delete humans[who];
    }

    function isPersona(address who) public view returns (bool) {
        return humans[who];
    }

    function _reward(address who) internal {
        uint totalSupply = signal.totalSupply();

        if (totalSupply < 28000000e18) {
            signal.mint(who, 30000e18); // 1 - 100
        } else if (totalSupply < 46000000e18) {
            signal.mint(who, 20000e18); // 101 - 1000
        } else if (totalSupply < 100000000e18) {
            signal.mint(who, 6000e18); // 1001 - 10000
        }

    }

}