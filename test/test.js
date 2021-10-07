/* eslint-disable no-underscore-dangle */
const { assert } = require('chai');
const rewire = require('rewire');
const Accounts = require('web3-eth-accounts');
const { digestBuyNowFromBuyNowId, digestBuyNowFromBuyNowIdCertified } = require('../src/MarketSigner');

const mktSigner = rewire('../src/MarketSigner');
const {
  sign,
  digestLinkId,
  digestUnlinkId,
  digestBankTransfer,
  digestCardTransfer,
  digestChangeIdAlias,
  digestStolenEmail,
  digestPayNow,
  digestPutForSaleAuction,
  digestPutForSaleBuyNow,
  digestBid,
  digestBidFromAuctionId,
  digestBidCertified,
  digestBidFromAuctionIdCertified,
  digestBuyNow,
  digestBuyNowCertified,
  digestAcceptOffer,
  digestOfferCertified,
  digestOffer,
  getBidder,
  getBuyNowBuyer,
} = mktSigner;

const concatHash = mktSigner.__get__('concatHash');
const computeAuctionId = mktSigner.__get__('computeAuctionId');
const computeBuyNowId = mktSigner.__get__('computeBuyNowId');
const computePutForSaleDigest = mktSigner.__get__('computePutForSaleDigest');
const account = new Accounts().privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');

it('deterministic digestLinkId', async () => {
  const email = 'super.dooper@mylab.great';
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestLinkId({ email, freeverseId });
  const signature = sign({ digest, web3account: account });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic digestUnlinkId', async () => {
  const email = 'super.dooper@mylab.great';
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestUnlinkId({ email, freeverseId });
  const signature = sign({ digest, web3account: account });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic digestPayNow', async () => {
  const auctionId = '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03';
  const amount = '123.45';
  const digest = digestPayNow({ auctionId, amount });
  const signature = sign({ digest, web3account: account });
  const expected = '0xe230e61ee5eb56efbeae971775e62cef07705b3a3e1d347b73b80c9861d8e0325081f29941d9384d22b813644909582915172af89722a78ab420e4c4cf37facf1c';
  assert.equal(signature, expected);
});

it('deterministic digestBankTransfer', async () => {
  const bankAccount = 'ES6621000418401123456789';
  const amount = '123.45';
  const nonce = '234132432';
  const digest = digestBankTransfer({ bankAccount, amount, marketUserNonce: nonce });
  const signature = sign({ digest, web3account: account });
  const expected = '0x66972c147a43ab945a20e3f53779576d633d379d2f5534c6ce7051c430702f522d8936cc1f754c3b84b5437d05e46a165f3f9c090eccab8e280962a2e3c69f8b1c';
  assert.equal(signature, expected);
});

it('deterministic digestCardTransfer', async () => {
  const firstDigits = '6789';
  const lastFourDigits = '1234';
  const amount = '123.45';
  const nonce = '234132432';
  const digest = digestCardTransfer({
    firstDigits,
    lastFourDigits,
    amount,
    marketUserNonce: nonce,
  });
  const signature = sign({ digest, web3account: account });
  const expected = '0x96390c4143926c5147eb559efdfbefc9ac9e4400f7a168835c5e210b04ad2b7917ea0606b77feefb1847f902680357271d8f4bcad467d35fc2ff1afec65763721b';
  assert.equal(signature, expected);
});

it('deterministic digestChangeIdAlias', async () => {
  const email = 'super.dooper@mylab.great';
  const alias = 'my gaming account';
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestChangeIdAlias({ email, alias, freeverseId });
  const signature = sign({ digest, web3account: account });
  const expected = '0x296d9f3ae69fbe97f1b30997a98b780fb51a54af7476e587dd8bc2d6af4638846e08109d4dc44459294e1ec23f5949061e8fca318ea743511040ec67fc1e27c81c';
  assert.equal(signature, expected);
});

it('deterministic digestStolenEmail', async () => {
  const freeverseId = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestStolenEmail({ freeverseId });
  const signature = sign({ digest, web3account: account });
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
  assert.equal(auctionId1, 'b884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03');

  const auctionId2 = computeAuctionId({
    currencyId,
    price,
    sellerRnd: rnd,
    assetId,
    validUntil,
    offerValidUntil,
    timeToPay,
  });
  assert.equal(auctionId2, '3f6a3102f21d4269ae1e9eac6172c102a6179ac04e21808bc95baaf6bf18c9fd');

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
  assert.equal(auctionId3, '3f6a3102f21d4269ae1e9eac6172c102a6179ac04e21808bc95baaf6bf18c9fd');
});

it('deterministic digestPutForSaleAuction', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const timeToPay = 172800; // 2 days
  const sellerAccount = account;
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

  const digest2 = digestPutForSaleAuction({
    currencyId, price, rnd, validUntil, timeToPay, assetId,
  });
  const sigSeller = sign({ digest: digest2, web3account: sellerAccount });
  assert.equal(sigSeller, expectedSignature);
});

it('deterministic digestPutForSaleBuyNow', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const sellerAccount = account;
  const expectedSignature = '0x9d7d39a3a62b75e8de09fda3da019ead171221faf853d5adc5fe2b65035c2e5a1e0e321240d5d223fb3c0a87d8347b77c517ae7c48f914cfa2d1b952b3a23fa91c';

  const digest = digestPutForSaleBuyNow({
    currencyId, price, rnd, validUntil, assetId,
  });
  const sigSeller = sign({ digest, web3account: sellerAccount });
  assert.equal(sigSeller, expectedSignature);
});

it('deterministic digestAcceptOffer', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days
  const sellerAccount = account;
  const expected = '0xfc18ba14ff1ed175a50d2319bd919f5160b75337ef9d1446a9de9ec90d02ef903b548d57ff3fa43652c0c7b37a28bd2f8a31ea074d13dd3c2304c24da845b6e71b';

  const digest = digestAcceptOffer({
    currencyId, price, rnd, validUntil, offerValidUntil, timeToPay, assetId,
  });
  const sigSeller = sign({ digest, web3account: sellerAccount });
  assert.equal(sigSeller, expected);
});

it('deterministic digestOfferCertified', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const offererRnd = 1234;
  const offerValidUntil = 4358487;
  const timeToPay = 172800; // 2 days
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const offererAccount = account;
  const expectedSig = '0x198d90ecd8cb014663f619a5b10bf707d4c113c004ad32c27f390ad4054111b61ea4441725bdbe17a0bd0b945613434b690cff62782d114f367cf4dffd7fcb141c';

  const digest = digestOfferCertified({
    currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, assetCID,
  });
  const signedOffer = sign({ digest, web3account: offererAccount });
  assert.equal(signedOffer, expectedSig);

  // Uncertified version:
  const digest2 = digestOffer({
    currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay,
  });
  const signedOffer2 = sign({ digest: digest2, web3account: offererAccount });
  const expectedSig2 = '0xf363258cd03b1e674a5898bfa4534373f41fa5fb58161bb8a2fa71295b0364350476234ea9b0dcaed4b5b975015a8352a186ee8c1ac06abab6e08a9bf68f16bc1c';
  assert.equal(signedOffer2, expectedSig2);
});

it('deterministic digestBidCertified', async () => {
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
  const buyerAccount = account;
  const expectedSig = '0x82a0282b61956ce9c252f2f593861446b7a6e5eec07b3ec1352b3d11c7532bb20fafa647d84ec042385f17b02db2a7e210b8a0f5b71d031b7be52167c4efc2011c';

  const digest = digestBidCertified({
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
  const signedBid = sign({ digest, web3account: buyerAccount });
  assert.equal(signedBid, expectedSig);

  // uncertified version:
  const digest2 = digestBid({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
  });
  const signedBid2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0x97e9152e52d548685b8d656974aa0084d48e1c820910042b49b4b2ebafad3e3f462a9a2c9702553d1f8ca118ee58f56c037163d04feec7ead743356d4f2710b71c';
  assert.equal(signedBid2, expectedSig2);

  // via auctionID:
  const auctionId = computeAuctionId({
    currencyId,
    price,
    sellerRnd,
    assetId,
    validUntil,
    offerValidUntil,
    timeToPay,
  });
  const digest2b = digestBidFromAuctionId({
    auctionId,
    extraPrice,
    buyerRnd,
  });
  const signedBid2b = sign({ digest: digest2b, web3account: buyerAccount });
  assert.equal(signedBid2, signedBid2b);

  // deterministic digests
  const digest3 = digestBidCertified({
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
  const expectedDigest = '0xad62c22e9fde8c54f9026527f054942a05f3a405398c948c3629ec1d98b0a7d9';
  assert.equal(digest3, expectedDigest);

  // from AuctionId
  const digest3b = digestBidFromAuctionIdCertified({
    auctionId,
    extraPrice,
    buyerRnd,
    assetCID,
  });
  assert.equal(digest3, digest3b);

  // Retrieving bidder:
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

it('deterministic buyNow', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const sellerRnd = 1234;
  const validUntil = 235985749;
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const buyerAccount = account;
  const expectedSig = '0x58075717aac8cfc61cb6741e9a3e7d42e9fe3a9db8b16b059cb42bb0a1a4a595708ce9bf3af78d31e34b84824a6fd2baeba88236b961a441eb22c3d7c05f7fac1c';

  const digest = digestBuyNowCertified({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetCID,
    assetId,
  });
  const signedBuyNow = sign({ digest, web3account: buyerAccount });
  assert.equal(signedBuyNow, expectedSig);

  // test that buyer can be recovered from signature
  const recoveredBuyer = getBuyNowBuyer({
    currencyId, price, sellerRnd, assetId, validUntil, assetCID, signature: signedBuyNow,
  });
  assert.equal(recoveredBuyer, buyerAccount.address);

  const buyNowId = computeBuyNowId({
    currencyId, price, sellerRnd, validUntil, assetId,
  });

  assert.equal(buyNowId, '0x03214d89eb62587cbb48c9056dba878f839a4ebad3ad75f8826d76c566e4acd0');

  const digest1b = digestBuyNowFromBuyNowIdCertified({
    buyNowId,
    assetCID,
  });
  assert.equal(digest, digest1b);

  // uncertified version:
  const digest2 = digestBuyNow({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetId,
  });
  const signedBuyNow2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0xc43b5461569f4f34e1eadaae1707f10b2f27278b0e0cf3c7e15502bcf68f9e6e24583f0d2d1247829e8c7a806c9596a530ebd60aea58aee65aff9f9ec9eb814d1c';
  assert.equal(signedBuyNow2, expectedSig2);

  const digest3 = digestBuyNowFromBuyNowId({ buyNowId });
  assert.equal(digest2, digest3);
});

it('deterministic digestBidCertified with zero offerValidUntil', async () => {
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
  const buyerAccount = account;
  const expectedSig = '0x16961a09e49c4caacbcc0d59274b500417f4da7d2979322688bddcb5c26a8a670aa367f8d13d4b5e94b656113adaec2442a7214c41a096a16d35e5495665ba091c';

  const digest = digestBidCertified({
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
  const signedBid = sign({ digest, web3account: buyerAccount });
  assert.equal(signedBid, expectedSig);

  // uncertified version:
  const digest2 = digestBid({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
  });
  const signedBid2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0x65143a034f11ca37d01c784fa07b3b5dda0cee0d325466d6b3d6ea1e0665b8302bfeb32e912753627a0dc3ca9ecb2cce3448b2939d05af69660dafbf6ba3f4911c';
  assert.equal(signedBid2, expectedSig2);

  // deterministic digests
  const digest3 = digestBidCertified({
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
  const expectedDigest = '0xd2cc40ef7460838f04ea32be89bdccffb9971b7b84d7c8309e778d5fd0a300db';
  assert.equal(digest3, expectedDigest);

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

it('deterministic digestBidCertified with non-zero offerValidUntil and zero extraPrice and buyerRnd', async () => {
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
  const buyerAccount = account;
  const expectedSig = '0x198d90ecd8cb014663f619a5b10bf707d4c113c004ad32c27f390ad4054111b61ea4441725bdbe17a0bd0b945613434b690cff62782d114f367cf4dffd7fcb141c';

  const digest = digestBidCertified({
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
  const signedBid = sign({ digest, web3account: buyerAccount });
  assert.equal(signedBid, expectedSig);

  // uncertified version:
  const digest2 = digestBid({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
  });
  const signedBid2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0xf363258cd03b1e674a5898bfa4534373f41fa5fb58161bb8a2fa71295b0364350476234ea9b0dcaed4b5b975015a8352a186ee8c1ac06abab6e08a9bf68f16bc1c';
  assert.equal(signedBid2, expectedSig2);

  // deterministic digests
  const digest3 = digestBidCertified({
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
  const expectedDigest = '0x3c4d637e1f3eb54319652ee0c8a82f8e88aeec5d67b0a19b65d4f4ffc07dcd6d';
  assert.equal(digest3, expectedDigest);

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
  const result = concatHash({
    types: ['uint256', 'bytes32'],
    vals: [1232, someBytes32],
  });
  const expected = '0x7522d1cef7c9def1b2b909d6e5d00a91f8ee07b51bc10f407986278971c2cbeb';
  assert.equal(result, expected);
});
