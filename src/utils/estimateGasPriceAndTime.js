const axios = require('axios')

const defiPulseApiKey = 'ed8a0f4fe4e80d364f295f6ef5adc1321453c0fdc0221af742bc3287bcfc'
const web3Utils = require('web3-utils')

async function estimateGasPriceAndTime(speed = 'standard') {
  const gasStationSpeedMapping = {
    slow: 'safeLow',
    standard: 'average',
    fast: 'fast',
    urgent: 'fastest'
  }

  if(!Object.keys(gasStationSpeedMapping).includes(speed)) {
    throw new Error(`Invalid transaction speed ${speed}. Please choose one of: ${Object.keys(gasStationSpeedMapping).join(', ')}`)
  }

  const gasStationSpeed = gasStationSpeedMapping[speed]

  const apiResponse = await axios.get(
    'https://ethgasstation.info/api/ethgasAPI.json',
    {
      params: {
        'api-key': defiPulseApiKey
      }
    }
  ).then(res => res.data)

  return {
    gasPrice: web3Utils.toWei(apiResponse[gasStationSpeed].toString(), 'gwei'),
    waitTime: apiResponse[`${gasStationSpeed}Wait`]
  }
}

module.exports = estimateGasPriceAndTime
