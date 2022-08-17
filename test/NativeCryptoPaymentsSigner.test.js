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
const { NativeCryptoPayments } = require('../dist/main');
const PaymentsNativeJSON = require('./contracts/PaymentsNative.json');
const EIP712JSON = require('./contracts/EIP712Verifier.json');

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

const currencyDescriptor = 'TestNativeCoin';

let provider;
let nativePayments;
let EIP712deploy;
let paymentsDeploy;
let paymentsAddr;
let eth;

describe('Payments in Native Cryptocurrencies', () => {
  beforeEach(async () => {
    provider = new Web3ProviderEngine();
    provider.addProvider(ganacheSubprovider);
    provider.start();

    eth = new Eth(provider);

    // deploy EIP712 contract
    const EIP712contract = new Contract(EIP712JSON.abi);
    EIP712contract.setProvider(provider);
    EIP712deploy = await EIP712contract.deploy({
      data: EIP712JSON.bytecode,
    }).send({ from: account.address, gas: 5000000, gasPrice: '3000000000000' });

    // deploy Payments contract
    const paymentsContract = new Contract(PaymentsNativeJSON.abi);
    paymentsContract.setProvider(provider);
    paymentsDeploy = await paymentsContract.deploy({
      data: PaymentsNativeJSON.bytecode,
      arguments: [currencyDescriptor, EIP712deploy.options.address],
    }).send({ from: account.address, gas: 5000000, gasPrice: '3000000000000' });
    paymentsAddr = paymentsDeploy.options.address;

    // instantiate the payments class
    nativePayments = new NativeCryptoPayments({ paymentsAddr, eth });
  });
  afterEach(async () => {
    provider.stop();
  });

  it('deploys contracts', async () => {
    assert.equal(paymentsAddr === undefined, false);
  });

  it('setAddress works', async () => {
    assert.equal(nativePayments.getPaymentsAddr(), paymentsAddr);
    const rndAddress = '0x0A7817021EDd5BDbD1025c3aB73be9177faF7000';
    nativePayments.configure({
      paymentsAddr: rndAddress,
    });
    assert.equal(nativePayments.getPaymentsAddr(), rndAddress);
  });

  it('default ConfirmationBlocks works', async () => {
    const initConfirmationsDefault = nativePayments.eth.transactionConfirmationBlocks;
    const initConfirmationsContr2 = nativePayments.paymentsContract.transactionConfirmationBlocks;
    assert.equal(initConfirmationsDefault, initConfirmationsContr2);
    assert.equal(initConfirmationsDefault, 24);
  });

  it('init ConfirmationBlocks works', async () => {
    const nativePayments2 = new NativeCryptoPayments({
      paymentsAddr, eth, confirmationBlocks: 3,
    });
    const initConfirmationsDefault = nativePayments2.eth.transactionConfirmationBlocks;
    const initConfirmationsContr2 = nativePayments2.paymentsContract.transactionConfirmationBlocks;
    assert.equal(initConfirmationsDefault, 24);
    assert.equal(initConfirmationsContr2, 3);
  });

  it('set new ConfirmationBlocks works', async () => {
    nativePayments.configure({ confirmationBlocks: 4 });
    const initConfirmationsDefault = nativePayments.eth.transactionConfirmationBlocks;
    const initConfirmationsContr2 = nativePayments.paymentsContract.transactionConfirmationBlocks;
    assert.equal(initConfirmationsDefault, 24);
    assert.equal(initConfirmationsContr2, 4);
  });

  it('view functions can be called', async () => {
    assert.equal(await nativePayments.balanceOf({ address: account.address }), '0');
    assert.equal(await nativePayments.paymentWindow(), '2592000');
    assert.equal(await nativePayments.acceptedCurrency(), currencyDescriptor);
    assert.equal(await nativePayments.isRegisteredSeller({ address: account.address }), false);
    const paymentId = '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03';
    const STATES = NativeCryptoPayments.PaymentStates();
    assert.equal(await nativePayments.paymentState({ paymentId }), STATES.NotStarted);
    assert.equal(
      await nativePayments.enoughFundsAvailable({ address: account.address, amount: 1 }),
      true,
    );
    const maxFundsAvailable = await nativePayments.maxFundsAvailable({ address: account.address });
    assert.equal(Number(maxFundsAvailable) > 0, true);
    assert.equal(await nativePayments.computeFeeAmount({ amount: 100, feeBPS: 100 }), '1');
    const split = await nativePayments.splitFundingSources({
      address: account.address,
      amount: 100,
    });
    assert.equal(split.externalFunds, '100');
    assert.equal(split.localFunds, '0');
  });

  it('change provider reflects in the instance of the class automatically', async () => {
    // We first show that we query erc20 balance correctly.
    // Then we do eth.setProvider to a new, identical, ganache provider,
    // but without contracts deployed.
    // The very same query fails because the contract is not found.
    assert.equal(await nativePayments.balanceOf({ address: account.address }), '0');
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
      nativePayments.balanceOf({ address: account.address }),
    );

    provider2.stop();
  });

  it('registerAsSeller', async () => {
    await nativePayments.registerAsSeller({ from: account.address });
    assert.equal(await nativePayments.isRegisteredSeller({ address: account.address }), true);
  });

  it('withdraw', async () => {
    await assert.isRejected(
      nativePayments.withdraw({ from: account.address }),
      'VM Exception while processing transaction: revert cannot withdraw zero amount',
    );
  });

  it('NativeCryptoPayments.isValidPaymentData', async () => {
    const data = {
      paymentId: '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
      amount: '32',
      feeBPS: 42,
      universeId: '1',
      deadline: '24214',
      buyer: '0x223',
      seller: '0x2223',
    };
    assert.equal(NativeCryptoPayments.isValidPaymentData({ paymentData: data }), true);
    data.feeBPS = 10000;
    assert.equal(NativeCryptoPayments.isValidPaymentData({ paymentData: data }), true);
    data.feeBPS = 10001;
    assert.equal(NativeCryptoPayments.isValidPaymentData({ paymentData: data }), false);
    data.feeBPS = 10000;
    delete data.universeId;
    assert.equal(NativeCryptoPayments.isValidPaymentData({ paymentData: data }), false);
  });

  it('signature correctly verified (tested against Solidity)', async () => {
    const data = {
      paymentId: '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
      amount: '23',
      feeBPS: 500,
      universeId: '1',
      deadline: '1646175615',
      buyer: '0x5Ca59cbA5D0D0D604bF59cD0e7b3cD3c350142BE',
      seller: '0xBDcaD33BA6eF2086F2511610Fa5Bedaf062CC1Cf',
    };

    const operatorPvk = 'aaf06722787393a80c2079882825f9777f003949bb7d41af20c4efe64f6a31f3';
    const operatorAcc = new Accounts().privateKeyToAccount(operatorPvk);
    const signature = '0x82ba2795090e608e8ed5b7065566354804a119b583e4cfb39ff7143026bb3a5973e3f4928cca9cc72778cce9d31630b9ba6f3f7fac47c4176cd3c7c0dcd9343d1c';
// 
    const b = await eth.getChainId();
    console.log(b);
    const eip712 = new eth.Contract(EIP712JSON.abi, EIP712deploy.options.address);
    const a = await eip712.methods.verifyPayment(data, signature, operatorAcc.address).call();
    assert.equal(a, true);
  });

  it('pay fails if not buyer', async () => {
    const data = {
      paymentId: '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
      amount: '32',
      feeBPS: 42,
      universeId: '1',
      deadline: '24214',
      buyer: '0x56270bf851453EF41A060fb3C7427B9c3Cc0cde5',
      seller: '0x4f97a6d1fcf56be844d6b7510a21f407e9101d1e',
    };
    const signature = '0x009a76c8f1c6f4286eb295ddc60d1fbe306880cbc5d36178c67e97d4993d6bfc112c56ff9b4d988af904cd107cdcc61f11461d6a436e986b665bb88e1b6d32c81c';
    assert.equal(NativeCryptoPayments.isValidPaymentData({ paymentData: data }), true);
    await assert.isRejected(
      nativePayments.pay({ paymentData: data, signature, from: account.address }),
      'VM Exception while processing transaction: revert',
    );
  });
});
