const { expect } = require('chai');
const Accounts = require('web3-eth-accounts');
const { getTokenDigest, composeToken, verifyToken } = require('../../src/b2bAuthentication/token');

describe('b2bAuthentication', () => {
  const pvk = 'c6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';
  const accounts = new Accounts();
  const publicAddress = accounts.privateKeyToAccount(pvk).address;
  const expectedDigest = '0x3e4201e8f4ef0d11d58e52993d88268f6c912152f5536eb52af937dd0553c4b2';
  const expectedSignature = '0xc09abc8b63d327fac96e8765153edd5e9ffe4fe8f1a7006f340f411e2a90c29c0f2aeb88c9bdf30b4ba2a8f44f27ea05baecc330db16e5000831f46c2b7c8bf61b';
  const expectedToken = '40:wJq8i2PTJ/rJbodlFT7dXp/+T+jxpwBvNA9BHiqQwpwPKuuIyb3zC0uiqPRPJ+oFuuzDMNsW5QAIMfRsK3yL9hs=';

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
