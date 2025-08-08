//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../libraries/ExchangeLib.sol";

/**
 * @title TestExchangeLib
 * @dev Test contract to expose ExchangeLib functions for testing
 */
contract TestExchangeLib {
    using ExchangeLib for uint256;
    
    function calculateFee(uint256 amount, uint256 feePercent) external pure returns (uint256) {
        return ExchangeLib.calculateFee(amount, feePercent);
    }
    
    function calculateAmountAfterFee(uint256 amount, uint256 feePercent) external pure returns (uint256) {
        return ExchangeLib.calculateAmountAfterFee(amount, feePercent);
    }
    
    function isValidOrder(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive
    ) external pure returns (bool) {
        return ExchangeLib.isValidOrder(tokenGet, amountGet, tokenGive, amountGive);
    }
    
    function getOrderHash(
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    ) external pure returns (bytes32) {
        return ExchangeLib.getOrderHash(user, tokenGet, amountGet, tokenGive, amountGive, timestamp);
    }
}