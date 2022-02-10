const { getTokenDigest, composeToken, verifyToken } = require('./token');
const { ERC20Payments } = require('./CryptoPaymentsSigner');
const {
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
} = require('./MarketSigner');

module.exports = {
  ERC20Payments,
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
  getTokenDigest,
  composeToken,
  verifyToken,
};