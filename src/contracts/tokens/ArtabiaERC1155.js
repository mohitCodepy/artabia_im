const { abi } = require('../../../artifacts/contracts/tokens/ArtabiaERC1155.sol/ArtabiaERC1155.json')
const getMarketplaceOrderId = require('./utils/getMarketplaceOrderId')

class ArtabiaERC1155 {
  constructor(contractAddress) {
    this.contractAddress = contractAddress
  }

  _connect(web3, account, gasPrice) {
    this.web3 = web3

    this.contract = new web3.eth.Contract(abi, this.contractAddress, {
      from: account,
      gasPrice
    })
  }

  isConnected() {
    return Boolean(this.web3)
  }

  mint(id, qty, royalties) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mint(id, qty.toString(), royalties).send().then(() => id)
  }

  mintAndCreateOrder(id, qty, qtyToList, royalties, price) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mintAndCreateOrder(id, qty.toString(), qtyToList.toString(), royalties, this.web3.utils.toWei(price, 'ether')).send().then(getMarketplaceOrderId)
  }

  mintAndCreateListing(id, qty, qtyToList, royalties) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mintAndCreateListing(id, qty.toString(), qtyToList.toString(), royalties).send().then(getMarketplaceOrderId)
  }

  mintAndCreateAuction(id, qty, qtyToList, royalties, endsAt) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mintAndCreateAuction(id, qty.toString(), qtyToList.toString(), royalties, (Math.floor(endsAt / 1000)).toString()).send().then(getMarketplaceOrderId)
  }
}

ArtabiaERC1155.isIntegrationClass = true

module.exports = ArtabiaERC1155
