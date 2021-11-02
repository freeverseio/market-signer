const { expect } = require('chai');
const { sign, verify } = require('../../src/b2bAuthentication/token');

describe('b2bAuthentication', () => {
  const pvk = 'c6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';

  it('sign', () => {
    const token = sign(pvk, 40);
    expect(token).equal('40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=');
  });

  it('verify', () => {
    const time = 40;
    const epsilon = 1;
    const decoded = verify(
      '40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=',
      time,
      epsilon,
    );

    expect(decoded.time).equal(time);
    expect(decoded.address).equal('0x426dbD2b27A3C53be05EBCf30354D86cee848d65');
  });

  it('sing and verify', () => {
    const epsilon = 0;
    const token = sign(pvk, 50);
    const decoded = verify(token, 50, epsilon);
    expect(decoded.address).equal('0x426dbD2b27A3C53be05EBCf30354D86cee848d65');
  });

  it('sing and verify fails', () => {
    const epsilon = 0;
    const time = 50;
    const token = sign(pvk, time);
    expect(() => verify(token, time + 1, epsilon)).to.throw('token out of time -1, epsilon 0');
  });

  it('check epsilon', () => {
    const epsilon = 1;
    const time = 50;
    const token = sign(pvk, time);
    expect(() => verify(token, time + 1, epsilon)).to.not.throw();
    expect(() => verify(token, time - 1, epsilon)).to.not.throw();
    expect(() => verify(token, time - 2, epsilon)).to.throw();
    expect(() => verify(token, time + 2, epsilon)).to.throw();
  });
});
