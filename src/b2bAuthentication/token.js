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
