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

const NativePaymentsJSON = require('./contracts/IPaymentsNative.json');

class NativeCryptoPayments {
  constructor({
    paymentsAddr, eth, confirmationBlocks,
  }) {
    this.eth = eth;
    this.setAddress({ paymentsAddr });
    this.setConfirmationBlocks({
      confirmationBlocks: confirmationBlocks || eth.transactionConfirmationBlocks,
    });
  }

  setAddress({ paymentsAddr }) {
    this.paymentsContract = new this.eth.Contract(NativePaymentsJSON.abi, paymentsAddr);
  }

  setConfirmationBlocks({ confirmationBlocks }) {
    this.paymentsContract.transactionConfirmationBlocks = confirmationBlocks;
  }

  getPaymentsAddr() {
    return this.paymentsContract.options.address;
  }

  registerAsSeller({ from }) {
    return this.paymentsContract.methods.registerAsSeller().send({ from, value: 0 });
  }

  withdraw({ from }) {
    return this.paymentsContract.methods.withdraw().send({ from, value: 0 });
  }

  finalizeAndWithdraw({ assetTransferData, signature, from }) {
    return this.paymentsContract.methods
      .finalizeAndWithdraw(assetTransferData, signature).send({ from, value: 0 });
  }

  pay({ paymentData, signature, from }) {
    return this.paymentsContract.methods.pay(paymentData, signature).send({ from, value: 0 });
  }

  finalize({ assetTransferData, signature, from }) {
    return this.paymentsContract.methods
      .finalize(assetTransferData, signature).send({ from, value: 0 });
  }

  balanceOf({ address }) {
    return this.paymentsContract.methods.balanceOf(address).call();
  }

  isRegisteredSeller({ address }) {
    return this.paymentsContract.methods.isRegisteredSeller(address).call();
  }

  enoughFundsAvailable({ address, amount }) {
    return this.paymentsContract.methods.enoughFundsAvailable(address, amount).call();
  }

  maxFundsAvailable({ address }) {
    return this.paymentsContract.methods.maxFundsAvailable(address).call();
  }

  computeFeeAmount({ amount, feeBPS }) {
    return this.paymentsContract.methods.computeFeeAmount(amount, feeBPS).call();
  }

  splitFundingSources({ address, amount }) {
    return this.paymentsContract.methods.splitFundingSources(address, amount).call();
  }

  paymentState({ paymentId }) {
    return this.paymentsContract.methods.paymentState(paymentId).call();
  }

  acceptsRefunds({ paymentId }) {
    return this.paymentsContract.methods.acceptsRefunds(paymentId).call();
  }

  paymentWindow() {
    return this.paymentsContract.methods.paymentWindow().call();
  }

  acceptedCurrency() {
    return this.paymentsContract.methods.acceptedCurrency().call();
  }

  static isValidPaymentData({ paymentData }) {
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'paymentId')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'amount')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'feeBPS')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'universeId')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'deadline')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'buyer')) return false;
    if (!Object.prototype.hasOwnProperty.call(paymentData, 'seller')) return false;
    if (paymentData.feeBPS > 10000) return false;
    if (paymentData.buyer === paymentData.seller) return false;
    return true;
  }

  static isValidAssetTransferData({ assetTransferData }) {
    if (!Object.prototype.hasOwnProperty.call(assetTransferData, 'paymentId')) return false;
    if (!Object.prototype.hasOwnProperty.call(assetTransferData, 'wasSuccessful')) return false;
    return true;
  }

  static PaymentStates() {
    return {
      NotStarted: 0,
      AssetTransferring: 1,
      Refunded: 2,
      Paid: 3,
    };
  }
}

module.exports = { NativeCryptoPayments };
