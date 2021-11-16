function getMarketplaceOrderId(tx) {
  console.log(tx, 'transaction hash');
  return tx.events.MarketplaceOrderCreated.returnValues.id
}

module.exports = getMarketplaceOrderId
