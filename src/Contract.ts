import { Zilliqa } from '@zilliqa-js/zilliqa'
import { Contract as ZilContract, ABI } from '@zilliqa-js/contract'
import log from './logger'

export default class Contract {
  zilliqa: Zilliqa
  contract: ZilContract

  public constructor(zilliqa: Zilliqa, abi: ABI, addr: string) {
    this.zilliqa = zilliqa
    this.contract = zilliqa.contracts.at(addr, abi)
    log.info('Contract', this.contract.toString())
  }
}
