const { expect } = require('chai');
const Accounts = require('web3-eth-accounts');
const { getTokenDigest, composeToken, verifyToken } = require('../../src/b2bAuthentication/token');

describe('b2bAuthentication', () => {
  const pvk = 'c6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';
  const accounts = new Accounts();
  const publicAddress = accounts.privateKeyToAccount(pvk).address;
  const expectedDigest = '0x9a8d614bfb9a8b09159202e8efd5bf10f2a2872e8a2d5793a8d4433782dac62b';
  const expectedSignature = '0xda051587d4db816fe100b382b22406b6ebd2c241e79d2bd9eb2f16bc631ee2181a67a2aea80e52afb685798c1cdf41179db5c47ac4e777446354c763dfe40e9f1b';
  const expectedToken = '40:2gUVh9TbgW/hALOCsiQGtuvSwkHnnSvZ6y8WvGMe4hgaZ6KuqA5Sr7aFeYwc30EXnbXEesTnd0RjVMdj3+QOnxs=';

  it('getTokenDigest', () => {
    const tokenDigest = getTokenDigest({ time: 40 });
    expect(tokenDigest).equal(expectedDigest);
  });

  it('composeToken', () => {
    const tokenDigest = getTokenDigest({ time: 40 });
    const sig = accounts.sign(tokenDigest, pvk);
    const token = composeToken({ time: 40, sig: sig.signature });
    const recoveredSigner = accounts.recover(tokenDigest, sig.signature);
    expect(token).equal(expectedToken);
    expect(sig.signature).equal(expectedSignature);
    expect(recoveredSigner).equal(publicAddress);
  });

  it('verifyToken', () => {
    const time = 40;
    const epsilon = 1;
    const decoded = verifyToken({
      token: expectedToken,
      time,
      epsilon,
    });

    expect(decoded.time).equal(time);
    expect(decoded.address).equal(publicAddress);
  });

  it('sing and verifyToken', () => {
    const epsilon = 0;
    const time = 50;
    const tokenDigest = getTokenDigest({ time });
    const sig = accounts.sign(tokenDigest, pvk);
    const token = composeToken({ time, sig: sig.signature });
    const decoded = verifyToken({ token, time, epsilon });
    expect(decoded.address).equal(publicAddress);
  });

  it('sing and verifyToken fails', () => {
    const epsilon = 0;
    const time = 50;
    const tokenDigest = getTokenDigest({ time });
    const sig = accounts.sign(tokenDigest, pvk);
    const token = composeToken({ time, sig: sig.signature });
    expect(() => verifyToken({ token, time: time + 1, epsilon })).to.throw('token out of time -1, epsilon 0');
  });

  it('check epsilon', () => {
    const epsilon = 1;
    const time = 50;
    const tokenDigest = getTokenDigest({ time });
    const sig = accounts.sign(tokenDigest, pvk);
    const token = composeToken({ time, sig: sig.signature });
    expect(() => verifyToken({ token, time: time + 1, epsilon })).to.not.throw();
    expect(() => verifyToken({ token, time: time - 1, epsilon })).to.not.throw();
    expect(() => verifyToken({ token, time: time - 2, epsilon })).to.throw();
    expect(() => verifyToken({ token, time: time + 2, epsilon })).to.throw();
  });

  it('verifyToken malformed token', () => {
    expect(() => verifyToken({ token: expectedToken, time: 40, epsilon: 0 })).to.not.throw();
    expect(() => verifyToken({ token: '40,/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: '40:/BMyy:MjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: ':/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: ':', time: 40, epsilon: 0 })).to.throw();
  });
});
