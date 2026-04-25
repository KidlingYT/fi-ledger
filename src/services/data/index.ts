import { Params } from '@feathersjs/feathers'
import { LedgerInput, Result, validateLedgerInput } from './types'
import { Application } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'
import { convertLedgerInput } from './convert'

class DataService {
  ledgerInputs: LedgerInput[] = []

  async create(input: any, params: Params) {
    const { isSuccess: isValidLedger, message, ledgerInput } = this.parseLedger(input)
    if (!isValidLedger || !ledgerInput) throw new BadRequest(message, input)

    const { isSuccess, convertedLedger } = convertLedgerInput(ledgerInput)

    const userId = input?.user_id
    if (!userId) {
      // Continue to parse, return parsed data
    } else {
      // Continue to parse, then insert into db
    }
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
