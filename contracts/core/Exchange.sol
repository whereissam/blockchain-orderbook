//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";
import "../interfaces/IExchange.sol";
import "../interfaces/IToken.sol";
import "../libraries/ExchangeLib.sol";

contract Exchange is IExchange {
  address public feeAccount;
  uint256 public feePercent;
  mapping(address => mapping(address => uint256)) public tokens;
  mapping(uint256 => Order) public orders;
  uint256 public orderCount; 
  mapping(uint256 => bool) public orderCancelled; //true or false
  mapping(uint256 => bool) public orderFilled; //true or false


  // Events are defined in IExchange interface
  // Order struct is defined in IExchange interface
  

  constructor(address _feeAccount, uint256 _feePercent){
    feeAccount = _feeAccount;
    feePercent = _feePercent;
  }

  //Deposite Tokens
  function depositToken(address _token, uint256 _amount) public {
    //Transfer tokens to exchange
    require(Token(_token).transferFrom(msg.sender, address(this), _amount));
    //Update user balance
    tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
    //Emit an event
    emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
  }

  function withdrawToken(address _token, uint256 _amount) public {
    //Ensure user has enough tokens to withdraw
    require(tokens[_token][msg.sender] >= _amount);

    //Transfer tokens to uesr
    Token(_token).transfer(msg.sender, _amount);

    //Update user balance
    tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

    //Emit event
    emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
  }

  //Check Balances
  function balanceOf(address _token, address _user) public view returns(uint256){
    return tokens[_token][_user];
  }

  //-------------------
  //Make & cancel order 

  function makeOrder(address _tokenGet, uint256 _amountGet,address _tokenGive, uint256 _amountGive) public {
    //Prevent orders if tokens aren't on exchange
    require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
    
    
    //Token give (the token they want to spend)
    //Token get (the token they want to receive)

    //Instatiate a new order
    orderCount++;

    orders[orderCount] = Order(
      orderCount,
      msg.sender,
      _tokenGet,
      _amountGet,
      _tokenGive,
      _amountGive,
      block.timestamp
    );

    //Emit event
    emit OrderCreated(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);


  }

  function cancelOrder(uint256 _id) public {
    //Fetch order
    Order storage _order = orders[_id];

    //Ensure the caller of the function is the owner of the order
    require(address(_order.user) == msg.sender);

    //Order must exist
    require(_order.id == _id);

    //Cancel order
    orderCancelled[_id] = true;



    //Emit event
    emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);

  }

  //Executing orders
  function fillOrder(uint256 _id) public {
    // 1. Must be valid orderId
    require(_id > 0 && _id <= orderCount, "Order dose not exist");
    // 2. Order can't be filled
    require(!orderFilled[_id]);
    // 3. Order can't be cancelled
    require(!orderCancelled[_id]);

    //Fetch order
    Order storage _order = orders[_id];

    //Swapping Tokens(trading)
    _trade(
      _order.id,
      _order.user,
      _order.tokenGet,
      _order.amountGet,
      _order.tokenGive,
      _order.amountGive
    );

    //Mark order as filled
    orderFilled[_order.id] = true;

  }

  function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
    
    //Fee is paid by the user who filled the order(msg.sender)
    //Fee is deducted from _amountGet (the token the order filler is providing)
    uint256 _feeAmount = (_amountGet * feePercent) / 100;
    // console.log(_feeAmount);

    //Execute trade
    //msg.sender is the user who filled the order, while _user is who created the order  
    
    // Check balances before trading
    // Filler (msg.sender) provides what the order creator wants (tokenGet) and pays with that
    require(tokens[_tokenGet][msg.sender] >= _amountGet, "Filler insufficient balance for tokenGet");
    // Creator (_user) has what they're offering (tokenGive)
    require(tokens[_tokenGive][_user] >= _amountGive, "Creator insufficient tokenGive balance");
    
    // Order filler (msg.sender) gives what the creator wants (tokenGet)
    tokens[_tokenGet][msg.sender] =
            tokens[_tokenGet][msg.sender] - _amountGet;
    
    // Order creator (_user) receives what they wanted minus fee
    tokens[_tokenGet][_user] = 
            tokens[_tokenGet][_user] + (_amountGet - _feeAmount);
    
    // Fee account receives the fee (from what creator wanted)
    tokens[_tokenGet][feeAccount] =
            tokens[_tokenGet][feeAccount] + _feeAmount;
    
    // Order creator (_user) gives what they offered  
    tokens[_tokenGive][_user] = 
            tokens[_tokenGive][_user] - _amountGive;
    
    // Order filler (msg.sender) receives what the creator offered
    tokens[_tokenGive][msg.sender] =
            tokens[_tokenGive][msg.sender] + _amountGive;

    // Emit trade event
        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );

  }
}