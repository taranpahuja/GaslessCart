pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @dev A simple ERC-20 token simulating a stablecoin for testing purposes.
 */

contract MockUSDC is ERC20 {
    constructor() ERC20("MockUSDC", "mUSDC") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function publicMint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
