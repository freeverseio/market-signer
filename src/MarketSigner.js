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
function concatHash(types, vals) {
  return Utils.keccak256(Abi.encodeParameters(types, vals));
}

function signLinkId({ web3account, email, freeverseId }) {
  const digest = concatHash(
    ['string', 'string'],
    [email, freeverseId],
  );
  return web3account.sign(digest).signature;
}

function signUnlinkId({ web3account, email, freeverseId }) {
  const digest = concatHash(
    ['string', 'string'],
    [email, freeverseId],
  );
  return web3account.sign(digest).signature;
}

function hideSellerPrice({ currencyId, price, sellerRnd }) {
  return concatHash(
    ['uint8', 'uint256', 'uint256'],
    [currencyId, price, sellerRnd],
  );
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
  return concatHash(
    ['bytes32', 'uint256', 'uint32', 'uint32', 'uint32'],
    [
      hideSellerPrice({ currencyId, price, sellerRnd }),
      assetId.toString(),
      validUntil,
      offerValidUntil,
      timeToPay,
    ],
  );
}

function signPutForSaleAuction({
  currencyId,
  price,
  rnd,
  validUntil,
  timeToPay,
  assetId,
  sellerAccount,
}) {
  const digest = computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil: 0,
    timeToPay,
    assetId,
  });
  return sellerAccount.sign(digest).signature;
}

function signPutForSaleBuyNow({
  currencyId, price, rnd, validUntil, assetId, sellerAccount,
}) {
  const sellerHiddenPrice = hideSellerPrice({ currencyId, price, sellerRnd: rnd });
  const digest = concatHash(
    ['bytes32', 'uint256', 'uint32'],
    [sellerHiddenPrice, assetId.toString(), validUntil],
  );
  return sellerAccount.sign(digest).signature;
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
  return Number(offerValidUntil) === 0
    ? concatHash(
      ['bytes32', 'uint256', 'uint32', 'uint32'],
      [sellerHiddenPrice, assetId.toString(), validUntil, timeToPay],
    )
    : concatHash(
      ['bytes32', 'uint256', 'uint32', 'uint32'],
      [sellerHiddenPrice, assetId.toString(), offerValidUntil, timeToPay],
    );
}

function hideBuyerPrice({ extraPrice, buyerRnd }) {
  return concatHash(
    ['uint256', 'uint256'],
    [extraPrice, buyerRnd],
  );
}

function computeBidDigest({
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
  const buyerHiddenPrice = hideBuyerPrice({ extraPrice, buyerRnd });
  const auctionId = computeAuctionId({
    currencyId,
    price,
    sellerRnd,
    assetId,
    validUntil,
    offerValidUntil,
    timeToPay,
  });
  return concatHash(
    ['bytes32', 'bytes32', 'string'],
    [auctionId, buyerHiddenPrice, assetCID],
  );
}

function signBidCertified({
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
}) {
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
  return buyerAccount.sign(digest).signature;
}

function signPayNow({ auctionId, amount, web3account }) {
  const digest = concatHash(
    ['string', 'string'],
    [auctionId, amount],
  );
  return web3account.sign(digest).signature;
}

function signBankTransfer({
  bankAccount, amount, marketUserNonce, web3account,
}) {
  const digest = concatHash(
    ['string', 'string', 'uint32'],
    [bankAccount, amount, marketUserNonce],
  );
  return web3account.sign(digest).signature;
}

function signCardTransfer({
  firstDigits,
  lastFourDigits,
  amount,
  marketUserNonce,
  web3account,
}) {
  const digest = concatHash(
    ['string', 'string', 'string', 'uint32'],
    [
      lastFourDigits,
      amount,
      firstDigits,
      marketUserNonce,
    ],
  );
  return web3account.sign(digest).signature;
}

function signStolenEmail({ web3account, freeverseId }) {
  const digest = concatHash(
    ['string'], [freeverseId],
  );
  return web3account.sign(digest).signature;
}

function signChangeIdAlias({
  email,
  alias,
  freeverseId,
  web3account,
}) {
  const digest = concatHash(
    ['string', 'string', 'string'],
    [email, alias, freeverseId],
  );
  return web3account.sign(digest).signature;
}

function computeBuyNowDigest({
  hiddenPrice, assetId, validUntil, assetCID,
}) {
  return concatHash(
    ['bytes32', 'uint256', 'uint32', 'string'],
    [hiddenPrice, assetId.toString(), validUntil, assetCID],
  );
}

function signBuyNowCertified({
  currencyId, price, sellerRnd, validUntil, assetCID, assetId, buyerAccount,
}) {
  const hiddenPrice = hideSellerPrice({ currencyId, price, sellerRnd });
  const digest = computeBuyNowDigest({
    hiddenPrice, assetId, validUntil, assetCID,
  });
  return buyerAccount.sign(digest).signature;
}

function signBuyNow({
  currencyId, price, sellerRnd, validUntil, assetId, buyerAccount,
}) {
  return signBuyNowCertified({
    currencyId,
    price,
    sellerRnd,
    validUntil,
    assetCID: '',
    assetId,
    buyerAccount,
  });
}

function signAcceptOffer({
  currencyId, price, rnd, validUntil, offerValidUntil, timeToPay, assetId, sellerAccount,
}) {
  const digest = computePutForSaleDigest({
    currencyId,
    price,
    sellerRnd: rnd,
    validUntil,
    offerValidUntil,
    timeToPay,
    assetId,
  });
  return sellerAccount.sign(digest).signature;
}

function signBid({
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
}) {
  return signBidCertified({
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
    buyerAccount,
  });
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
  return new Accounts().recover(digest, signature);
}

function getBuyNowBuyer({
  currencyId, price, sellerRnd, assetId, validUntil, assetCID, signature,
}) {
  const hiddenPrice = hideSellerPrice({ currencyId, price, sellerRnd });
  const digest = computeBuyNowDigest({
    hiddenPrice, assetId, validUntil, assetCID,
  });
  return new Accounts().recover(digest, signature);
}

function signOfferCertified({
  currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, assetCID, offererAccount,
}) {
  return signBidCertified({
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
    buyerAccount: offererAccount,
  });
}

function signOffer(
  currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, offererAccount,
) {
  return signOfferCertified({
    currencyId, price, offererRnd, assetId, offerValidUntil, timeToPay, assetCID: '', offererAccount,
  });
}

module.exports = {
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
};
