const { abi } = require('../../../artifacts/contracts/ERC1155Marketplace/ERC1155ListingMarketplace.sol/ERC1155ListingMarketplace.json')

const estimateGasPriceAndTime = require('../../utils/estimateGasPriceAndTime')

class ERC1155ListingMarketplace {
  constructor(contractAddress) {
    this.contractAddress = contractAddress
  }

  _connect(web3, account, gasPrice) {
    this.web3 = web3
    this.account = account

    this.contract = new web3.eth.Contract(abi, this.contractAddress, {
      from: account,
      gasPrice
    })
  }

  isConnected() {
    return Boolean(this.web3)
  }

  async listingHighestOffer(id) {
    return this.web3.utils.fromWei(
      await this.contract.methods.listings(id).call().then(listing => listing.offer),
      'ether'
    )
  }

  async createListing(tokenAddress, tokenId, tokenQty) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const createListingTx = await this.contract.methods.createListing(
      tokenAddress,
      tokenId,
      tokenQty.toString()
    ).send()

    return createListingTx.events.ListingCreated.returnValues.id
  }

  async getListing(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const listing = await this.contract.methods.listings(id).call()

    if(listing.owner === '0x0000000000000000000000000000000000000000') return Promise.resolve(null)

    return listing
  }

  async getListingOffers(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const offers = await this.contract.getPastEvents('ListingOfferPlaced', {
      fromBlock: 'earliest',
      filter: {
        id
      }
    }).then(async txs => await Promise.all(txs.map(async tx => {
      return {
        ...tx.returnValues,
        time: new Date(await this.web3.eth.getBlock(tx.blockNumber).then(b => b.timestamp * 1000))
      }
    })))

    return offers
  }

  async getListingWithdraws(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const offers = await this.contract.getPastEvents('ListingOfferWithdrawn', {
      fromBlock: 'earliest',
      filter: {
        id
      }
    }).then(async txs => await Promise.all(txs.map(async tx => {
      return {
        ...tx.returnValues,
        time: new Date(await this.web3.eth.getBlock(tx.blockNumber).then(b => b.timestamp * 1000))
      }
    })))

    return offers
  }

  removeListing(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.removeListing(
      id,
    ).send()
  }

  async placeOffer(id, priceInEther) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const price = this.web3.utils.toWei(priceInEther, 'ether')

    return this.contract.methods.placeOffer(
      id,
    ).send({
      value: price
    })
  }

  async placeOfferGasEstimation(id, priceInEther) {
    const price = this.web3.utils.toWei(priceInEther, 'ether')

    const gas = await this.contract.methods.placeOffer(
      id,
    ).estimateGas({
      value: price
    }).then(gasNumber => gasNumber.toString())

    const { gasPrice, waitTime } = await estimateGasPriceAndTime()

    const txFees = this.web3.utils.fromWei(
      new this.web3.utils.BN(gas).mul(new this.web3.utils.BN(gasPrice)),
      'ether'
    )

    return {
      price: `${priceInEther} ETH`,
      txFees: `${txFees} ETH`,
      totalPrice: `${(new this.web3.utils.BN(price).add(new this.web3.utils.BN(txFees)))} ETH`,
      waitTime: waitTime > 1 ? `${waitTime} minutes` : `${waitTime} minutes`
    }
  }

  withdrawOffer(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.withdrawOffer(
      id,
    ).send()
  }

  async canWithdrawOffer(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const listing = await this.contract.methods.listings(id).call()

    if(listing.offeror.toLowerCase() != this.account.toLowerCase()) {
      return false
    }

    const offerPlacedAt = listing.offerPlacedAt

    const delta = +Date.now() / 1000 - parseInt(offerPlacedAt) + 60 * 60 * 48

    return delta < 0 || delta
  }

  acceptListingOffer(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.acceptListingOffer(
      id,
    ).send()
  }
}

ERC1155ListingMarketplace.isIntegrationClass = true

module.exports = ERC1155ListingMarketplace
