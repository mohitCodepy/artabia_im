const { constants } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants

const { artifacts } = require("hardhat");

const ERC721ListingMarketplace = require('../../src/contracts/ERC721Marketplace/ERC721ListingMarketplace')

const ArtabiaERC721 = artifacts.require('ArtabiaERC721')
const Marketplace = artifacts.require('ERC721ListingMarketplace')

contract('Integration: ERC721ListingMarketplace', ([a0, a1, feeDestinationAddress]) => {
  beforeEach(async function () {
    this.marketplace = await Marketplace.new(feeDestinationAddress)

    this.erc721 = await ArtabiaERC721.new([this.marketplace.address, ZERO_ADDRESS, ZERO_ADDRESS])

    this.tokenId = web3.utils.randomHex(32)
    await this.erc721.mint(this.tokenId, '0')

    await this.marketplace.addApprovedContract(this.erc721.address)

		this.lib = new ERC721ListingMarketplace(this.marketplace.address)
		this.lib._connect(web3, a0)
  })

	it('should be able to create a listing', async function () {
    return expect(
      this.lib.createListing(this.erc721.address, this.tokenId, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to view an listing', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.getListing(id)
    ).to.eventually.be.fulfilled
	})

  it('should be able to view an listing', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    await this.lib.placeOffer(id, '3')

    return expect(
      this.lib.getListingOffers(id)
    ).to.eventually.be.fulfilled
	})

  it('should not be able to view non-existent listing', async function () {
    return expect(
      this.lib.getListing(web3.utils.randomHex(32))
    ).to.eventually.equal(null)
	})

  it('should be able to remove a listing', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.removeListing(id)
    ).to.eventually.be.fulfilled
	})

  it('should be able to place an offer on a listing', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.placeOffer(id, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to estimate gas for placing an offer on a listing', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    return expect(
      this.lib.placeOfferGasEstimation(id, '2')
    ).to.eventually.be.fulfilled
	})

  it('should be able to asset whether an offer can be withdrawn', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    await this.lib.placeOffer(id, '2')

    expect(typeof await this.lib.canWithdrawOffer(id)).to.equal('number')
	})

  it('should be able to accept an offer for a listing', async function () {
    const id = await this.lib.createListing(this.erc721.address, this.tokenId, '2')

    await this.lib.placeOffer(id, '2')

    return expect(
      this.lib.acceptListingOffer(id)
    ).to.eventually.be.fulfilled
	})
})
