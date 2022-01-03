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

const Utils = require('web3-utils');
const Abi = require('web3-eth-abi');
const Accounts = require('web3-eth-accounts');

/**
 * Concats the values in vals array, interpreting them as defined by the types array,
 * and hashes the result using keccak256.
 *
 * @method types
 * @param {Array of Strings} types: the types of the variables
 * @param {Array of Strings} vals: the values to be concatenated
 * @return {String} the hash of the concatenated values
*/
function concatHash({ types, vals }) {
  return Utils.keccak256(Abi.encodeParameters(types, vals));
}

/**
 * Should be used as first step to create an authentication token.
 * Returns the digest that needs to be signed by owner of privateKey,
 * and then passed to the composeToken method.
 *
 * @method types
 * @param {Number} time: the time of issue since epoch in seconds
 * @return {String} the digest to be signed
 */
const getTokenDigest = ({ time }) => {
  if (typeof time !== 'number') {
    throw new Error('time is not a number');
  }
  return concatHash({
    types: ['string', 'string'],
    vals: ['B2BTokenSalt', time.toString()],
  });
};

/**
 * Should be used to create an authentication token
 *
 * @method types
 * @param {Number} time: time of issue since epoch in seconds
 * @param {String} sig: the signature of the token digest
 * @return {String} the token
 */
const composeToken = ({ time, sig }) => {
  if (typeof time !== 'number') {
    throw new Error('time is not a number');
  }
  if (typeof sig !== 'string') {
    throw new Error('sig is not a string');
  }
  const token = `${time.toString()}:${sig}`;
  return token;
};

/**
 * Should be used to verify an authentication token
 *
 * @method types
 * @param {String} token the token to verify
 * @param {Number} time time which will be used to verify the token
 * @param {Number} epsilon [time-epsilon, time+epsilon] is the validity interval
 * @return {Object} the issuer address and the time of issuace
 */
const verifyToken = ({ token, time, epsilon }) => {
  if (typeof time !== 'number') {
    throw new Error('time is not a number');
  }
  if (typeof epsilon !== 'number') {
    throw new Error('epsilon is not a number');
  }

  const [s0, s1] = token.split(':');
  const tunix = Number(s0);

  const delta = tunix - time;
  if (Math.abs(delta) > epsilon) {
    throw new Error(`token out of time ${delta}, epsilon ${epsilon}`);
  }

  const accounts = new Accounts();
  const digest = getTokenDigest({ time: tunix });
  const address = accounts.recover(digest, s1);
  return {
    address,
    time: tunix,
  };
};

module.exports = { getTokenDigest, composeToken, verifyToken };
