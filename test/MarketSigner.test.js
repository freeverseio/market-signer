/* eslint-disable no-underscore-dangle */
const { assert } = require('chai');
const rewire = require('rewire');
const Accounts = require('web3-eth-accounts');
const { encryptRSAWithPublicKey } = require('../src/MarketSigner');

const {
  digestBuyNowFromBuyNowId,
  digestBuyNowFromBuyNowIdCertified,
  sign,
  digestLinkId,
  digestUnlinkId,
  digestLinkAddress,
  digestUnlinkAddress,
  digestCashout,
  digestChangeIdAlias,
  digestStolenEmail,
  digestStolenEmailByAddress,
  digestChangeAlias,
  digestCancelBuyNow,
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
  plannedSubmissionTime,
  plannedSubmissionVerse,
  expiresAtTime,
  getExpiryData,
} = require('../dist/main');

const mktSigner = rewire('../src/MarketSigner');

const concatHash = mktSigner.__get__('concatHash');
const computeAuctionId = mktSigner.__get__('computeAuctionId');
const computeBuyNowId = mktSigner.__get__('computeBuyNowId');
const computePutForSaleDigest = mktSigner.__get__('computePutForSaleDigest');
const account = new Accounts().privateKeyToAccount(
  '0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54',
);

it('plannedSubmissionTime, plannedSubmissionVerse and expiresAtTime', async () => {
  const randomTime = 1634217828;
  const interval = 900;
  const safetyMargin = 240;
  const defaultSafetyMargin = 300;

  assert.equal(
    plannedSubmissionTime({
      verse: 3,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    randomTime + 2 * interval,
  );

  assert.equal(
    plannedSubmissionTime({
      verse: '3',
      referenceVerse: '1',
      referenceTime: randomTime.toString(),
      verseInterval: interval.toString(),
    }),
    randomTime + 2 * interval,
  );

  assert.equal(
    expiresAtTime({
      verse: 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
      safetyMargin,
    }),
    randomTime + interval - safetyMargin,
  );

  assert.equal(
    expiresAtTime({
      verse: 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    randomTime + interval - defaultSafetyMargin,
  );

  assert.equal(
    expiresAtTime({
      verse: 3,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
      safetyMargin,
    }),
    randomTime + 3 * interval - safetyMargin,
  );

  assert.equal(
    plannedSubmissionVerse({
      time: randomTime + 2 * interval - 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    3,
  );

  assert.equal(
    plannedSubmissionVerse({
      time: randomTime - 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    1,
  );
  assert.equal(
    plannedSubmissionVerse({
      time: randomTime + 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    2,
  );

  const expirationData = getExpiryData({
    time: randomTime + 2 * interval - 1,
    referenceVerse: 1,
    referenceTime: randomTime,
    verseInterval: interval,
    safetyMargin,
  });

  assert.equal(expirationData.lastValidVerse, 2);
  assert.equal(
    expirationData.expirationTime,
    randomTime + 2 * interval - safetyMargin,
  );

  assert.equal(
    expiresAtTime({
      verse: 2,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
      safetyMargin,
    }),
    expirationData.expirationTime,
  );

  assert.equal(
    plannedSubmissionVerse({
      time: randomTime + interval + 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    3,
  );
  assert.equal(
    plannedSubmissionVerse({
      time: randomTime + 2 * interval + 1,
      referenceVerse: 1,
      referenceTime: randomTime,
      verseInterval: interval,
    }),
    4,
  );
});

it('deterministic digestLinkId', async () => {
  const email = 'super.dooper@mylab.great';
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestLinkId({ email, web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic digestLinkAddress', async () => {
  const email = 'super.dooper@mylab.great';
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestLinkAddress({ email, web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic digestUnlinkId', async () => {
  const email = 'super.dooper@mylab.great';
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestUnlinkId({ email, web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic digestUnlinkAddress', async () => {
  const email = 'super.dooper@mylab.great';
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestUnlinkAddress({ email, web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x3531526e836fd00e30d3812c7d7f95d4abeb502c03a40e2171650c79e3435f21414cff8394e64a3ec0930fb290623dd0681e126dd75f53eeec49a2f815e3b8201b';
  assert.equal(signature, expected);
});

it('deterministic digestPayNow', async () => {
  const auctionId = '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03';
  const amount = '123.45';
  const digest = digestPayNow({ auctionId, amount });
  const signature = sign({ digest, web3account: account });
  const expected = '0xfcf88c8e103169e37a7c2d5094c920b2dfaa61b0551306871cc5a0f5e9bbe4e97397348cebd59be7376e4fdd76fa21a456523c7607f5feda07d8f687432c04aa1c';
  assert.equal(signature, expected);
});

it('deterministic digestCashout', async () => {
  // pymentId can refer to either an auctionId or a buyNowId
  const paymentId = '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03';
  const iban = 'NL74INGB9985747011';
  const digest = digestCashout({ paymentId, iban });
  assert.equal(
    digest,
    '0xbb7c44c78b091b7796ebdf589cbf0af318f148e9b1c5e75b21aede577d82afa4',
  );
  const signature = sign({ digest, web3account: account });
  const expected = '0xc09b37519795caeb5bdfeac57ddc5021dd98c84d5156d5c34f4c035f126faab248c8dbe39bc622e05b4535b6f5c1b4deecb79397d6359b7b219dac554e642f101c';
  assert.equal(signature, expected);
});

it('deterministic digestChangeIdAlias', async () => {
  const email = 'super.dooper@mylab.great';
  const alias = 'my gaming account';
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestChangeIdAlias({ email, alias, web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x296d9f3ae69fbe97f1b30997a98b780fb51a54af7476e587dd8bc2d6af4638846e08109d4dc44459294e1ec23f5949061e8fca318ea743511040ec67fc1e27c81c';
  assert.equal(signature, expected);
});

it('deterministic digestChangeAlias', async () => {
  const email = 'super.dooper@mylab.great';
  const alias = 'my gaming account';
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestChangeAlias({ email, alias, web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x296d9f3ae69fbe97f1b30997a98b780fb51a54af7476e587dd8bc2d6af4638846e08109d4dc44459294e1ec23f5949061e8fca318ea743511040ec67fc1e27c81c';
  assert.equal(signature, expected);
});

it('deterministic digestStolenEmail', async () => {
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestStolenEmail({ web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x2808a64c2e34edcf78448345aeed8bc93e5b305f7f1b6536d2f8c3c4b94f01153c294de2c054ef46dfd51d35dc9cb7c23a87f807f6028ed0147b78dd3a78fb0c1c';
  assert.equal(signature, expected);
});

it('deterministic digestStolenEmailByAddress', async () => {
  const web3Address = '0x70141191E3304f70D07217Ee3B8316eF0F437670';
  const digest = digestStolenEmailByAddress({ web3Address });
  const signature = sign({ digest, web3account: account });
  const expected = '0x2808a64c2e34edcf78448345aeed8bc93e5b305f7f1b6536d2f8c3c4b94f01153c294de2c054ef46dfd51d35dc9cb7c23a87f807f6028ed0147b78dd3a78fb0c1c';
  assert.equal(signature, expected);
});

it('deterministic digestCancelBuyNow', async () => {
  const buyNowId = '0x03214d89eb62587cbb48c9056dba878f839a4ebad3ad75f8826d76c566e4acd0';
  const digest = digestCancelBuyNow({ buyNowId });
  const signature = sign({ digest, web3account: account });
  const expected = '0xbc88e1ba759b7d73bc8bb19d0298188ef1b0c1b847b94ef4bad84accea89c7c61e856537548547d25e4f3aabf410eb936a49ec6514e105f93777c99adb29bc751c';
  assert.equal(signature, expected);
});

it('deterministic auctionId and digest', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)

  const auctionId1 = computeAuctionId({
    currencyId,
    price,
    sellerRnd: rnd,
    assetId,
    validUntil,
    offerValidUntil: 0,
    versesToPay,
  });
  assert.equal(
    auctionId1,
    '0xb884e47bc302c43df83356222374305300b0bcc64bb8d2c300350e06c790ee03',
  );

  const auctionId2 = computeAuctionId({
    currencyId,
    price,
    sellerRnd: rnd,
    assetId,
    validUntil,
    offerValidUntil,
    versesToPay,
  });
  assert.equal(
    auctionId2,
    '0x3f6a3102f21d4269ae1e9eac6172c102a6179ac04e21808bc95baaf6bf18c9fd',
  );

  const auctionId3 = computeAuctionId({
    currencyId,
    price,
    sellerRnd: rnd,
    assetId,
    validUntil: 0,
    offerValidUntil,
    versesToPay,
  });
  assert.equal(
    auctionId3,
    '0x3f6a3102f21d4269ae1e9eac6172c102a6179ac04e21808bc95baaf6bf18c9fd',
  );
});

it('deterministic digestPutForSaleAuction', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const rnd = 1234;
  const validUntil = 235985749;
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)
  const sellerAccount = account;
  const expectedSignature = '0xd061068f94e92a1dbafcf7f883a2c03483848b2a2cab38d1262bb11d43e64fed0952910c5c3c6e56eaed4fa83acd5a3df189ef12b36718b1d32dbd3ac9e01af61b';
  const expectedDigest = '0x42ba074c235b5f1a017b7f82f31c77d6f9e8954258c1c52dc90e21ccbf49badc';

  const digest = computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil: 0,
    versesToPay,
    assetId,
  });
  assert.equal(digest, expectedDigest);

  const digest2 = digestPutForSaleAuction({
    currencyId,
    price,
    rnd,
    validUntil,
    versesToPay,
    assetId,
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
    currencyId,
    price,
    rnd,
    validUntil,
    assetId,
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
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)
  const sellerAccount = account;
  const expected = '0xfc18ba14ff1ed175a50d2319bd919f5160b75337ef9d1446a9de9ec90d02ef903b548d57ff3fa43652c0c7b37a28bd2f8a31ea074d13dd3c2304c24da845b6e71b';

  const digest = digestAcceptOffer({
    currencyId,
    price,
    rnd,
    validUntil,
    offerValidUntil,
    versesToPay,
    assetId,
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
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const offererAccount = account;
  const expectedSig = '0xd768887ddd3ab9fb862dd44fc710a7857bc079bc8787cf8d145f9ceb00db69cb49a7a2d74dcab0a8bbefa33632baac0b87c21c688d072c7f1f1b58c106eed6a51c';

  const digest = digestOfferCertified({
    currencyId,
    price,
    offererRnd,
    assetId,
    offerValidUntil,
    versesToPay,
    assetCID,
  });
  const signedOffer = sign({ digest, web3account: offererAccount });
  assert.equal(signedOffer, expectedSig);

  // Uncertified version:
  const digest2 = digestOffer({
    currencyId,
    price,
    offererRnd,
    assetId,
    offerValidUntil,
    versesToPay,
  });
  const signedOffer2 = sign({ digest: digest2, web3account: offererAccount });
  const expectedSig2 = '0x0168cefa72e1e3e441eae4e3a274f5dd9bd84a2efe5eae8e075c604b356925626100da319e57118957f76851883ba4479c435631e7a7b38bd2e0eb5e145474251b';
  assert.equal(signedOffer2, expectedSig2);
});

it('deterministic digestBidCertified', async () => {
  const currencyId = 1;
  const assetId = 11114324213423;
  const price = 345;
  const sellerRnd = 1234;
  const validUntil = 235985749;
  const offerValidUntil = 4358487;
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const extraPrice = 32453;
  const buyerRnd = 435983;
  const buyerAccount = account;
  const expectedSig = '0x463ec818cbb8a5bb243c982db9b73e5a984256fca534f81f1b92061014c1a02b50175f54c176fbdd68a8928e42e545cbd1ea736789ce63cceb51836153ac6ec11c';

  const digest = digestBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    versesToPay,
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
    versesToPay,
    assetId,
  });
  const signedBid2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0x826cd822e0ca0833816ea8bed88ce39856730f5a6d4f174528d3bdc0fa9dd01d4cf27ad6431341c2e26aabc765c6f99cee1a0944186e1d79481fbfb08119c5441c';
  assert.equal(signedBid2, expectedSig2);

  // via auctionID:
  const auctionId = computeAuctionId({
    currencyId,
    price,
    sellerRnd,
    assetId,
    validUntil,
    offerValidUntil,
    versesToPay,
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
    versesToPay,
    assetCID,
    assetId,
  });
  const expectedDigest = '0x69d15b633acb8e5ae6bd172ebacfa2d16d5468e261751b42b608eb2a1f4166e3';
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
    versesToPay,
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
  const expectedSig = '0x673eb89583014503c5c3237afccfbec8d240974ccf01417c4f02272c9ac281195b14581ac8210748bd2b4cb05fd2e6befd030650a4952aa6803c955d97bb05eb1c';

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
    currencyId,
    price,
    sellerRnd,
    assetId,
    validUntil,
    assetCID,
    signature: signedBuyNow,
  });
  assert.equal(recoveredBuyer, buyerAccount.address);

  const buyNowId = computeBuyNowId({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetId,
  });

  assert.equal(
    buyNowId,
    '0x03214d89eb62587cbb48c9056dba878f839a4ebad3ad75f8826d76c566e4acd0',
  );

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
  const expectedSig2 = '0x75e23b5ff621f073de9b984881edf99c7d5666ef3d1558a1400f0ba8319488a078b7ed6d562c236fcc3e1265e73a0bc687328cfea3afe477e4a0581c1b9a6d761b';
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
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const extraPrice = 32453;
  const buyerRnd = 435983;
  const buyerAccount = account;
  const expectedSig = '0xf9d2ca75d8439825ecf5fb79b27076da60bc83d3e17ec493ba8c53204125d872274edf13c3c7abbf21aac190848fc9ddb97baa7c298c99116c7e11c26326e17c1b';

  const digest = digestBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    versesToPay,
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
    versesToPay,
    assetId,
  });
  const signedBid2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0xea650b8705009bc5795c70c34eecbfec5448d9809c641b04ea68ad9fbed83c0b4d4dff77cf1065528ce357f9300b20265e00946cc606e336aa928bcdbe3f12a41c';
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
    versesToPay,
    assetCID,
    assetId,
  });
  const expectedDigest = '0xd249c945e520884d659633a0131ee2c3dc4b0a034620f675669262341a3ba745';
  assert.equal(digest3, expectedDigest);

  const bidderAddress = getBidder({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    versesToPay,
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
  const versesToPay = 172800; // 1800 days (at a ratio of 4 verses per hour)
  const assetCID = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const extraPrice = 0;
  const buyerRnd = 0;
  const buyerAccount = account;
  const expectedSig = '0xd768887ddd3ab9fb862dd44fc710a7857bc079bc8787cf8d145f9ceb00db69cb49a7a2d74dcab0a8bbefa33632baac0b87c21c688d072c7f1f1b58c106eed6a51c';

  const digest = digestBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    versesToPay,
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
    versesToPay,
    assetId,
  });
  const signedBid2 = sign({ digest: digest2, web3account: buyerAccount });
  const expectedSig2 = '0x0168cefa72e1e3e441eae4e3a274f5dd9bd84a2efe5eae8e075c604b356925626100da319e57118957f76851883ba4479c435631e7a7b38bd2e0eb5e145474251b';
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
    versesToPay,
    assetCID,
    assetId,
  });
  const expectedDigest = '0xfd1a1f82869d4e47e889f6bbae3df252c4eddf24b02a2fbd1095b08ed0749455';
  assert.equal(digest3, expectedDigest);

  const bidderAddress = getBidder({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    versesToPay,
    assetCID,
    assetId,
    signature: signedBid,
  });
  assert.equal(bidderAddress, buyerAccount.address);
});

it('Hash of concatenated args', async () => {
  const someBytes32 = '0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18';
  const result = concatHash({
    types: ['uint256', 'bytes32'],
    vals: [1232, someBytes32],
  });
  const expected = '0x7522d1cef7c9def1b2b909d6e5d00a91f8ee07b51bc10f407986278971c2cbeb';
  assert.equal(result, expected);
});

describe('testing rsa encrypt', () => {
  it('encrypt and decrypt coincide with golang', async () => {
    const msg = '3ccb01128433ec5cc07e5c2133ebf545510e3e2f3491675afccc34355e91b515017fcd7b2bcd2012092eebdecb4ff0577d8aa74fec5e1a73e123ae4a2ff63309';
    const pubKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBpDANBgkqhkiG9w0BAQEFAAOCAZEAMIIBjAKCAYMJNgnN/sXb41c0QuRCcQqo
KdNh1IQlv37BdcrByl8U+VJyUkYhb7ZfApbcwF1X342vlYCfvR7+pMrkcBOXvBAV
WyuBRzL8Ivsm6o5CiuPoWfmX4BFMPhsUXMxRHzwZZc5d0F8p8ZGsmXKAN3SNdFMm
Ub2Qe7ZqoFUzt8rD9+qBwT2Xr/dRKLzqAHxxTmW50fHHnBxYlV/J7Tjc4KWZVa42
sqtyJnqUN5c3Gw/tKF+XeBDE8V//he9PuHCq+KHO9g8Y+Li4gfNhTYyIEPxBcEHM
ngvAhC3cqL5DFX/+HNBzRTAJ7CSeXNRttmj7MGDKUOAeoknP/+VpEDMnZnNlerCV
5UymThazYIbJa44Pucd7AyR7sMl8aejQ7UasB3r3gXAqSLqbWD+Z34mPMt4u3DND
B84iQkKWotc+5cqdaLqluPZXPSW4twT/t5VDvAskzuGjnD6YJIrSD3C9jsGGPxB7
lWjiffYFXpdujFOEfv7YFief+a58D5WxNMmdY4JBt4UVgdsCAwEAAQ==
-----END RSA PUBLIC KEY-----`;
    const privKey = `-----BEGIN RSA PRIVATE KEY-----
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
boYZ
-----END RSA PRIVATE KEY-----`;

    // Perform the encryption based on received public key - only private key can read it!
    const encrypted = encryptRSAWithPublicKey(msg, pubKey);

    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey: privKey }),
    });

    const message = await openpgp.readMessage({
      armoredMessage: encrypted, // parse armored message
    });

    const { data: decrypted } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey,
    });

    console.log(decrypted); // 'Hello, World!'
    assert.equal(decrypted, msg);
  });
});
