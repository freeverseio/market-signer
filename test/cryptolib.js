/* eslint-disable no-underscore-dangle */
const { assert } = require('chai');
const Accounts = require('web3-eth-accounts');
const { Web3ProviderEngine, GanacheSubprovider } = require('@0x/subproviders');
const fs = require('fs');
const Eth = require('web3-eth');
const Contract = require('web3-eth-contract');
const myTokenJSON = require('../src/contracts/MyToken.json');
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
  accounts: [{ balance: '4500000000000000000000' }, { balance: '0x0' }],
  port: configs.port,
  networkId: configs.networkId,
  mnemonic: configs.mnemonic,
});

let provider;
beforeEach(async () => {
  provider = new Web3ProviderEngine();
});

it('deploys contract', async () => {
  provider.addProvider(ganacheSubprovider);
  provider.start();
  Contract.setProvider(provider);
  const contract = new Contract(myTokenJSON.abi);
  const name = 'TokenName';
  const symbol = 'TokenSymbol';
  const deploy = await contract.deploy({ data: myTokenJSON.bytecode, arguments: [name, symbol] });
  const sent = await deploy.send({ from: account.address, gas: 1500000, gasPrice: '30000000000000' });
  const contractAddr = sent.options.address;
  assert.equal(contractAddr === undefined, false);
  provider.stop();
});
