function getMarketplaceOrderId(tx) {
  return tx.events.MarketplaceOrderCreated.returnValues.id
}

module.exports = getMarketplaceOrderId
