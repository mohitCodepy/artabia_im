const { constants } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants

const { artifacts } = require("hardhat");

const ERC1155AuctionMarketplace = require('../../src/contracts/ERC1155Marketplace/ERC1155AuctionMarketplace')

const ArtabiaERC1155 = artifacts.require('ArtabiaERC1155')
const Marketplace = artifacts.require('ERC1155AuctionMarketplace')

contract('Integration: ERC1155AuctionMarketplace', ([a0, a1, feeDestinationAddress]) => {
  beforeEach(async function () {
    this.marketplace = await Marketplace.new(feeDestinationAddress)

    this.erc1155 = await ArtabiaERC1155.new([this.marketplace.address, ZERO_ADDRESS, ZERO_ADDRESS])

    this.tokenId = web3.utils.randomHex(32)
    await this.erc1155.mint(this.tokenId, '1', '0')

    await this.marketplace.addApprovedContract(this.erc1155.address)

		this.lib = new ERC1155AuctionMarketplace(this.marketplace.address)
		this.lib._connect(web3, a0)
  })

	it('should be able to create an auction', async function () {
    return expect(
      this.lib.createAuction(this.erc1155.address, this.tokenId, '1', '0')
    ).to.eventually.be.fulfilled
	})

  it('should be able to view an auction', async function () {
    const id = await this.lib.createAuction(this.erc1155.address, this.tokenId, '1', '0')

    return expect(
      this.lib.getAuction(id)
    ).to.eventually.be.fulfilled
	})

  it('should not be able to view non-existent auction', async function () {
    return expect(
      this.lib.getAuction(web3.utils.randomHex(32))
    ).to.eventually.equal(null)
	})

  it('should be able to bid on an auction', async function () {
    const id = await this.lib.createAuction(this.erc1155.address, this.tokenId, '1', +Date.now() * 2)

    return expect(
      this.lib.bidOnAuction(id, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to calculate estimates for bidding on an auction', async function () {
    const id = await this.lib.createAuction(this.erc1155.address, this.tokenId, '1', +Date.now() * 2)

    return expect(
      this.lib.bidOnAuctionGasEstimation(id, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to claim an auction', async function () {
    const id = await this.lib.createAuction(this.erc1155.address, this.tokenId, '1', 0)

    return expect(
      this.lib.claimAuction(id)
    ).to.eventually.be.fulfilled
	})
})
