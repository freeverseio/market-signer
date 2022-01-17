/* eslint-disable no-underscore-dangle */
const { assert } = require('chai');
const Accounts = require('web3-eth-accounts');
const { Web3ProviderEngine, GanacheSubprovider } = require('@0x/subproviders');
const fs = require('fs');
const Contract = require('web3-eth-contract');
const myTokenJSON = require('../src/contracts/MyToken.json');
const PaymentsJSON = require('../src/contracts/PaymentsERC20.json');

const pvk = 'F2F48EE19680706196E2E339E5DA3491186E0C4C5030670656B0E0164837257D';
const account = new Accounts().privateKeyToAccount(pvk);

const STATE = {
  NotStarted: 0,
  AssetTransferring: 1,
  Failed: 2,
  Paid: 3,
};

function isValidPaymentData({ paymentData }) {
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

const configs = {
  port: 8545,
  networkId: 50,
  mnemonic: 'concert load couple harbor equip island argue ramp clarify fence smart topic',
};

const logger = {
  log: (arg) => {
    fs.appendFileSync('ganache.log', `${arg}\n`);
  },
};

const ganacheSubprovider = new GanacheSubprovider({
  logger,
  verbose: false,
  accounts: [{ balance: '4500000000000000000000000' }, { balance: '0x0' }],
  port: configs.port,
  networkId: configs.networkId,
  mnemonic: configs.mnemonic,
});

const name = 'TokenName';
const symbol = 'TokenSymbol';
const currencyDescriptor = 'TestERC20Token';

let provider;
let erc20Contract;
let erc20Deploy;
let erc20Addr;
let erc20;
let paymentsContract;
let paymentsDeploy;
let paymentsAddr;
let payments;

describe('Payments in ERC20', () => {
  beforeEach(async () => {
    provider = new Web3ProviderEngine();
    provider.addProvider(ganacheSubprovider);
    provider.start();
    Contract.setProvider(provider);
    // deploy MyToken ERC20
    erc20Contract = new Contract(myTokenJSON.abi);
    erc20Deploy = await erc20Contract.deploy({
      data: myTokenJSON.bytecode,
      arguments: [name, symbol],
    }).send({ from: account.address, gas: 1500000, gasPrice: '30000000000000' });
    erc20Addr = erc20Deploy.options.address;
    // deploy Payments contract
    paymentsContract = new Contract(PaymentsJSON.abi);
    paymentsDeploy = await paymentsContract.deploy({
      data: PaymentsJSON.bytecode,
      arguments: [erc20Addr, currencyDescriptor],
    }).send({ from: account.address, gas: 5000000, gasPrice: '3000000000000' });
    paymentsAddr = paymentsDeploy.options.address;
    // use only the contracts as they will be used: after deploy, passing addr as param:
    erc20 = await new Contract(myTokenJSON.abi, erc20Addr);
    payments = await new Contract(PaymentsJSON.abi, paymentsAddr);
  });
  afterEach(async () => {
    provider.stop();
  });

  it('deploys contracts', async () => {
    assert.equal(erc20Addr === undefined, false);
    assert.equal(paymentsAddr === undefined, false);
  });

  it('view functions can be called', async () => {
    assert.equal(await payments.methods.erc20BalanceOf(account.address).call(), '100000000000000000000');
    assert.equal(await payments.methods.balanceOf(account.address).call(), '0');
    assert.equal(await payments.methods.allowance(account.address).call(), '0');
    assert.equal(await payments.methods.paymentWindow().call(), '864000');
    assert.equal(await payments.methods.acceptedCurrency().call(), currencyDescriptor);
    assert.equal(await payments.methods.isRegisteredSeller(account.address).call(), false);
    assert.equal(await payments.methods.paymentState(account.address).call(), STATE.NotStarted);
    assert.equal(
      await payments.methods.enoughFundsAvailable(account.address, 1).call(),
      false,
    );
    assert.equal(await payments.methods.maxFundsAvailable(account.address).call(), '0');
    assert.equal(await payments.methods.computeFeeAmount(100, 100).call(), '1');
    const split = await payments.methods.splitFundingSources(account.address, 100).call();
    assert.equal(split.externalFunds, '100');
    assert.equal(split.localFunds, '0');
  });

  it('approve', async () => {
    await erc20.methods.approve(
      paymentsAddr, 200,
    ).send({ from: account.address });
    assert.equal(await payments.methods.maxFundsAvailable(account.address).call(), '200');
  });

  it('registerAsSeller', async () => {
    await payments.methods.registerAsSeller().send({ from: account.address });
    assert.equal(await payments.methods.isRegisteredSeller(account.address).call(), true);
  });

  it('withdraw', async () => {
    let err = new Error();
    try {
      await payments.methods.withdraw().send({ from: account.address });
    } catch (_err) {
      err = _err;
    }
    assert.equal(JSON.stringify(err.results).includes('balance is zero'), true);
  });

  it('isValidPaymentData', async () => {
    const data = {
      paymentId: '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
      amount: '32',
      feeBPS: 42,
      universeId: '1',
      validUntil: '24214',
      buyer: '0x223',
      seller: '0x2223',
    };
    assert.equal(isValidPaymentData({ paymentData: data }), true);
    data.feeBPS = 10000;
    assert.equal(isValidPaymentData({ paymentData: data }), true);
    data.feeBPS = 10001;
    assert.equal(isValidPaymentData({ paymentData: data }), false);
    data.feeBPS = 10000;
    delete data.universeId;
    assert.equal(isValidPaymentData({ paymentData: data }), false);
  });
});
