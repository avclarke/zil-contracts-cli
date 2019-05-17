#!/usr/bin/env node

import program from 'commander'
import { prompt } from 'inquirer'
import { Zilliqa } from '@zilliqa-js/zilliqa'
import { getAddressFromPrivateKey } from '@zilliqa-js/crypto'

import log from './logger'
import CONFIG from './config.json'
import Contract from './Contract'
import { deployContract } from './deployContract'
import { selectABI } from './fileReader'

program
  .version('0.1.0')
  .option('-p, --private-key <path>', 'Private Key')
  .option('-a, --abi-dir <path>', 'Path to ABI folder')
  .option('-r, --rpc-url <url>', 'Set Zil JSON RPC URL')
  .option('-n, --network <string>', 'Network name (mainnet, testnet, kaya)')
  .parse(process.argv)

interface NetworkConfig {
  url: string
  version: number
}

const inputAddress = async (): Promise<string> => {
  const answers: { address: string } = await prompt([
    {
      type: 'input',
      name: 'address',
      message: 'Contract address: ',
    },
  ])
  return answers.address
}

const interactWithContract = async (zilliqa: Zilliqa): Promise<Contract> => {
  const abi = await selectABI()
  const address = await inputAddress()
  return new Contract(zilliqa, abi, address)
}

const requestPrivateKey = async (): Promise<string> => {
  const answers: { privateKey: string } = await prompt([
    {
      type: 'password',
      name: 'privateKey',
      message: 'Enter private key: ',
    },
  ])
  return answers.privateKey
}

const selectAction = async (zilliqa: Zilliqa): Promise<void> => {
  const answers: { action: string } = await prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Action: ',
      choices: ['deploy', 'interact'],
    },
  ])
  switch (answers.action) {
    case 'deploy':
      await deployContract(zilliqa)
      break
    case 'interact':
      await interactWithContract(zilliqa)
  }
}

const logAccountInfo = (address: string, balance: string): void => {
  log.header('Account Info')
  log.info('Address:', address)
  log.info('Balance', balance)
  log.separtor()
}

const setupZil = async (url: string): Promise<Zilliqa> => {
  const zilliqa = new Zilliqa(url)
  const key = program.privateKey || (await requestPrivateKey())
  zilliqa.wallet.addByPrivateKey(key)
  const address = getAddressFromPrivateKey(key)
  const res = await zilliqa.blockchain.getBalance(address)
  logAccountInfo(address, res.result.balance)
  return zilliqa
}

const run = async (): void => {
  try {
    const NETWORKS: { [key: string]: NetworkConfig } = CONFIG.networks

    if (program.network && !NETWORKS[program.network]) {
      log.warn(`Unsupported network [${program.network}]`)
      process.exit()
    }
    const netSettings = NETWORKS[program.network] || NETWORKS.testnet
    const zilliqa = await setupZil(netSettings.url)
    await selectAction(zilliqa)
  } catch (err) {
    log.warn(err)
  }
}

run()
