const Accounts = require('web3-eth-accounts');

const sign = (pvk, time) => {
  const accounts = new Accounts();
  const result = accounts.sign(time.toString(), pvk);
  const sig = Buffer.from(result.signature.substring(2), 'hex').toString('base64');
  const token = `${time}:${sig}`;
  return token;
};

const verify = (token, time, epsilon) => {
  const s = token.split(':');
  const tunix = Number(s[0]);

  const delta = tunix - time;
  if (Math.abs(delta) > epsilon) {
    throw new Error(`token out of time ${delta}, epsilon ${epsilon}`);
  }

  const sig = Buffer.from(s[1], 'base64').toString('hex');

  const accounts = new Accounts();
  const address = accounts.recover(s[0], `0x${sig}`);
  return {
    address,
    time: tunix,
  };
};

module.exports = { sign, verify };
