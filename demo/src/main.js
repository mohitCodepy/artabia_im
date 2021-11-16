const { IntegrationManager, ERC721OrderMarketplace, ERC721ListingMarketplace, ERC721AuctionMarketplace, ERC1155OrderMarketplace, ERC1155ListingMarketplace, ERC1155AuctionMarketplace, ArtabiaERC721, ArtabiaERC1155 } = require('../../index.js');

(async () => {
  const im = new IntegrationManager([
    [ERC721OrderMarketplace, '0x19758251c120a986d3c9134ef33d9100f54647e0', 'erc721OrderMarketplace'],
    [ERC721ListingMarketplace, '0x294bc4e099e44ae934c64b815b50dab0f608f130', 'erc721ListingMarketplace'],
    [ERC721AuctionMarketplace, '0xe9271275d44e0178154ead62e4aa49faad322897', 'erc721AuctionMarketplace'],
    [ERC1155OrderMarketplace, '0x0e6a13be0de9dce2c044c22ed49f2dfba3e091ef', 'erc1155OrderMarketplace'],
    [ERC1155ListingMarketplace, '0xfbdbcf68c34f8e348a3a23c008afd602a3f778f1', 'erc1155ListingMarketplace'],
    [ERC1155AuctionMarketplace, '0xb1f0fe835438edf4b2787a013d41df3bde6f900e', 'erc1155AuctionMarketplace'],
    [ArtabiaERC721, '0xd5f9ce56e52623a7ad20cdf88ae53e8e0b2e7d72', 'artabiaERC721'],
    [ArtabiaERC1155, '0x2ead921ca3710c6693189a4641be88747e2e2400', 'artabiaERC1155']
  ]);

  const address = await im.connect(['rinkeby', 'mainnet'])
})()