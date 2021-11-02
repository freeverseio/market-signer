// Copyright (c) 2021 Freeverse.io <dev@freeverse.io>

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

const Accounts = require('web3-eth-accounts');

/**
 * Should be used to create a authentication token
 *
 * @method types
 * @param {String} pvk signer private key
 * @param {Number} time time of issue since epoch in seconds
 * @return {String} the token
 */
const sign = (pvk, time) => {
  if (typeof time !== 'number') {
    throw new Error('time is not a number');
  }

  const accounts = new Accounts();
  const result = accounts.sign(time.toString(), pvk);
  const sig = Buffer.from(result.signature.substring(2), 'hex').toString('base64');
  const token = `${time}:${sig}`;
  return token;
};

/**
 * Should be used to verify an authentication token
 *
 * @method types
 * @param {String} token the token to verify
 * @param {Number} time time which will be used to verify the token
 * @param {Number} epsilon [time-eplison, time+epsilon] is the validity interval
 * @return {Object} the issuer address and the time of issuace
 */
const verify = (token, time, epsilon) => {
  if (typeof time !== 'number') {
    throw new Error('time is not a number');
  }
  if (typeof epsilon !== 'number') {
    throw new Error('epsilon is not a number');
  }

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
