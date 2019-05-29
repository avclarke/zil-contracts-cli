import { Zilliqa } from '@zilliqa-js/zilliqa'
import { ABI, Field } from '@zilliqa-js/contract'
import { RPCMethod } from '@zilliqa-js/core'
import { Long, bytes } from '@zilliqa-js/util'
import { selectScillaContract, selectABI } from './fileReader'
import { prompt } from 'inquirer'

import log from './logger'
import { inputGasValues } from './transaction'

interface InitParam {
  vname: string
  type: string
  value: string
}

interface ABIParam extends Field {
  default?: string | undefined
}

const constructInit = async (abi: ABI): Promise<Array<InitParam>> => {
  log.header('Contract init params')

  const init: Array<InitParam> = []
  const params: Array<ABIParam> = [
    ...abi.params,
    ...[
      {
        name: '_creation_block',
        type: 'BNum',
        default: '1',
      },
      {
        name: '_scilla_version',
        type: 'Uint32',
        default: '0',
      },
    ],
  ]
  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    const answers: { [key: string]: string } = await prompt([
      {
        type: 'input',
        name: param.name,
        message: `${param.name} param:`,
        default: param.default,
      },
    ])
    init.push({
      vname: param.name,
      type: param.type,
      value: answers[param.name],
    })
  }
  return init
}

export const deployContract = async (zilliqa: Zilliqa): Promise<void> => {
  if (!zilliqa.wallet.defaultAccount) {
    throw new Error('No account found')
  }

  const code = await selectScillaContract()
  const abi = await selectABI()
  const init = await constructInit(abi)

  const contract = zilliqa.contracts.new(code, init)

  const vRes = await zilliqa.provider.send(RPCMethod.GetNetworkId)
  const version = bytes.pack(Number(vRes.result), 1)

  const { gasPrice, gasLimit } = await inputGasValues(zilliqa)

  log.info('Gas price', gasPrice)
  log.info('Gas limit', gasLimit)
  log.info('Version', vRes.result, true)

  const [deployTx, contractRes] = await contract.deploy(
    {
      version: version,
      gasPrice: gasPrice,
      gasLimit: Long.fromNumber(200000),
    },
    200,
  )
  log.info('Transaction', deployTx, true)
  log.info('Contract Res', contractRes, true)
  log.info('Address', contractRes.address, true)

  if (contract.isRejected()) {
    // TODO: Get and display Error
    log.warn('Failed to deploy contract (Rejected)')
  }
}
