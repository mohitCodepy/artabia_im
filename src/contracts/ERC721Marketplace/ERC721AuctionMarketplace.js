const { abi } = require('../../../artifacts/contracts/ERC721Marketplace/ERC721AuctionMarketplace.sol/ERC721AuctionMarketplace.json')

const estimateGasPriceAndTime = require('../../utils/estimateGasPriceAndTime')

class ERC721AuctionMarketplace {
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

  getAuctionHighestBid(id) {
    return this.contract.methods.auctions(id).call().then(auction => auction.bid)
  }

  async createAuction(tokenAddress, tokenId, endsAt) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const createAuctionTx = await this.contract.methods.createAuction(
      tokenAddress,
      tokenId,
      (Math.floor(endsAt / 1000)).toString()
    ).send()

    return createAuctionTx.events.AuctionCreated.returnValues.id
  }

  async getAuction(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const auction = await this.contract.methods.auctions(id).call()

    if(auction.owner === '0x0000000000000000000000000000000000000000') return Promise.resolve(null)

    return auction
  }

  async getAuctionBids(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const offers = await this.contract.getPastEvents('AuctionBidPlaced', {
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

  bidOnAuction(id, price) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.bidOnAuction(
      id,
    ).send({ value: this.web3.utils.toWei(price, 'ether') })
  }

  async bidOnAuctionGasEstimation(id, price) {
    const gas = await this.contract.methods.bidOnAuction(
      id,
    ).estimateGas({
      value: this.web3.utils.toWei(price, 'ether')
    }).then(gasNumber => gasNumber.toString())

    const { gasPrice, waitTime } = await estimateGasPriceAndTime()

    const txFees = this.web3.utils.fromWei(
      new this.web3.utils.BN(gas).mul(new this.web3.utils.BN(gasPrice)),
      'ether'
    )

    return {
      price: `${price} ETH`,
      txFees: `${txFees} ETH`,
      totalPrice: `${(new this.web3.utils.BN(price).add(new this.web3.utils.BN(txFees)))} ETH`,
      waitTime: waitTime > 1 ? `${waitTime} minutes` : `${waitTime} minutes`
    }
  }

  async claimAuction(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.claimAuction(
      id,
    ).send()
  }
}

ERC721AuctionMarketplace.isIntegrationClass = true

module.exports = ERC721AuctionMarketplace
