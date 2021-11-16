const { constants } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants

const ArtabiaERC1155 = require('../../src/contracts/tokens/ArtabiaERC1155')

const { artifacts } = require("hardhat");

const Token = artifacts.require('ArtabiaERC1155')
const OrderMarketplace = artifacts.require('ERC1155OrderMarketplace')
const ListingMarketplace = artifacts.require('ERC1155ListingMarketplace')
const AuctionMarketplace = artifacts.require('ERC1155AuctionMarketplace')

contract('Integration: ArtabiaERC1155', ([a0, a1, feeDestinationAddress]) => {
  beforeEach(async function () {
    this.orderMarketplace = await OrderMarketplace.new(ZERO_ADDRESS)
    this.listingMarketplace = await ListingMarketplace.new(ZERO_ADDRESS)
    this.auctionMarketplace = await AuctionMarketplace.new(ZERO_ADDRESS)

    this.erc1155 = await Token.new([this.orderMarketplace.address, this.listingMarketplace.address, this.auctionMarketplace.address])

    await this.orderMarketplace.contract.methods.addApprovedContract(this.erc1155.address).send({ from: a0 })
    await this.listingMarketplace.contract.methods.addApprovedContract(this.erc1155.address).send({ from: a0 })
    await this.auctionMarketplace.contract.methods.addApprovedContract(this.erc1155.address).send({ from: a0 })

		this.lib = new ArtabiaERC1155(this.erc1155.address)
		this.lib._connect(web3, a0)
  })

	it('should be able to mint an nft', async function () {
    return expect(
      this.lib.mint(web3.utils.randomHex(32), 1, 5)
    ).to.eventually.be.fulfilled
	})

  it('should be able to mint an nft and create an order', async function () {
    return expect(
      this.lib.mintAndCreateOrder(web3.utils.randomHex(32), 1, 1, 5, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to mint an nft and create a listing', async function () {
    return expect(
      this.lib.mintAndCreateListing(web3.utils.randomHex(32), 1, 1, 5)
    ).to.eventually.be.fulfilled
	})

  it('should be able to mint an nft and create an auction', async function () {
    return expect(
      this.lib.mintAndCreateAuction(web3.utils.randomHex(32), 1, 1, 5, +Date.now())
    ).to.eventually.be.fulfilled
	})
})
