import { Long, bytes, units, BN } from '@zilliqa-js/util'
import { Zilliqa } from '@zilliqa-js/zilliqa'
import { RPCMethod } from '@zilliqa-js/core'
import { prompt } from 'inquirer'

import log from './logger'

export const inputGasValues = async (
  zilliqa: Zilliqa,
): Promise<{ gasLimit: Long; gasPrice: BN }> => {
  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()
  log.header('Set Gas Price')
  log.info('Min gas price: ', minGasPrice.result)
  const answers: { [key: string]: string } = await prompt([
    {
      type: 'input',
      name: 'gasPrice',
      message: `Gas price:`,
      default: '1000',
    },
    {
      type: 'input',
      name: 'gasLimit',
      message: `Gas limit:`,
      default: '200000',
    },
  ])
  const gasLimit = Long.fromNumber(Number(answers.gasLimit))
  const gasPrice = units.toQa(answers.gasPrice, units.Units.Li)
  return { gasLimit, gasPrice }
}

export const inputTXDetails = async (
  zilliqa: Zilliqa,
): Promise<{
  gasLimit: Long
  gasPrice: BN
  version: number
  amount: BN
}> => {
  const gasValues = await inputGasValues(zilliqa)
  const vRes = await zilliqa.provider.send(RPCMethod.GetNetworkId)
  const version = bytes.pack(Number(vRes.result), 1)
  const answers: { [key: string]: string } = await prompt([
    {
      type: 'input',
      name: 'amount',
      message: `Amount Zil:`,
      default: '0',
    },
  ])
  const amount = new BN(answers.amount)
  return {
    ...gasValues,
    version,
    amount,
  }
}
