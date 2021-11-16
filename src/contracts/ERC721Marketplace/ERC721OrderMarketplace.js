const { abi } = require('../../../artifacts/contracts/ERC721Marketplace/ERC721OrderMarketplace.sol/ERC721OrderMarketplace.json')

const estimateGasPriceAndTime = require('../../utils/estimateGasPriceAndTime')

class ERC721OrderMarketplace {
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

  _getOrderPrice(id) {
    return this.contract.methods.orders(id).call().then(order => order.price)
  }

  async createOrder(tokenAddress, tokenId, price) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const createOrderTx = await this.contract.methods.createOrder(
      tokenAddress,
      tokenId,
      this.web3.utils.toWei(price.toString(), 'ether')
    ).send()

    return createOrderTx.events.OrderCreated.returnValues.id
  }

  async getOrder(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const order = await this.contract.methods.orders(id).call()

    if(order.owner === '0x0000000000000000000000000000000000000000') return Promise.resolve(null)

    return order
  }

  removeOrder(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    return this.contract.methods.removeOrder(
      id,
    ).send()
  }

  async buyOrder(id) {
    if(!this.isConnected()) throw new Error('Not connected to the blockchain')

    const price = await this.contract.methods.orders(id).call().then(order => order.price)

    return this.contract.methods.buyOrder(
      id,
    ).send({
      value: price
    })
  }

  async buyOrderGasEstimation(id) {
    const price = await this._getOrderPrice(id)

    const gas = await this.contract.methods.buyOrder(
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
      price: `${price} ETH`,
      txFees: `${txFees} ETH`,
      totalPrice: `${(new this.web3.utils.BN(price).add(new this.web3.utils.BN(txFees)))} ETH`,
      waitTime: waitTime > 1 ? `${waitTime} minutes` : `${waitTime} minutes`
    }
  }
}

ERC721OrderMarketplace.isIntegrationClass = true

module.exports = ERC721OrderMarketplace
