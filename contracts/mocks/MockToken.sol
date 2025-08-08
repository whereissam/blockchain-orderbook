//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../core/Token.sol";

/**
 * @title MockToken
 * @dev Mock token contract for testing purposes
 * @notice This contract should only be used for testing
 */
contract MockToken is Token {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) Token(_name, _symbol, _totalSupply) {}
    
    /**
     * @dev Mint tokens for testing purposes
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Burn tokens for testing purposes
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        require(balanceOf[from] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balanceOf[from] -= amount;
        emit Transfer(from, address(0), amount);
    }
}