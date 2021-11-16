// Enable Truffle 5 plugin for tests
// https://hardhat.org/guides/truffle-testing.html
require('@nomiclabs/hardhat-truffle5');

const chai = require('chai')

chai.use(require('chai-bignumber')());
chai.use(require('chai-as-promised'));

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	defaultNetwork: 'hardhat',
	solidity: {
		version: "0.8.9",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	paths: {
		artifacts: "./artabia-contracts/artifacts",
		sources: "./artabia-contracts/contracts",
		cache: "./artabia-contracts/cache"
	},

	// Set default mocha options here, use special reporters etc.
	mocha: {
		// timeout: 100000,

		// disable mocha timeouts:
		// https://mochajs.org/api/mocha#enableTimeouts
		enableTimeouts: false,
		// https://github.com/mochajs/mocha/issues/3813
		timeout: false,
	},
}
