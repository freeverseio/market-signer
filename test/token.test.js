const { expect } = require('chai');
const Accounts = require('web3-eth-accounts');
const { getTokenDigest, composeToken, verifyToken } = require('../src/token');

describe('b2bAuthentication', () => {
  const pvk = 'c6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';
  const accounts = new Accounts();
  const publicAddress = accounts.privateKeyToAccount(pvk).address;

  it('getTokenDigest', () => {
    const tokenDigest = getTokenDigest({ time: 40 });
    expect(tokenDigest).equal('0xd1c9f4e71e13cebb5ee67eae8715ba8fddcf432e159ebca8f244f9263d1e6c85');
  });

  it('composeToken', () => {
    const tokenDigest = getTokenDigest({ time: 40 });
    const sig = accounts.sign(tokenDigest, pvk);
    const token = composeToken({ time: 40, sig: sig.signature });
    const recoveredSigner = accounts.recover(tokenDigest, sig.signature);
    const expectedToken = '40:4WeeOzgwyBHcp+cRn4EKF514tvToqpDCMiiO689MCBAW4mBR3Fnwrs+zeOecjBSQ5ZMqlcaYe6rI8SclL9EtpRs=';
    expect(token).equal(expectedToken);
    expect(sig.signature).equal('0xe1679e3b3830c811dca7e7119f810a179d78b6f4e8aa90c232288eebcf4c081016e26051dc59f0aecfb378e79c8c1490e5932a95c6987baac8f127252fd12da51b');
    expect(recoveredSigner).equal(publicAddress);
  });

  it('verifyToken', () => {
    const time = 40;
    const epsilon = 1;
    const token = '40:4WeeOzgwyBHcp+cRn4EKF514tvToqpDCMiiO689MCBAW4mBR3Fnwrs+zeOecjBSQ5ZMqlcaYe6rI8SclL9EtpRs=';
    const decoded = verifyToken({
      token,
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
    const expectedToken = '40:4WeeOzgwyBHcp+cRn4EKF514tvToqpDCMiiO689MCBAW4mBR3Fnwrs+zeOecjBSQ5ZMqlcaYe6rI8SclL9EtpRs=';
    expect(() => verifyToken({ token: expectedToken, time: 40, epsilon: 0 })).to.not.throw();
    expect(() => verifyToken({ token: '40,/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: '40:/BMyy:MjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: ':/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: ':', time: 40, epsilon: 0 })).to.throw();
  });
});
