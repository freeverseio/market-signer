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

const Contract = require('web3-eth-contract');
const IERC20JSON = require('./contracts/IERC20.json');
const PaymentsJSON = require('./contracts/PaymentsERC20.json');

class ERC20Payments {
  constructor({ paymentsAddr, erc20Addr }) {
    this.paymentsAddr = paymentsAddr;
    this.erc20Addr = erc20Addr;
    this.erc20Contract = {};
    this.paymentsContract = {};
  }

  async setupContracts() {
    this.erc20Contract = await new Contract(IERC20JSON.abi, this.erc20Addr);
    this.paymentsContract = await new Contract(PaymentsJSON.abi, this.paymentsAddr);
  }

  async registerAsSeller({ from }) {
    await this.paymentsContract.methods.registerAsSeller().send({ from });
  }

  async withdraw({ from }) {
    await this.paymentsContract.methods.withdraw().send({ from });
  }

  async pay({ paymentData, signature, from }) {
    await this.paymentsContract.methods.pay(paymentData, signature).send({ from });
  }

  async approve({ spender, amount, from }) {
    await this.erc20Contract.methods.approve(spender, amount).send({ from });
  }

  async erc20BalanceOf({ address }) {
    const balance = await this.paymentsContract.methods.erc20BalanceOf(address).call();
    return balance;
  }

  async balanceOf({ address }) {
    const balance = await this.paymentsContract.methods.balanceOf(address).call();
    return balance;
  }

  async allowance({ address }) {
    const allnc = await this.paymentsContract.methods.allowance(address).call();
    return allnc;
  }

  async isRegisteredSeller({ address }) {
    const is = await this.paymentsContract.methods.isRegisteredSeller(address).call();
    return is;
  }

  async enoughFundsAvailable({ address, amount }) {
    const enough = await this.paymentsContract.methods.enoughFundsAvailable(address, amount).call();
    return enough;
  }

  async maxFundsAvailable({ address }) {
    const max = await this.paymentsContract.methods.maxFundsAvailable(address).call();
    return max;
  }

  async computeFeeAmount({ amount, feeBPS }) {
    const feeAmount = await this.paymentsContract.methods.computeFeeAmount(amount, feeBPS).call();
    return feeAmount;
  }

  async splitFundingSources({ address, amount }) {
    const split = await this.paymentsContract.methods.splitFundingSources(address, amount).call();
    return split;
  }

  async paymentState({ paymentId }) {
    const state = await this.paymentsContract.methods.paymentState(paymentId).call();
    return state;
  }

  async paymentWindow() {
    const allnc = await this.paymentsContract.methods.paymentWindow().call();
    return allnc;
  }

  async acceptedCurrency() {
    const curr = await this.paymentsContract.methods.acceptedCurrency().call();
    return curr;
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
