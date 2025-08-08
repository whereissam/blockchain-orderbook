//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @title ExchangeLib
 * @dev Library containing utility functions for exchange operations
 */
library ExchangeLib {
    /**
     * @dev Calculate fee amount based on amount and fee percentage
     * @param amount The base amount
     * @param feePercent The fee percentage (in basis points, e.g., 100 = 1%)
     * @return The calculated fee amount
     */
    function calculateFee(uint256 amount, uint256 feePercent) internal pure returns (uint256) {
        return (amount * feePercent) / 10000;
    }
    
    /**
     * @dev Calculate amount after deducting fee
     * @param amount The base amount
     * @param feePercent The fee percentage (in basis points)
     * @return The amount after fee deduction
     */
    function calculateAmountAfterFee(uint256 amount, uint256 feePercent) internal pure returns (uint256) {
        uint256 fee = calculateFee(amount, feePercent);
        return amount - fee;
    }
    
    /**
     * @dev Check if an order is valid
     * @param tokenGet Address of token to receive
     * @param amountGet Amount to receive
     * @param tokenGive Address of token to give
     * @param amountGive Amount to give
     * @return true if order is valid, false otherwise
     */
    function isValidOrder(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive
    ) internal pure returns (bool) {
        return tokenGet != address(0) && 
               tokenGive != address(0) && 
               tokenGet != tokenGive && 
               amountGet > 0 && 
               amountGive > 0;
    }
    
    /**
     * @dev Calculate order hash for unique identification
     * @param user Order creator
     * @param tokenGet Token to receive
     * @param amountGet Amount to receive
     * @param tokenGive Token to give
     * @param amountGive Amount to give
     * @param timestamp Order timestamp
     * @return Order hash
     */
    function getOrderHash(
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            user,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            timestamp
        ));
    }
}