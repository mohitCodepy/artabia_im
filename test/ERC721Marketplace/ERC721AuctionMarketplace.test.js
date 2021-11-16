const { constants } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants

const { artifacts } = require("hardhat");

const ERC721AuctionMarketplace = require('../../src/contracts/ERC721Marketplace/ERC721AuctionMarketplace')

const ArtabiaERC721 = artifacts.require('ArtabiaERC721')
const Marketplace = artifacts.require('ERC721AuctionMarketplace')

contract('Integration: ERC721AuctionMarketplace', ([a0, a1, feeDestinationAddress]) => {
  beforeEach(async function () {
    this.marketplace = await Marketplace.new(feeDestinationAddress)

    this.erc721 = await ArtabiaERC721.new([this.marketplace.address, ZERO_ADDRESS, ZERO_ADDRESS])

    this.tokenId = web3.utils.randomHex(32)
    await this.erc721.mint(this.tokenId, '0')

    await this.marketplace.addApprovedContract(this.erc721.address)

		this.lib = new ERC721AuctionMarketplace(this.marketplace.address)
		this.lib._connect(web3, a0)
  })

	it('should be able to create an auction', async function () {
    return expect(
      this.lib.createAuction(this.erc721.address, this.tokenId, '0')
    ).to.eventually.be.fulfilled
	})

  it('should be able to view an auction', async function () {
    const id = await this.lib.createAuction(this.erc721.address, this.tokenId, '2')

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
    const id = await this.lib.createAuction(this.erc721.address, this.tokenId, +Date.now() * 2)

    return expect(
      this.lib.bidOnAuction(id, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to calculate estimates for bidding on an auction', async function () {
    const id = await this.lib.createAuction(this.erc721.address, this.tokenId, +Date.now() * 2)

    return expect(
      this.lib.bidOnAuctionGasEstimation(id, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to claim an auction', async function () {
    const id = await this.lib.createAuction(this.erc721.address, this.tokenId, '2', '0')

    return expect(
      this.lib.claimAuction(id)
    ).to.eventually.be.fulfilled
	})
})
