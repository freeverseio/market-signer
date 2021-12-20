const { expect } = require('chai');
const { getToken, verifyToken } = require('../../src/b2bAuthentication/token');

describe('b2bAuthentication', () => {
  const pvk = 'c6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';

  it('getToken', () => {
    const token = getToken({ pvk, time: 40 });
    expect(token).equal('40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=');
  });

  it('verifyToken', () => {
    const time = 40;
    const epsilon = 1;
    const decoded = verifyToken({
      token: '40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=',
      time,
      epsilon,
    });

    expect(decoded.time).equal(time);
    expect(decoded.address).equal('0x426dbD2b27A3C53be05EBCf30354D86cee848d65');
  });

  it('sing and verifyToken', () => {
    const epsilon = 0;
    const time = 50;
    const token = getToken({ pvk, time });
    const decoded = verifyToken({ token, time, epsilon });
    expect(decoded.address).equal('0x426dbD2b27A3C53be05EBCf30354D86cee848d65');
  });

  it('sing and verifyToken fails', () => {
    const epsilon = 0;
    const time = 50;
    const token = getToken({ pvk, time });
    expect(() => verifyToken({ token, time: time + 1, epsilon })).to.throw('token out of time -1, epsilon 0');
  });

  it('check epsilon', () => {
    const epsilon = 1;
    const time = 50;
    const token = getToken({ pvk, time });
    expect(() => verifyToken({ token, time: time + 1, epsilon })).to.not.throw();
    expect(() => verifyToken({ token, time: time - 1, epsilon })).to.not.throw();
    expect(() => verifyToken({ token, time: time - 2, epsilon })).to.throw();
    expect(() => verifyToken({ token, time: time + 2, epsilon })).to.throw();
  });

  it('verifyToken malformed token', () => {
    expect(() => verifyToken({ token: '40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.not.throw();
    expect(() => verifyToken({ token: '40,/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: '40:/BMyy:MjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: ':/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=', time: 40, epsilon: 0 })).to.throw();
    expect(() => verifyToken({ token: ':', time: 40, epsilon: 0 })).to.throw();
  });
});
