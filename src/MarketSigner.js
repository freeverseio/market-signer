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
  timeToPay,
  assetId,
}) {
  return concatHash({
    types: ['bytes32', 'uint256', 'uint32', 'uint32', 'uint32'],
    vals: [
      hideSellerPrice({ currencyId, price, sellerRnd }),
      assetId.toString(),
      validUntil,
      offerValidUntil,
      timeToPay,
    ],
  });
}

function digestPutForSaleAuction({
  currencyId,
  price,
  rnd,
  validUntil,
  timeToPay,
  assetId,
}) {
  return computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil: 0,
    timeToPay,
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
  timeToPay,
}) {
  return Number(offerValidUntil) === 0
    ? concatHash({
      types: ['bytes32', 'uint256', 'uint32', 'uint32'],
      vals: [sellerHiddenPrice, assetId.toString(), validUntil, timeToPay],
    })
    : concatHash({
      types: ['bytes32', 'uint256', 'uint32', 'uint32'],
      vals: [sellerHiddenPrice, assetId.toString(), offerValidUntil, timeToPay],
    });
}

function computeAuctionId({
  currencyId,
  price,
  sellerRnd,
  assetId,
  validUntil,
  offerValidUntil,
  timeToPay,
}) {
  const sellerHiddenPrice = hideSellerPrice({ currencyId, price, sellerRnd });
  return computeAuctionIdFromHiddenPrice({
    sellerHiddenPrice,
    assetId,
    validUntil,
    offerValidUntil,
    timeToPay,
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
    types: ['string', 'bytes32', 'string'],
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
  timeToPay,
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
    timeToPay,
  });
  return digestBidFromAuctionIdCertified({
    auctionId, extraPrice, buyerRnd, assetCID,
  });
}

function digestPayNow({ auctionId, amount }) {
  return concatHash({
    types: ['string', 'string'],
    vals: [auctionId, amount],
  });
}

function digestBankTransfer({ bankAccount, amount, marketUserNonce }) {
  return concatHash({
    types: ['string', 'string', 'uint32'],
    vals: [bankAccount, amount, marketUserNonce],
  });
}

function digestCardTransfer({
  firstDigits,
  lastFourDigits,
  amount,
  marketUserNonce,
}) {
  return concatHash({
    types: ['string', 'string', 'string', 'uint32'],
    vals: [
      lastFourDigits,
      amount,
      firstDigits,
      marketUserNonce,
    ],
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
    types: ['string', 'string'],
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
  currencyId, price, rnd, validUntil, offerValidUntil, timeToPay, assetId,
}) {
  return computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil,
    timeToPay,
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
  timeToPay,
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
    timeToPay,
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
  timeToPay,
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
    timeToPay,
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
  currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, assetCID,
}) {
  return digestBidCertified({
    currencyId,
    price,
    extraPrice: 0,
    sellerRnd: offererRnd,
    buyerRnd: 0,
    validUntil: 0,
    offerValidUntil,
    timeToPay,
    assetCID,
    assetId,
  });
}

function digestOffer({
  currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay,
}) {
  return digestOfferCertified({
    currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, assetCID: '',
  });
}

function sign({ digest, web3account }) {
  return web3account.sign(digest).signature;
}

module.exports = {
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
  digestBuyNowFromBuyNowId,
  digestBuyNowCertified,
  digestBuyNowFromBuyNowIdCertified,
  digestAcceptOffer,
  digestOfferCertified,
  digestOffer,
  getBidder,
  getBuyNowBuyer,
};
