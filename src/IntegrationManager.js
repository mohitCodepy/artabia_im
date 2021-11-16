const Web3 = require('web3');
const web3Utils = require('web3-utils');
const detectEthereumProvider = require('@metamask/detect-provider')
const estimateGasPriceAndTime = require('./utils/estimateGasPriceAndTime')

function isNormalHexInteger(str) {
  if(typeof str != 'string') return false

  return str.startsWith('0x') && isNormalInteger(str.substr(2))
}

// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
function isUserRejectedRequestError(error) {
  return error.code === 4001
}

// https://eips.ethereum.org/EIPS/eip-1474#error-codes
function isUnrecognizedChainError(error) {
  return error.code === -32603 && error.message.toLowerCase().includes('unrecognized chain id')
}

const chainToChainId = {
  mainnet: '0x1',
  ropsten: '0x3',
  rinkeby: '0x4',
  goerli: '0x5',
  kovan: '0x2a',
  binance: '0x38',
  'binance testnet': '0x61',
  polygon: '0x89'
}

const chainIdToChain = Object.fromEntries(Object.entries(chainToChainId).map(a => a.reverse()))

class IntegrationManager {
  constructor(contractPairs) {
    if(!Array.isArray(contractPairs)) {
      throw new Error('contracts argument must be an array')
    }

    if(!contractPairs.length) {
      throw new Error('At least one contract must be included')
    }

    contractPairs.forEach((contractPair, i) => {
      if(!Array.isArray(contractPair)) {
        throw new Error(`contracts[${i}] must be an array`)
      }

      if(contractPair.length != 3) {
        throw new Error(`contracts[${i}] must be an array of length 3`)
      }

      if(!contractPair[0] || contractPair[0].isIntegrationClass !== true) {
        throw new Error(`contracts[${i}][0] must be an integration class`)
      }

      if(typeof contractPair[1] != 'string' || !web3Utils.isAddress(contractPair[1])) {
        throw new Error(`contracts[${i}][1] must be a valid Ethereum address string`)
      }

      if(typeof contractPair[2] != 'string' || !contractPair[2].length) {
        throw new Error(`contracts[${i}][2] must be be a valid contract name alias string`)
      }
    })

    this.contracts = {}

    contractPairs.forEach(contractPair => {
      const contractIntegrationInstance = new contractPair[0](contractPair[1])

      this.contracts[contractPair[2]] = contractIntegrationInstance
    })
  }

  async _getEthereumProvider() {
    const provider = await detectEthereumProvider()

    if(!provider) {
      throw new Error('Ethereum wallet not found. Please install Metamask or use an Ethereum-compatible mobile browser.')
    }

    if(window.ethereum != provider) {
      throw new Error('Ethereum wallet is being overwritten. Please ensure you only have one extension wallet installed.')
    }

    return ethereum
  }

  async _useChainId(provider, chainId) {
    const currentChainId = await provider.request({ method: 'eth_chainId' })

    if(currentChainId != chainId ) {
      return window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }]
      }).catch(error => {
        if(isUserRejectedRequestError(error)) {
          throw new Error(`Please reconfigure your Ethereum wallet to use the network with chainId ${chainId}.`)
        } else if(isUnrecognizedChainError(error)) {
          throw new Error(`Please add the network with chainId ${chainId} RPC information to your Ethereum wallet.`)
        } else throw error
      });
    }
  }

  _useChain(provider, chain) {
    if(!chainToChainId.hasOwnProperty(chain)) {
      throw new Error(`Unsupported chain ${chain}`)
    }

    return this._useChainId(provider, chainToChainId[chain]).catch(error => {
      if(isUserRejectedRequestError(error)) {
        throw new Error(`Please reconfigure your Ethereum wallet to use the ${chain} network.`)
      } else if(isUnrecognizedChainError(error)) {
        throw new Error(`Please add the ${chain} network RPC information to your Ethereum wallet.`)
      } else throw error
    })
  }

  _getAccount(provider) {
    return provider.send('eth_requestAccounts').then(req => req.result[0]).catch(error => {
      if(isUserRejectedRequestError(error)) {
        throw new Error('Please allow the site to connect to your Ethereum wallet.')
      } else throw error
    })
  }

  _getWeb3(provider) {
    return new Web3(provider)
  }

  _connectContract(web3, account, contract) {
    return contract._connect(web3, account)
  }

  _connectAllContracts(web3, account, contracts) {
    contracts.forEach(contract => {
      this._connectContract(web3, account, contract)
    })
  }

  async connect(chain, providedWeb3, providedAccount) {
    if(!chain) {
      throw new Error('Please provide a chain to connect to.')
    }

    let provider = null
    let web3 = providedWeb3
    let account = providedAccount

    if(!web3) {

      provider = await this._getEthereumProvider()

      if(isNormalHexInteger(chain)) {
        await this._useChainId(provider, chain)
      } else {
        await this._useChain(provider, chain)
      }

      account = await this._getAccount(provider)

      web3 = this._getWeb3(provider)

    }

    await this._connectAllContracts(web3, account, Object.values(this.contracts))

    this.provider = provider
    this.account = account
    this.web3 = web3

    return account
  }

  async getEthereumNetwork() {
    const provider = await this._getEthereumProvider()

    const networkVersion = '0x' + parseInt(provider.networkVersion).toString('16')

    if(!chainIdToChain.hasOwnProperty(networkVersion)) {
      throw new Error(`Unknown network with chainId ${networkVersion}`)
    }

    return chainIdToChain[networkVersion]
  }
}

module.exports = IntegrationManager