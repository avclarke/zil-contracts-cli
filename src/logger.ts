import chalk from 'chalk'

interface Chalk {
  [key: string]: any
}

type LogInput = string | Record<string, any> | undefined

const stringify = (value: LogInput): string | undefined => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}

const logger = {
  header: (title: string): void => {
    // eslint-disable-next-line no-console
    console.log(chalk.bold(`\n---- ${title}\n`))
  },
  info: (label: string, text: LogInput, space?: boolean): void => {
    // eslint-disable-next-line no-console
    console.log(
      chalk.blue(chalk.bold(`${label}:`)),
      `${stringify(text)}`,
      space ? '\n' : '',
    )
  },
  success: (text: string): void => {
    // eslint-disable-next-line no-console
    console.log(chalk.green(`\n${text}\n`))
  },
  separtor: (): void => {
    // eslint-disable-next-line no-console
    console.log(chalk.bold(`\n----\n`))
  },
  warn: (text: string): void => {
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n${text}\n`))
  },
}

export default logger
