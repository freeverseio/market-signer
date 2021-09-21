/* eslint-disable no-underscore-dangle */
const { assert } = require('chai');
const rewire = require('rewire');
// const Abi = require('web3-eth-abi');
const Accounts = require('web3-eth-accounts');

const mktSigner = rewire('../src/MarketSigner');
const {
  signLinkId,
  signUnlinkId,
  signBankTransfer,
  signCardTransfer,
  signChangeIdAlias,
  signStolenEmail,
  signPayNow,
  signPutForSaleAuction,
  signPutForSaleBuyNow,
  signBid,
  signBidCertified,
  signBuyNow,
  signBuyNowCertified,
  signAcceptOffer,
  signOfferCertified,
  signOffer,
  getBidder,
  getBuyNowBuyer,
} = mktSigner;

const concatHash = mktSigner.__get__('concatHash');
const computeAuctionId = mktSigner.__get__('computeAuctionId');
const computePutForSaleDigest = mktSigner.__get__('computePutForSaleDigest');
const computeBidDigest = mktSigner.__get__('computeBidDigest');

it('deterministic signLinkId', async () => {
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const email = 'super.dooper@mylab.great';
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const signature = signLinkId({
    web3account: account,
    email,
    freeverseId,
  });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic signUnlinkId', async () => {
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const email = 'super.dooper@mylab.great';
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const signature = signUnlinkId({
    web3account: account,
    email,
    freeverseId,
  });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic signPayNow', async () => {
  const auctionId = '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03';
  const amount = '123.45';
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const signature = signPayNow({
    auctionId,
    amount,
    web3account: account,
  });
  const expected = '0xe230e61ee5eb56efbeae971775e62cef07705b3a3e1d347b73b80c9861d8e0325081f29941d9384d22b813644909582915172af89722a78ab420e4c4cf37facf1c';
  assert.equal(signature, expected);
});

it('deterministic signBankTransfer', async () => {
  const bankAccount = 'ES6621000418401123456789';
  const amount = '123.45';
  const nonce = '234132432';
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const signature = signBankTransfer({
    bankAccount,
    amount,
    marketUserNonce: nonce,
    web3account: account,
  });
  const expected = '0x66972c147a43ab945a20e3f53779576d633d379d2f5534c6ce7051c430702f522d8936cc1f754c3b84b5437d05e46a165f3f9c090eccab8e280962a2e3c69f8b1c';
  assert.equal(signature, expected);
});

it('deterministic signCardTransfer', async () => {
  const firstDigits = '6789';
  const lastFourDigits = '1234';
  const amount = '123.45';
  const nonce = '234132432';
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const signature = signCardTransfer({
    firstDigits,
    lastFourDigits,
    amount,
    marketUserNonce: nonce,
    web3account: account,
  });
  const expected = '0x96390c4143926c5147eb559efdfbefc9ac9e4400f7a168835c5e210b04ad2b7917ea0606b77feefb1847f902680357271d8f4bcad467d35fc2ff1afec65763721b';
  assert.equal(signature, expected);
});

it('deterministic signChangeIdAlias', async () => {
  const email = 'super.dooper@mylab.great';
  const alias = 'my gaming account';
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const signature = signChangeIdAlias({
    email,
    alias,
    freeverseId,
    web3account: account,
  });
  const expected = '0x296d9f3ae69fbe97f1b30997a98b780fb51a54af7476e587dd8bc2d6af4638846e08109d4dc44459294e1ec23f5949061e8fca318ea743511040ec67fc1e27c81c';
  assert.equal(signature, expected);
});

it('deterministic signStolenEmail', async () => {
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const signature = signStolenEmail({
    web3account: account,
    freeverseId,
  });
  const expected = '0x2808a64c2e34edcf78448345aeed8bc93e5b305f7f1b6536d2f8c3c4b94f01153c294de2c054ef46dfd51d35dc9cb7c23a87f807f6028ed0147b78dd3a78fb0c1c';
  assert.equal(signature, expected);
});

it('deterministic auctionId and digest', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days

  const auctionId1 = computeAuctionId({
    currencyId,
    price,
    sellerRnd: rnd,
    assetId,
    validUntil,
    offerValidUntil: 0,
    timeToPay,
  });
  assert.equal(auctionId1, '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03');

  const auctionId2 = computeAuctionId({
    currencyId,
    price,
    sellerRnd: rnd,
    assetId,
    validUntil,
    offerValidUntil,
    timeToPay,
  });
  assert.equal(auctionId2, '0x3f6a3102f21d4269ae1e9eac6172c102a6179ac04e21808bc95baaf6bf18c9fd');

  const auctionId3 = computeAuctionId({
    currencyId,
    price,
    sellerRnd:
    rnd,
    assetId,
    validUntil: 0,
    offerValidUntil,
    timeToPay,
  });
  assert.equal(auctionId3, '0x3f6a3102f21d4269ae1e9eac6172c102a6179ac04e21808bc95baaf6bf18c9fd');
});

it('deterministic signPutForSaleAuction', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const timeToPay = 172800; // 2 days
  const sellerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSignature = '0xd061068f94e92a1dbafcf7f883a2c03483848b2a2cab38d1262bb11d43e64fed0952910c5c3c6e56eaed4fa83acd5a3df189ef12b36718b1d32dbd3ac9e01af61b';
  const expectedDigest = '0x42ba074c235b5f1a017b7f82f31c77d6f9e8954258c1c52dc90e21ccbf49badc';

  const digest = computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil: 0,
    timeToPay,
    assetId,
  });
  assert.equal(digest, expectedDigest);

  const sigSeller = signPutForSaleAuction({
    currencyId, price, rnd, validUntil, timeToPay, assetId, sellerAccount,
  });
  assert.equal(sigSeller, expectedSignature);
});

it('deterministic signPutForSaleBuyNow', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const sellerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSignature = '0x9d7d39a3a62b75e8de09fda3da019ead171221faf853d5adc5fe2b65035c2e5a1e0e321240d5d223fb3c0a87d8347b77c517ae7c48f914cfa2d1b952b3a23fa91c';

  const sigSeller = signPutForSaleBuyNow({
    currencyId, price, rnd, validUntil, assetId, sellerAccount,
  });
  assert.equal(sigSeller, expectedSignature);
});

it('deterministic signAcceptOffer', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days
  const sellerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expected = '0xfc18ba14ff1ed175a50d2319bd919f5160b75337ef9d1446a9de9ec90d02ef903b548d57ff3fa43652c0c7b37a28bd2f8a31ea074d13dd3c2304c24da845b6e71b';

  const sigSeller = signAcceptOffer({
    currencyId, price, rnd, validUntil, offerValidUntil, timeToPay, assetId, sellerAccount,
  });
  assert.equal(sigSeller, expected);
});

it('deterministic signOfferCertified', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const offererRnd = 1234;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const offererAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSig = '0xd768887ddd3ab9fb862dd44fc710a7857bc079bc8787cf8d145f9ceb00db69cb49a7a2d74dcab0a8bbefa33632baac0b87c21c688d072c7f1f1b58c106eed6a51c';

  const signedOffer = signOfferCertified({
    currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, assetCID, offererAccount,
  });
  assert.equal(signedOffer, expectedSig);

  // Uncertified version:
  const signedOffer2 = signOffer(
    currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, offererAccount,
  );
  const expectedSig2 = '0x0168cefa72e1e3e441eae4e3a274f5dd9bd84a2efe5eae8e075c604b356925626100da319e57118957f76851883ba4479c435631e7a7b38bd2e0eb5e145474251b';
  assert.equal(signedOffer2, expectedSig2);
});

it('deterministic signBidCertified', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const sellerRnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const extraPrice = 32453;
  const buyerRnd = 435983;
  const buyerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSig = '0x463ec818cbb8a5bb243c982db9b73e5a984256fca534f81f1b92061014c1a02b50175f54c176fbdd68a8928e42e545cbd1ea736789ce63cceb51836153ac6ec11c';

  const signedOffer = signBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
    buyerAccount,
  });
  assert.equal(signedOffer, expectedSig);

  // uncertified version:
  const signedOffer2 = signBid({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
    buyerAccount,
  });
  const expectedSig2 = '0x826cd822e0ca0833816ea8bed88ce39856730f5a6d4f174528d3bdc0fa9dd01d4cf27ad6431341c2e26aabc765c6f99cee1a0944186e1d79481fbfb08119c5441c';
  assert.equal(signedOffer2, expectedSig2);

  // deterministic digests
  const digest = computeBidDigest({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
  });
  const expectedDigest = '0x69d15b633acb8e5ae6bd172ebacfa2d16d5468e261751b42b608eb2a1f4166e3';
  assert.equal(digest, expectedDigest);

  const bidderAddress = getBidder({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
    signature: signedOffer,
  });
  assert.equal(bidderAddress, buyerAccount.address);
});

it('deterministic buyNow', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const sellerRnd = 1234;
  const validUntil = 235985749;
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const buyerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSig = '0xc6a18f880897952a7f63021365e9b0a9acfd6edbdf5cf4e26b4ee22ea3e51da43062d80638b1187507fd6592cf3e02ad049861d88045fae56b085db512e0d6251b';

  const signedBuyNow = signBuyNowCertified({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetCID,
    assetId,
    buyerAccount,
  });
  assert.equal(signedBuyNow, expectedSig);

  // test that buyer can be recovered from signature
  const recoveredBuyer = getBuyNowBuyer({
    currencyId, price, sellerRnd, assetId, validUntil, assetCID, signature: signedBuyNow,
  });
  assert.equal(recoveredBuyer, buyerAccount.address);

  // uncertified version:
  const signedBuyNow2 = signBuyNow({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetId,
    buyerAccount,
  });
  const expectedSig2 = '0xae2299af1765d1deda7ab1378f5a66a9b55acbda0c7948fee5d578e60b87e20d5bd1bb1c4e868700557f2c4296f0c39ddd14c71fc0691abd77278cbfb6914ba11c';
  assert.equal(signedBuyNow2, expectedSig2);
});

it('deterministic signBidCertified with zero offerValidUntil', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const sellerRnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 0;
  const timeToPay = 172800; // 2 days
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const extraPrice = 32453;
  const buyerRnd = 435983;
  const buyerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSig = '0xf9d2ca75d8439825ecf5fb79b27076da60bc83d3e17ec493ba8c53204125d872274edf13c3c7abbf21aac190848fc9ddb97baa7c298c99116c7e11c26326e17c1b';

  const signedBid = signBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
    buyerAccount,
  });
  assert.equal(signedBid, expectedSig);

  // uncertified version:
  const signedOffer2 = signBid({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
    buyerAccount,
  });
  const expectedSig2 = '0xea650b8705009bc5795c70c34eecbfec5448d9809c641b04ea68ad9fbed83c0b4d4dff77cf1065528ce357f9300b20265e00946cc606e336aa928bcdbe3f12a41c';
  assert.equal(signedOffer2, expectedSig2);

  // deterministic digests
  const digest = computeBidDigest({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
  });
  const expectedDigest = '0xd249c945e520884d659633a0131ee2c3dc4b0a034620f675669262341a3ba745';
  assert.equal(digest, expectedDigest);

  const bidderAddress = getBidder({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
    signature: signedBid,
  });
  assert.equal(bidderAddress, buyerAccount.address);
});

it('deterministic signBidCertified with non-zero offerValidUntil and zero extraPrice and buyerRnd', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const sellerRnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const extraPrice = 0;
  const buyerRnd = 0;
  const buyerAccount = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
  const expectedSig = '0xd768887ddd3ab9fb862dd44fc710a7857bc079bc8787cf8d145f9ceb00db69cb49a7a2d74dcab0a8bbefa33632baac0b87c21c688d072c7f1f1b58c106eed6a51c';

  const signedBid = signBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
    buyerAccount,
  });
  assert.equal(signedBid, expectedSig);

  // uncertified version:
  const signedOffer2 = signBid({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
    buyerAccount,
  });
  const expectedSig2 = '0x0168cefa72e1e3e441eae4e3a274f5dd9bd84a2efe5eae8e075c604b356925626100da319e57118957f76851883ba4479c435631e7a7b38bd2e0eb5e145474251b';
  assert.equal(signedOffer2, expectedSig2);

  // deterministic digests
  const digest = computeBidDigest({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
  });
  const expectedDigest = '0xfd1a1f82869d4e47e889f6bbae3df252c4eddf24b02a2fbd1095b08ed0749455';
  assert.equal(digest, expectedDigest);

  const bidderAddress = getBidder({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
    signature: signedBid,
  });
  assert.equal(bidderAddress, buyerAccount.address);
});

it('Hash of concatenated args', () => {
  const someBytes32 = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const result = concatHash(['uint256', 'bytes32'], [1232, someBytes32]);
  const expected = '0x7522d1cef7c9def1b2b909d6e5d00a91f8ee07b51bc10f407986278971c2cbeb';
  assert.equal(result, expected);
});
