import path from 'path'
import fs from 'fs-extra'
import program from 'commander'
import { prompt } from 'inquirer'
import { ABI } from '@zilliqa-js/contract'

export const selectScillaContract = async (): Promise<string> => {
  let dir = './contracts'
  const fileName = 'CrowdFunding.scilla'

  const filePath = path.resolve(dir, fileName)
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

  const files = fs
    .readdirSync(abiPath)
    .reduce((acc: Array<string>, file: string): Array<string> => {
      if (file.endsWith('.json')) {
        acc.push(file.replace('.json', ''))
      }
      return acc
    }, [])

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
