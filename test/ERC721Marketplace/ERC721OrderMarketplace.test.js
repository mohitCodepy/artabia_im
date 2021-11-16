const { constants } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants

const { artifacts } = require("hardhat");

const ERC721OrderMarketplace = require('../../src/contracts/ERC721Marketplace/ERC721OrderMarketplace')

const ArtabiaERC721 = artifacts.require('ArtabiaERC721')
const Marketplace = artifacts.require('ERC721OrderMarketplace')

contract('Integration: ERC721OrderMarketplace', ([a0, a1, feeDestinationAddress]) => {
  beforeEach(async function () {
    this.marketplace = await Marketplace.new(feeDestinationAddress)

    this.erc721 = await ArtabiaERC721.new([this.marketplace.address, ZERO_ADDRESS, ZERO_ADDRESS])

    this.tokenId = web3.utils.randomHex(32)
    await this.erc721.mint(this.tokenId, '0')

    await this.marketplace.addApprovedContract(this.erc721.address)

		this.lib = new ERC721OrderMarketplace(this.marketplace.address)
		this.lib._connect(web3, a0)
  })

	it('should be able to create an order', async function () {
    return expect(
      this.lib.createOrder(this.erc721.address, this.tokenId, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to view an order', async function () {
    const id = await this.lib.createOrder(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.getOrder(id)
    ).to.eventually.be.fulfilled
	})

  it('should not be able to view non-existent order', async function () {
    return expect(
      this.lib.getOrder(web3.utils.randomHex(32))
    ).to.eventually.equal(null)
	})

  it('should be able to remove an order', async function () {
    const id = await this.lib.createOrder(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.removeOrder(id)
    ).to.eventually.be.fulfilled
	})

  it('should be able to buy an order', async function () {
    const id = await this.lib.createOrder(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.buyOrder(id)
    ).to.eventually.be.fulfilled
	})

  it('should be able to calculate estimates for an order', async function () {
    const id = await this.lib.createOrder(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.buyOrderGasEstimation(id)
    ).to.eventually.be.fulfilled
	})
})
