import path from 'path'
import fs from 'fs-extra'
import program from 'commander'
import { prompt } from 'inquirer'
import { ABI } from '@zilliqa-js/contract'

const readFiles = async (dirPath: string, extension: string) => {
  return fs
    .readdirSync(dirPath)
    .reduce((acc: Array<string>, file: string): Array<string> => {
      if (file.endsWith(extension)) {
        acc.push(file.replace(extension, ''))
      }
      return acc
    }, [])
}

export const selectScillaContract = async (): Promise<string> => {
  let contractsPath = program.contractsPath
  if (!contractsPath) {
    const answers: { contractsPath: string } = await prompt([
      {
        type: 'input',
        name: 'contractsPath',
        message: `Path to folder containing scilla contracts: `,
      },
    ])
    contractsPath = answers.contractsPath
  }

  const files = await readFiles(contractsPath, '.scilla')

  const answers: { fileName: string } = await prompt([
    {
      type: 'list',
      name: 'fileName',
      message: 'Select contract file: ',
      choices: files,
    },
  ])
  const { fileName } = answers

  const filePath = path.resolve(contractsPath, `${fileName}.scilla`)
  return fs.readFile(filePath, 'utf8')
}

export const selectABI = async (): Promise<ABI> => {
  let abiPath = program.abiPath
  if (!abiPath) {
    const answers: { abiPath: string } = await prompt([
      {
        type: 'input',
        name: 'abiPath',
        message: `Path to folder containing contrant abi's: `,
      },
    ])
    abiPath = answers.abiPath
  }

  const files = await readFiles(abiPath, '.json')

  const answers: { fileName: string } = await prompt([
    {
      type: 'list',
      name: 'fileName',
      message: 'Select ABI file: ',
      choices: files,
    },
  ])
  const { fileName } = answers
  const abiFilePath = path.resolve(abiPath, `${fileName}.json`)
  return fs.readJson(abiFilePath)
}
