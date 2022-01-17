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
  });
  afterEach(async () => {
    provider.stop();
  });

  it('deploys contracts', async () => {
    assert.equal(erc20Addr === undefined, false);
    assert.equal(paymentsAddr === undefined, false);
  });

  it('view functions can be called', async () => {
    assert.equal(await paymentsDeploy.methods.erc20BalanceOf(account.address).call(), '100000000000000000000');
    assert.equal(await paymentsDeploy.methods.balanceOf(account.address).call(), '0');
    assert.equal(await paymentsDeploy.methods.allowance(account.address).call(), '0');
    assert.equal(await paymentsDeploy.methods.paymentWindow().call(), '864000');
    assert.equal(await paymentsDeploy.methods.acceptedCurrency().call(), currencyDescriptor);
    assert.equal(
      await paymentsDeploy.methods.enoughFundsAvailable(account.address, 1).call(),
      false,
    );
    assert.equal(await paymentsDeploy.methods.maxFundsAvailable(account.address).call(), '0');
    assert.equal(await paymentsDeploy.methods.computeFeeAmount(100, 100).call(), '1');
    const split = await paymentsDeploy.methods.splitFundingSources(account.address, 100).call();
    assert.equal(split.externalFunds, '100');
    assert.equal(split.localFunds, '0');
  });
});
