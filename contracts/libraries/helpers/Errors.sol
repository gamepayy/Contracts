// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title Errors library
 * @author GamePayy
 * @notice Defines the error messages emitted by the different contracts of the Gamepayy protocol
 */
library Errors {

  //common errors
  error CALLER_NOT_POOL_ADMIN(); // 'The caller must be the pool admin'
  error CALLER_NOT_ADDRESS_PROVIDER();
  error INVALID_FROM_BALANCE_AFTER_TRANSFER();
  error INVALID_TO_BALANCE_AFTER_TRANSFER();
  error CALLER_NOT_ONBEHALFOF_OR_IN_WHITELIST();
  error ASSET_NOT_SUPPORTED();
  error INVALID_AMOUNT();
  error INSUFFICIENT_BALANCE();
  error TRANSFER_FAILED();

  //math library erros
  string public constant MATH_MULTIPLICATION_OVERFLOW = "200";
  string public constant MATH_ADDITION_OVERFLOW = "201";
  string public constant MATH_DIVISION_BY_ZERO = "202";

}