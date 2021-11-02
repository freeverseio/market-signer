const { expect } = require('chai');
const { sign, verify } = require('../src/b2bAuthentication/token');

describe('token', () => {
  const pvk = 'c6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';

  it('sign', () => {
    const token = sign(pvk, 40);
    expect(token).equal('40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=');
  });

  it('verify', () => {
    const decoded = verify('40:/BMyyMjBrQPF86Y2kRBWxHd4HPXCWRxuMMc5q6n44NEjQQrM0W7csM+wkTbOQvH6pRlxHp8bV9CIpnCuwcD5Zxs=');

    expect(decoded.time).equal(40);
    expect(decoded.address).equal('0x426dbD2b27A3C53be05EBCf30354D86cee848d65');
  });

  it('sing and verify', () => {
    const pvk2 = '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709';
    const epsilon = 0;
    const token = sign(pvk2, 50);
    const decoded = verify(token, 50, epsilon);
    expect(decoded.address).equal('0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01');
  });
});
