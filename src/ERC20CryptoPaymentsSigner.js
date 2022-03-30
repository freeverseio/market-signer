// Copyright (c) 2021 Freeverse.io <dev@freeverse.io>
// Library for signing API calls to Living Assets market

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const Utils = require('web3-utils');
const IERC20JSON = require('./contracts/IERC20.json');
const ERC20PaymentsJSON = require('./contracts/IPaymentsERC20.json');
const { NativeCryptoPayments } = require('./NativeCryptoPaymentsSigner');

class ERC20Payments extends NativeCryptoPayments {
  constructor({
    paymentsAddr, erc20Addr, eth, confirmationBlocks,
  }) {
    super({ paymentsAddr, eth, confirmationBlocks });
    this.eth = eth;
    this.setAddress({ paymentsAddr, erc20Addr });
    this.setConfirmationBlocks({
      confirmationBlocks: confirmationBlocks || eth.transactionConfirmationBlocks,
    });
  }

  setAddress({ paymentsAddr, erc20Addr }) {
    this.erc20Contract = new this.eth.Contract(IERC20JSON.abi, erc20Addr);
    this.paymentsContract = new this.eth.Contract(ERC20PaymentsJSON.abi, paymentsAddr);
  }

  setConfirmationBlocks({ confirmationBlocks }) {
    this.erc20Contract.transactionConfirmationBlocks = confirmationBlocks;
    this.paymentsContract.transactionConfirmationBlocks = confirmationBlocks;
  }

  getAddress() {
    return {
      paymentsAddr: this.paymentsContract.options.address,
      erc20Addr: this.erc20Contract.options.address,
    };
  }

  pay({ paymentData, signature, from }) {
    return this.paymentsContract.methods.pay(paymentData, signature).send({ from, value: 0 });
  }

  approve({ amount, from }) {
    return this.erc20Contract.methods.approve(
      this.paymentsContract.options.address,
      amount,
    ).send({ from, value: 0 });
  }

  approveInfinite({ from }) {
    const MAX_UINT = Utils.toTwosComplement('-1');
    return this.erc20Contract.methods.approve(
      this.paymentsContract.options.address,
      MAX_UINT,
    ).send({ from, value: 0 });
  }

  erc20BalanceOf({ address }) {
    return this.paymentsContract.methods.erc20BalanceOf(address).call();
  }

  allowance({ address }) {
    return this.paymentsContract.methods.allowance(address).call();
  }

  static isAllowanceUnrestricted({ allowance }) {
    if (typeof allowance !== 'string') {
      throw new Error('allowance is not a string');
    }
    const allowanceBN = Utils.toBN(allowance);
    const MAX_UINT = Utils.toTwosComplement('-1');
    const LARGER_IS_CONSIDERED_INFINITE = Utils.toBN(MAX_UINT).div(Utils.toBN(10));
    return allowanceBN.cmp(LARGER_IS_CONSIDERED_INFINITE) === 1;
  }
}

module.exports = { ERC20Payments };
