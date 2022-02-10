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
const PaymentsJSON = require('./contracts/IPaymentsERC20.json');

class ERC20Payments {
  constructor({ paymentsAddr, erc20Addr, eth }) {
    this.eth = eth;
    this.setAddresses({ paymentsAddr, erc20Addr });
  }

  setAddresses({ paymentsAddr, erc20Addr }) {
    this.erc20Contract = new this.eth.Contract(IERC20JSON.abi, erc20Addr);
    this.paymentsContract = new this.eth.Contract(PaymentsJSON.abi, paymentsAddr);
  }

  getAddresses() {
    return {
      paymentsAddr: this.paymentsContract.options.address,
      erc20Addr: this.erc20Contract.options.address,
    };
  }

  async registerAsSeller({ from }) {
    return this.paymentsContract.methods.registerAsSeller().send({ from });
  }

  async withdraw({ from }) {
    return this.paymentsContract.methods.withdraw().send({ from });
  }

  async pay({ paymentData, signature, from }) {
    return this.paymentsContract.methods.pay(paymentData, signature).send({ from });
  }

  async approve({ amount, from }) {
    return this.erc20Contract.methods.approve(
      this.paymentsContract.options.address,
      amount,
    ).send({ from });
  }

  async approveInfinite({ from }) {
    const MAX_UINT = Utils.toTwosComplement('-1');
    return this.erc20Contract.methods.approve(
      this.paymentsContract.options.address,
      MAX_UINT,
    ).send({ from });
  }

  async erc20BalanceOf({ address }) {
    return this.paymentsContract.methods.erc20BalanceOf(address).call();
  }

  async balanceOf({ address }) {
    return this.paymentsContract.methods.balanceOf(address).call();
  }

  async allowance({ address }) {
    return this.paymentsContract.methods.allowance(address).call();
  }

  async isRegisteredSeller({ address }) {
    return this.paymentsContract.methods.isRegisteredSeller(address).call();
  }

  async enoughFundsAvailable({ address, amount }) {
    return this.paymentsContract.methods.enoughFundsAvailable(address, amount).call();
  }

  async maxFundsAvailable({ address }) {
    return this.paymentsContract.methods.maxFundsAvailable(address).call();
  }

  async computeFeeAmount({ amount, feeBPS }) {
    return this.paymentsContract.methods.computeFeeAmount(amount, feeBPS).call();
  }

  async splitFundingSources({ address, amount }) {
    return this.paymentsContract.methods.splitFundingSources(address, amount).call();
  }

  async paymentState({ paymentId }) {
    return this.paymentsContract.methods.paymentState(paymentId).call();
  }

  async paymentWindow() {
    return this.paymentsContract.methods.paymentWindow().call();
  }

  async acceptedCurrency() {
    return this.paymentsContract.methods.acceptedCurrency().call();
  }

  static isValidPaymentData({ paymentData }) {
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'paymentId')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'amount')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'feeBPS')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'universeId')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'validUntil')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'buyer')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'seller')) return false;
    if (paymentData.feeBPS > 10000) return false;
    if (paymentData.buyer === paymentData.seller) return false;
    return true;
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

  static PaymentStates() {
    return {
      NotStarted: 0,
      AssetTransferring: 1,
      Failed: 2,
      Paid: 3,
    };
  }
}

module.exports = { ERC20Payments };
