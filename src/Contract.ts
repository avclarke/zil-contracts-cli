import { Zilliqa } from '@zilliqa-js/zilliqa'
import { Contract as ZilContract, ABI } from '@zilliqa-js/contract'
import log from './logger'
import { prompt } from 'inquirer'

import { inputTXDetails } from './transaction'

export default class Contract {
  zilliqa: Zilliqa
  contract: ZilContract

  public constructor(zilliqa: Zilliqa, abi: ABI, addr: string) {
    this.zilliqa = zilliqa
    this.contract = zilliqa.contracts.at(addr, abi)
  }

  async selectAction() {
    const answers: { action: string } = await prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Action: ',
        choices: ['read state', 'transition'],
      },
    ])
    switch (answers.action) {
      case 'read state':
        await this.readState()
        break
      case 'transition':
        await this.transition()
    }
  }

  async readState(): Promise<void> {
    const state = await this.contract.getState()
    log.info('state', state, true)
    //   const { fields } = this.contract.abi
    //   if (!fields || !fields.length) {
    //     throw new Error('No fields found')
    //   }
    //   const fieldItems = fields.map(f => `${f.name}: ${f.type}`)
    //   const answers: { [key: string]: string } = await prompt([
    //     {
    //       type: 'list',
    //       name: 'field',
    //       message: `Select field:`,
    //       choices: fieldItems,
    //     },
    //   ])
  }

  async transition(): Promise<void> {
    if (!this.contract.abi) {
      throw new Error('No ABI found')
    }
    const { transitions } = this.contract.abi
    if (!transitions || !transitions.length) {
      throw new Error('No transitions found')
    }
    const transitionOptions = transitions.map(t => t.name)
    const answers: { [key: string]: string } = await prompt([
      {
        type: 'list',
        name: 'transition',
        message: `Select transition:`,
        choices: transitionOptions,
      },
    ])
    const selectedTransition = transitions.find(
      t => t.name === answers.transition,
    )
    if (selectedTransition) {
      const { params, name } = selectedTransition
      const inputs = []
      if (params.length) {
        for (const param of params) {
          const answers: { [key: string]: string } = await prompt([
            {
              type: 'input',
              name: 'param',
              message: param.name,
            },
          ])
          inputs.push({
            vname: param.name,
            type: param.type,
            value: answers.param,
          })
        }
      }
      const txDetails = await inputTXDetails(this.zilliqa)
      const res = await this.contract.call(name, inputs, txDetails)
      // TODO: confirmation
      log.info('Result', res)
    }
  }
}
