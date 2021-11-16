const ERC721OrderMarketplace = require("./src/contracts/ERC721Marketplace/ERC721OrderMarketplace")
const ERC721ListingMarketplace = require("./src/contracts/ERC721Marketplace/ERC721ListingMarketplace")
const ERC721AuctionMarketplace = require("./src/contracts/ERC721Marketplace/ERC721AuctionMarketplace")
const ERC1155OrderMarketplace = require("./src/contracts/ERC1155Marketplace/ERC1155OrderMarketplace")
const ERC1155ListingMarketplace = require("./src/contracts/ERC1155Marketplace/ERC1155ListingMarketplace")
const ERC1155AuctionMarketplace = require("./src/contracts/ERC1155Marketplace/ERC1155AuctionMarketplace")
const ArtabiaERC721 = require('./src/contracts/tokens/ArtabiaERC721')
const ArtabiaERC1155 = require('./src/contracts/tokens/ArtabiaERC1155')

const IntegrationManager = require("./src/IntegrationManager")

module.exports = {
  IntegrationManager,
  ERC721OrderMarketplace,
  ERC721ListingMarketplace,
  ERC721AuctionMarketplace,
  ERC1155OrderMarketplace,
  ERC1155ListingMarketplace,
  ERC1155AuctionMarketplace,
  ArtabiaERC721,
  ArtabiaERC1155
}