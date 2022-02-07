/* eslint-disable no-underscore-dangle */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { assert } = chai;

const Accounts = require('web3-eth-accounts');
const { Web3ProviderEngine, GanacheSubprovider } = require('@0x/subproviders');
const Contract = require('web3-eth-contract');
const Eth = require('web3-eth');
const fs = require('fs');
const myTokenJSON = require('./contracts/MyToken.json');
const PaymentsJSON = require('./contracts/PaymentsERC20.json');
const { ERC20Payments } = require('../dist/main');

// This is the private key of the first account created with Ganache given the mnemonic below
const pvk = 'F2F48EE19680706196E2E339E5DA3491186E0C4C5030670656B0E0164837257D';
const account = new Accounts().privateKeyToAccount(pvk);

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
let paymentsContract;
let paymentsDeploy;
let paymentsAddr;
let erc20Payments;
let eth;

describe('Payments in ERC20', () => {
  beforeEach(async () => {
    provider = new Web3ProviderEngine();
    provider.addProvider(ganacheSubprovider);
    provider.start();

    eth = new Eth(provider);

    // deploy MyToken ERC20
    erc20Contract = new Contract(myTokenJSON.abi);
    erc20Contract.setProvider(provider);
    erc20Deploy = await erc20Contract.deploy({
      data: myTokenJSON.bytecode,
      arguments: [name, symbol],
    }).send({ from: account.address, gas: 1500000, gasPrice: '30000000000000' });
    erc20Addr = erc20Deploy.options.address;

    // deploy Payments contract
    paymentsContract = new Contract(PaymentsJSON.abi);
    paymentsContract.setProvider(provider);
    paymentsDeploy = await paymentsContract.deploy({
      data: PaymentsJSON.bytecode,
      arguments: [erc20Addr, currencyDescriptor],
    }).send({ from: account.address, gas: 5000000, gasPrice: '3000000000000' });
    paymentsAddr = paymentsDeploy.options.address;

    // instantiate the payments class
    erc20Payments = new ERC20Payments({ paymentsAddr, erc20Addr, eth });
  });
  afterEach(async () => {
    provider.stop();
  });

  it('deploys contracts', async () => {
    assert.equal(erc20Addr === undefined, false);
    assert.equal(paymentsAddr === undefined, false);
  });

  it('view functions can be called', async () => {
    assert.equal(await erc20Payments.erc20BalanceOf({ address: account.address }), '100000000000000000000');
    assert.equal(await erc20Payments.balanceOf({ address: account.address }), '0');
    assert.equal(await erc20Payments.allowance({ address: account.address }), '0');
    assert.equal(await erc20Payments.paymentWindow(), '864000');
    assert.equal(await erc20Payments.acceptedCurrency(), currencyDescriptor);
    assert.equal(await erc20Payments.isRegisteredSeller({ address: account.address }), false);
    const paymentId = '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03';
    const STATES = ERC20Payments.PaymentStates();
    assert.equal(await erc20Payments.paymentState({ paymentId }), STATES.NotStarted);
    assert.equal(
      await erc20Payments.enoughFundsAvailable({ address: account.address, amount: 1 }),
      false,
    );
    assert.equal(await erc20Payments.maxFundsAvailable({ address: account.address }), '0');
    assert.equal(await erc20Payments.computeFeeAmount({ amount: 100, feeBPS: 100 }), '1');
    const split = await erc20Payments.splitFundingSources({
      address: account.address,
      amount: 100,
    });
    assert.equal(split.externalFunds, '100');
    assert.equal(split.localFunds, '0');
  });

  it('approve', async () => {
    await erc20Payments.approve({ spender: paymentsAddr, amount: 200, from: account.address });
    assert.equal(await erc20Payments.maxFundsAvailable({ address: account.address }), '200');
  });

  it('change provider reflects in the instance of the class automatically', async () => {
    // We first show that we query erc20 balance correctly.
    // Then we do eth.setProvider to a new, identical, ganache provider,
    // but without contracts deployed.
    // The very same query fails because the contract is not found.
    assert.equal(await erc20Payments.erc20BalanceOf({ address: account.address }), '100000000000000000000');
    provider.stop();

    const ganacheSubprovider2 = new GanacheSubprovider({
      logger,
      verbose: false,
      accounts: [{ balance: '1500000000000000000000000' }, { balance: '0x0' }],
      port: 8546,
      networkId: configs.networkId,
      mnemonic: configs.mnemonic,
    });
    const provider2 = new Web3ProviderEngine();
    provider2.addProvider(ganacheSubprovider2);
    provider2.start();

    eth.setProvider(provider2);
    await assert.isRejected(
      erc20Payments.erc20BalanceOf({ address: account.address }),
    );

    provider2.stop();
  });

  it('registerAsSeller', async () => {
    await erc20Payments.registerAsSeller({ from: account.address });
    assert.equal(await erc20Payments.isRegisteredSeller({ address: account.address }), true);
  });

  it('withdraw', async () => {
    await assert.isRejected(
      erc20Payments.withdraw({ from: account.address }),
      'VM Exception while processing transaction: revert cannot withdraw: balance is zero',
    );
  });

  it('ERC20Payments.isValidPaymentData', async () => {
    const data = {
      paymentId: '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
      amount: '32',
      feeBPS: 42,
      universeId: '1',
      validUntil: '24214',
      buyer: '0x223',
      seller: '0x2223',
    };
    assert.equal(ERC20Payments.isValidPaymentData({ paymentData: data }), true);
    data.feeBPS = 10000;
    assert.equal(ERC20Payments.isValidPaymentData({ paymentData: data }), true);
    data.feeBPS = 10001;
    assert.equal(ERC20Payments.isValidPaymentData({ paymentData: data }), false);
    data.feeBPS = 10000;
    delete data.universeId;
    assert.equal(ERC20Payments.isValidPaymentData({ paymentData: data }), false);
  });

  it('send TX', async () => {
    const data = {
      paymentId: '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
      amount: '32',
      feeBPS: 42,
      universeId: '1',
      validUntil: '24214',
      buyer: '0x56270bf851453EF41A060fb3C7427B9c3Cc0cde5',
      seller: '0x4f97a6d1fcf56be844d6b7510a21f407e9101d1e',
    };
    const signature = '0x009a76c8f1c6f4286eb295ddc60d1fbe306880cbc5d36178c67e97d4993d6bfc112c56ff9b4d988af904cd107cdcc61f11461d6a436e986b665bb88e1b6d32c81c';
    assert.equal(ERC20Payments.isValidPaymentData({ paymentData: data }), true);
    await assert.isRejected(
      erc20Payments.pay({ paymentData: data, signature, from: account.address }),
      'VM Exception while processing transaction: revert only buyer can execute this function',
    );
  });
});
