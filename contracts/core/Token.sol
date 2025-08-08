//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../interfaces/IToken.sol";

contract Token is IToken {
  string public name;
  string public symbol;
  uint256 public decimals = 18;
  uint256 public totalSupply;

  //Tract Balances
  mapping(address => uint256) public balanceOf;
  //Send Tokens

  mapping(address => mapping(address => uint256)) public allowance;

  // Events are defined in IToken interface

  constructor(string memory _name, string memory _symbol, uint256 _totalSupply){
    name = _name;
    symbol = _symbol;
    totalSupply = _totalSupply * (10 **decimals);
    balanceOf[msg.sender] = totalSupply;
  }

  function transfer(address _to, uint256 _value) 
    public 
    returns (bool success)
    {
      //Require that sender has enough tokens to spend
      require(balanceOf[msg.sender] >= _value); 

      _transfer(msg.sender, _to, _value);

      return true;
  }

  function _transfer(address _from, address _to, uint256 _value)internal{
     //Require that sender has enough tokens to spend
    //  console.log('transfer');
    //  console.log(balanceOf[msg.sender]);
    //  console.log(_value);
    //  console.log(balanceOf[_from] - _value);
      require(_to != address(0));

      //Deduct tokens from spender
      balanceOf[_from] = balanceOf[_from] - _value;
      //Credit tokens to receiver
      balanceOf[_to] = balanceOf[_to] + _value;

      //Emit Event
      emit Transfer(_from, _to, _value);
  }

  function approve(address _spender, uint256 _value) public returns(bool success){
    require(_spender != address(0));
    
    allowance[msg.sender][_spender] = _value;

    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool sucesss){
    // console.log(_from, _to, _value);
    // console.log(allowance[_from][msg.sender]);
    // console.log('deduct', allowance[_from][msg.sender] - _value);
    //check approval
    require(_value <= allowance[_from][msg.sender]);
    require(_value <= balanceOf[_from]);

    
    //Reset Allowance
    allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

    //spend token
    _transfer(_from, _to, _value);

    return true;
  }
}

