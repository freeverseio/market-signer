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

const Abi = require('web3-eth-abi');
const Accounts = require('web3-eth-accounts');
const Utils = require('web3-utils');
const { getToken, verifyToken } = require('./b2bAuthentication/token');

// *****************************************************************************
// All time variables are expressed in UNITS OF VERSE, not timestamp
// In particular: validUntil, offerValidUntil and versesToPay
// Their meaining:
// - validUntil: in an auction, the verse at which the auction ends:
//               (the verse at which the last bid will be accepted)
// - validUntil: in a buyNow, the verse at which the last buyTX will be accepted
// - offerValidUntil: the verse at which the last acceptOffer will be accepted
// - versesToPay: in an auction, the amount of verses, after the auction ends,
//              available to the buyer to pay.
// *****************************************************************************

// Concats values in vals array, interpreting them as defined by the types array
// and hashes the result using keccak256
function concatHash({ types, vals }) {
  return Utils.keccak256(Abi.encodeParameters(types, vals));
}

function digestLinkId({ email, freeverseId }) {
  return concatHash({
    types: ['string', 'string'],
    vals: [email, freeverseId],
  });
}

function digestUnlinkId({ email, freeverseId }) {
  return concatHash({
    types: ['string', 'string'],
    vals: [email, freeverseId],
  });
}

function hideSellerPrice({ currencyId, price, sellerRnd }) {
  return concatHash({
    types: ['uint8', 'uint256', 'uint256'],
    vals: [currencyId, price, sellerRnd],
  });
}

function computePutForSaleDigest({
  currencyId,
  price,
  sellerRnd,
  validUntil,
  offerValidUntil,
  versesToPay,
  assetId,
}) {
  return concatHash({
    types: ['bytes32', 'uint256', 'uint32', 'uint32', 'uint32'],
    vals: [
      hideSellerPrice({ currencyId, price, sellerRnd }),
      assetId.toString(),
      validUntil,
      offerValidUntil,
      versesToPay,
    ],
  });
}

function digestPutForSaleAuction({
  currencyId,
  price,
  rnd,
  validUntil,
  versesToPay,
  assetId,
}) {
  return computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil: 0,
    versesToPay,
    assetId,
  });
}

function computeBuyNowIdFromHiddePrice({
  sellerHiddenPrice, validUntil, assetId,
}) {
  return concatHash({
    types: ['bytes32', 'uint256', 'uint32'],
    vals: [sellerHiddenPrice, assetId.toString(), validUntil],
  });
}

function computeBuyNowId({
  currencyId, price, sellerRnd, validUntil, assetId,
}) {
  const sellerHiddenPrice = hideSellerPrice({ currencyId, price, sellerRnd });
  return computeBuyNowIdFromHiddePrice({
    sellerHiddenPrice, validUntil, assetId,
  });
}

function digestPutForSaleBuyNow({
  currencyId, price, rnd, validUntil, assetId,
}) {
  return computeBuyNowId({
    currencyId, price, sellerRnd: rnd, validUntil, assetId,
  });
}

function computeAuctionIdFromHiddenPrice({
  sellerHiddenPrice,
  assetId,
  validUntil,
  offerValidUntil,
  versesToPay,
}) {
  return Number(offerValidUntil) === 0
    ? concatHash({
      types: ['bytes32', 'uint256', 'uint32', 'uint32'],
      vals: [sellerHiddenPrice, assetId.toString(), validUntil, versesToPay],
    })
    : concatHash({
      types: ['bytes32', 'uint256', 'uint32', 'uint32'],
      vals: [sellerHiddenPrice, assetId.toString(), offerValidUntil, versesToPay],
    });
}

function computeAuctionId({
  currencyId,
  price,
  sellerRnd,
  assetId,
  validUntil,
  offerValidUntil,
  versesToPay,
}) {
  const sellerHiddenPrice = hideSellerPrice({ currencyId, price, sellerRnd });
  return computeAuctionIdFromHiddenPrice({
    sellerHiddenPrice,
    assetId,
    validUntil,
    offerValidUntil,
    versesToPay,
  });
}

function hideBuyerPrice({ extraPrice, buyerRnd }) {
  return concatHash({
    types: ['uint256', 'uint256'],
    vals: [extraPrice, buyerRnd],
  });
}

function digestBidFromAuctionIdCertifiedFromHiddenPrice({
  auctionId,
  buyerHiddenPrice,
  assetCID,
}) {
  return concatHash({
    types: ['bytes32', 'bytes32', 'string'],
    vals: [auctionId, buyerHiddenPrice, assetCID],
  });
}

function digestBidFromAuctionIdCertified({
  auctionId,
  extraPrice,
  buyerRnd,
  assetCID,
}) {
  const buyerHiddenPrice = hideBuyerPrice({ extraPrice, buyerRnd });
  return digestBidFromAuctionIdCertifiedFromHiddenPrice({
    auctionId,
    buyerHiddenPrice,
    assetCID,
  });
}

function digestBidCertified({
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
}) {
  const auctionId = computeAuctionId({
    currencyId,
    price,
    sellerRnd,
    assetId,
    validUntil,
    offerValidUntil,
    versesToPay,
  });
  return digestBidFromAuctionIdCertified({
    auctionId, extraPrice, buyerRnd, assetCID,
  });
}

function digestPayNow({ auctionId, amount }) {
  return concatHash({
    types: ['bytes32', 'string'],
    vals: [auctionId, amount],
  });
}

function digestCashout({ paymentId, iban }) {
  return concatHash({
    types: ['bytes32', 'string'],
    vals: [paymentId, iban],
  });
}

function digestStolenEmail({ freeverseId }) {
  return concatHash({
    types: ['string'],
    vals: [freeverseId],
  });
}

function digestChangeIdAlias({ email, alias, freeverseId }) {
  return concatHash({
    types: ['string', 'string', 'string'],
    vals: [email, alias, freeverseId],
  });
}

function digestBuyNowFromBuyNowIdCertified({
  buyNowId, assetCID,
}) {
  return concatHash({
    types: ['bytes32', 'string'],
    vals: [buyNowId, assetCID],
  });
}

function digestBuyNowCertified({
  currencyId, price, sellerRnd, validUntil, assetCID, assetId,
}) {
  const buyNowId = computeBuyNowId({
    currencyId, price, sellerRnd, validUntil, assetId,
  });
  return digestBuyNowFromBuyNowIdCertified({
    buyNowId, assetCID,
  });
}

function digestBuyNow({
  currencyId, price, sellerRnd, validUntil, assetId,
}) {
  return digestBuyNowCertified({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetCID: '',
    assetId,
  });
}

function digestBuyNowFromBuyNowId({ buyNowId }) {
  return digestBuyNowFromBuyNowIdCertified({
    buyNowId,
    assetCID: '',
  });
}

function digestAcceptOffer({
  currencyId, price, rnd, validUntil, offerValidUntil, versesToPay, assetId,
}) {
  return computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil,
    versesToPay,
    assetId,
  });
}

function digestBidFromAuctionId({
  auctionId,
  extraPrice,
  buyerRnd,
}) {
  return digestBidFromAuctionIdCertified({
    auctionId,
    extraPrice,
    buyerRnd,
    assetCID: '',
  });
}

function digestBid({
  currencyId,
  price,
  extraPrice,
  sellerRnd,
  buyerRnd,
  validUntil,
  offerValidUntil,
  versesToPay,
  assetId,
}) {
  return digestBidCertified({
    currencyId,
    price,
    extraPrice,
    sellerRnd,
    buyerRnd,
    validUntil,
    offerValidUntil,
    versesToPay,
    assetCID: '',
    assetId,
  });
}

function getBidderFromHiddenPrice({
  auctionId,
  buyerHiddenPrice,
  assetCID,
  signature,
}) {
  const digest = digestBidFromAuctionIdCertifiedFromHiddenPrice({
    auctionId,
    buyerHiddenPrice,
    assetCID,
  });
  return new Accounts().recover(digest, signature);
}

function getBidder({
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
  signature,
}) {
  const auctionId = computeAuctionId({
    currencyId,
    price,
    sellerRnd,
    assetId,
    validUntil,
    offerValidUntil,
    versesToPay,
  });
  const buyerHiddenPrice = hideBuyerPrice({ extraPrice, buyerRnd });
  return getBidderFromHiddenPrice({
    auctionId,
    buyerHiddenPrice,
    assetCID,
    signature,
  });
}

function getBuyNowBuyerFromBuyNowId({
  buyNowId, assetCID, signature,
}) {
  const digest = digestBuyNowFromBuyNowIdCertified({
    buyNowId, assetCID,
  });
  return new Accounts().recover(digest, signature);
}

function getBuyNowBuyer({
  currencyId, price, sellerRnd, assetId, validUntil, assetCID, signature,
}) {
  const buyNowId = computeBuyNowId({
    currencyId, price, sellerRnd, validUntil, assetId,
  });
  return getBuyNowBuyerFromBuyNowId({
    buyNowId, assetCID, signature,
  });
}

function digestOfferCertified({
  currencyId, price, offererRnd, assetId, offerValidUntil, versesToPay, assetCID,
}) {
  return digestBidCertified({
    currencyId,
    price,
    extraPrice: 0,
    sellerRnd: offererRnd,
    buyerRnd: 0,
    validUntil: 0,
    offerValidUntil,
    versesToPay,
    assetCID,
    assetId,
  });
}

function digestOffer({
  currencyId, price, offererRnd, assetId, offerValidUntil, versesToPay,
}) {
  return digestOfferCertified({
    currencyId, price, offererRnd, assetId, offerValidUntil, versesToPay, assetCID: '',
  });
}

function sign({ digest, web3account }) {
  return web3account.sign(digest).signature;
}

// The frontend may query to the backend the following 3 params:
// - refenceVerse, referenceTime (the timestamp at which a refenceVerse was submitted)
// - verseInterval, the time planned between verses
// And then the front can easily compute the timeStamp for any past or future verse.
// Verses have a planned submission time.
// They expire as soon as the next verse is submitted.
function plannedSubmissionTime({
  verse, referenceVerse, referenceTime, verseInterval,
}) {
  return +referenceTime + (+verse - +referenceVerse) * (+verseInterval);
}
// Conversely, the frontend can obtain the verse that would correspond to a given timestamp
// Since a timestamp may happen between verses, the following function
// returns the largest of the two, to allow for time variability,
// as recommended for usage in signing BuyNows/Auctions/Bids.
function plannedSubmissionVerse({
  time, referenceVerse, referenceTime, verseInterval,
}) {
  return Math.ceil((+time - +referenceTime) / +verseInterval) + +referenceVerse;
}

function expiresAtTime({
  verse, referenceVerse, referenceTime, verseInterval,
}) {
  const nextSubmissionVerse = +verse + 1;
  return plannedSubmissionTime({
    verse: nextSubmissionVerse, referenceVerse, referenceTime, verseInterval,
  });
}

function getExpiryData({
  time, referenceVerse, referenceTime, verseInterval,
}) {
  const submissionVerse = plannedSubmissionVerse({
    time, referenceVerse, referenceTime, verseInterval,
  });
  const lastValidVerse = +submissionVerse - 1;
  const expirationTime = expiresAtTime({
    verse: lastValidVerse, referenceVerse, referenceTime, verseInterval,
  });
  return { lastValidVerse, expirationTime };
}

module.exports = {
  sign,
  digestLinkId,
  digestUnlinkId,
  digestCashout,
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
  digestBuyNowFromBuyNowId,
  digestBuyNowCertified,
  digestBuyNowFromBuyNowIdCertified,
  digestAcceptOffer,
  digestOfferCertified,
  digestOffer,
  getBidder,
  getBuyNowBuyer,
  plannedSubmissionTime,
  plannedSubmissionVerse,
  expiresAtTime,
  getExpiryData,
  getToken,
  verifyToken,
};
