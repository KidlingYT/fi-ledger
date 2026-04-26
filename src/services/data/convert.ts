import { ConvertedLedger, EarningInput, ErrorContext, ExpenseInput, LedgerInput, Result } from './types'
import Papa from 'papaparse'

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

  abstract convert(data: any): ConvertedLedger & ErrorContext
}

class CapitalOneConverter extends DataConverter {
  dataProvider: 'CapitalOne' = 'CapitalOne'

  constructor({ dataType }: { dataType: 'File' | 'JSON' }) {
    super({ dataType, dataProvider: 'CapitalOne' })
  }

  convert(data: any): ConvertedLedger & ErrorContext {
    switch (this.dataType) {
      case 'File':
        return this.convertFromFile(data)
      case 'JSON':
        return this.convertFromJSON(data)
    }
  }

  convertFromFile(csvString: string): ConvertedLedger & ErrorContext {
    const errors = []
    const parsed = Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) {
      console.warn('CSV parse warnings:', parsed.errors)
      parsed.errors.forEach(err => errors.push(err))
    }

    const expenses: ExpenseInput[] = []
    const earnings: EarningInput[] = []

    for (const row of parsed.data) {
      const amount = parseFloat(row['Transaction Amount'])
      const name = row['Transaction Description']?.trim()
      const date = this.parseDate(row['Transaction Date'])

      if (!name || isNaN(amount) || !date) {
        console.warn('Skipping invalid row:', row)
        errors.push(`Invalid row: ${row}`)
        continue
      }

      const base: ExpenseInput = { name, amount, date, category: null, sub_category: null }

      if (row['Transaction Type'] === 'Debit') {
        expenses.push(base)
      } else if (row['Transaction Type'] === 'Credit') {
        earnings.push({ ...base, category: 'Income' })
      }
    }

    return { earnings, expenses, errors }
  }

  /** Convert MM/DD/YY to YYYY-MM-DD */
  private parseDate(raw: string): string | null {
    if (!raw) return null
    const [month, day, year] = raw.split('/')
    if (!month || !day || !year) return null
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  convertFromJSON(data: any): ConvertedLedger & ErrorContext {
    throw 'Not Implemented'
  }
}
