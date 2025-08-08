//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @title IExchange
 * @dev Interface for decentralized exchange functionality
 */
interface IExchange {
    struct Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }
    
    function feeAccount() external view returns (address);
    function feePercent() external view returns (uint256);
    function tokens(address token, address user) external view returns (uint256);
    // orders mapping is public state variable in implementation
    function orderCount() external view returns (uint256);
    function orderCancelled(uint256 id) external view returns (bool);
    function orderFilled(uint256 id) external view returns (bool);
    
    function depositToken(address token, uint256 amount) external;
    function withdrawToken(address token, uint256 amount) external;
    function balanceOf(address token, address user) external view returns (uint256);
    function makeOrder(address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive) external;
    function cancelOrder(uint256 id) external;
    function fillOrder(uint256 id) external;
    
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event OrderCreated(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp);
}