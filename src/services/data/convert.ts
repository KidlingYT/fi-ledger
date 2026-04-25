import { ConvertedLedger, LedgerInput, Result } from './types'

export function convertLedgerInput(ledgerInput: LedgerInput): {
  convertedLedger: ConvertedLedger
} & Result {
  let isSuccess = true
  let message = ''
  let converter: DataConverter

  const { data, dataType, dataProvider } = ledgerInput
  switch (
    dataProvider // Factory pattern?
  ) {
    case 'CapitalOne':
      converter = new CapitalOneConverter({ dataType })
      break
    default:
      isSuccess = false
      message = `Invalid provider: ${dataProvider}`
      return { convertedLedger: { earnings: [], expenses: [] }, isSuccess, message }
  }

  const convertedLedger = converter.convert(data)

  return { convertedLedger, isSuccess, message }
}

abstract class DataConverter {
  dataProvider: 'CapitalOne' = 'CapitalOne' // TODO: support more for both provider and type
  dataType: 'File' | 'JSON' = 'File'

  constructor({ dataProvider, dataType }: { dataProvider: 'CapitalOne'; dataType: 'File' | 'JSON' }) {
    this.dataProvider = dataProvider
    this.dataType = dataType
  }

  abstract convert(data: any): ConvertedLedger
}

class CapitalOneConverter extends DataConverter {
  dataProvider: 'CapitalOne' = 'CapitalOne'

  constructor({ dataType }: { dataType: 'File' | 'JSON' }) {
    super({ dataType, dataProvider: 'CapitalOne' })
  }

  convert(data: any): ConvertedLedger {
    switch (this.dataType) {
      case 'File':
        return this.convertFromFile(data)
      case 'JSON':
        return this.convertFromJSON(data)
    }
  }

  convertFromFile(data: any): ConvertedLedger {
    console.log('here')
    return { earnings: [], expenses: [] }
  }

  convertFromJSON(data: any): ConvertedLedger {
    throw 'Not Implemented'
  }
}
