const { constants } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants

const ArtabiaERC721 = require('../../src/contracts/tokens/ArtabiaERC721')

const { artifacts } = require("hardhat");

const Token = artifacts.require('ArtabiaERC721')
const OrderMarketplace = artifacts.require('ERC721OrderMarketplace')
const ListingMarketplace = artifacts.require('ERC721ListingMarketplace')
const AuctionMarketplace = artifacts.require('ERC721AuctionMarketplace')

contract('Integration: ArtabiaERC721', ([a0, a1, feeDestinationAddress]) => {
  beforeEach(async function () {
    this.orderMarketplace = await OrderMarketplace.new(ZERO_ADDRESS)
    this.listingMarketplace = await ListingMarketplace.new(ZERO_ADDRESS)
    this.auctionMarketplace = await AuctionMarketplace.new(ZERO_ADDRESS)

    this.erc721 = await Token.new([this.orderMarketplace.address, this.listingMarketplace.address, this.auctionMarketplace.address])

    await this.orderMarketplace.contract.methods.addApprovedContract(this.erc721.address).send({ from: a0 })
    await this.listingMarketplace.contract.methods.addApprovedContract(this.erc721.address).send({ from: a0 })
    await this.auctionMarketplace.contract.methods.addApprovedContract(this.erc721.address).send({ from: a0 })

		this.lib = new ArtabiaERC721(this.erc721.address)
		this.lib._connect(web3, a0)
  })

	it('should be able to mint an nft', async function () {
    return expect(
      this.lib.mint(web3.utils.randomHex(32), 5)
    ).to.eventually.be.fulfilled
	})

  it('should be able to mint an nft and create an order', async function () {
    return expect(
      this.lib.mintAndCreateOrder(web3.utils.randomHex(32), 5, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to mint an nft and create a listing', async function () {
    return expect(
      this.lib.mintAndCreateListing(web3.utils.randomHex(32), 5)
    ).to.eventually.be.fulfilled
	})

  it('should be able to mint an nft and create an auction', async function () {
    return expect(
      this.lib.mintAndCreateAuction(web3.utils.randomHex(32), 5, +Date.now())
    ).to.eventually.be.fulfilled
	})
})
