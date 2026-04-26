import { Params } from '@feathersjs/feathers'
import { LedgerInput, Result, validateLedgerInput } from './types'
import { Application } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'
import { convertLedgerInput } from './convert'
class DataService {
  ledgerInputs: LedgerInput[] = []

  async create(input: any, _params: Params) {
    const { isSuccess: isValidLedger, message: ledgerMessage, ledgerInput } = this.parseLedger(input)
    if (!isValidLedger || !ledgerInput) throw new BadRequest(ledgerMessage, input)

    const { isSuccess, convertedLedger, message } = convertLedgerInput(ledgerInput)

    if (!isSuccess) throw new BadRequest(message, input)

    return { convertedLedger, isSuccess }
  }

  parseLedger(input: any): {
    ledgerInput?: LedgerInput
  } & Result {
    try {
      const ledgerInput = validateLedgerInput(input)
      return {
        isSuccess: true,
        message: `${ledgerInput.dataProvider} provider with ${ledgerInput.dataType} supported.`,
        ledgerInput
      }
    } catch (error) {
      return { isSuccess: false, message: error instanceof Error ? error.message : (error as string) }
    }
  }
}

export const data = (app: Application) => {
  app.use('data', new DataService())
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    ['data']: DataService
  }
}
