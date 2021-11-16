const { abi } = require('../../../artifacts/contracts/tokens/ArtabiaERC721.sol/ArtabiaERC721.json')
const getMarketplaceOrderId = require('./utils/getMarketplaceOrderId')

class ArtabiaERC721 {
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

  mint(id, royalties) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mint(id, royalties).send().then(() => id)
  }

  mintAndCreateOrder(id, royalties, price) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mintAndCreateOrder(id, royalties, this.web3.utils.toWei(price, 'ether')).send().then(getMarketplaceOrderId)
  }

  mintAndCreateListing(id, royalties) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mintAndCreateListing(id, royalties).send().then(getMarketplaceOrderId)
  }

  mintAndCreateAuction(id, royalties, endsAt) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.mintAndCreateAuction(id, royalties, endsAt).send().then(getMarketplaceOrderId)
  }
}

ArtabiaERC721.isIntegrationClass = true

module.exports = ArtabiaERC721
