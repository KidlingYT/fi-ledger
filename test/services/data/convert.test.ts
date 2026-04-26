import assert from 'assert'
import { convertLedgerInput } from '../../../src/services/data/convert'
import { CAPITAL_ONE_CSV_HEADERS } from '../../../src/services/data/lib'

describe('convertLedgerInput', () => {
  describe('CapitalOne File', () => {
    function makeCSV(...rows: string[]): string {
      return [CAPITAL_ONE_CSV_HEADERS, ...rows].join('\n')
    }
    function convert(csv: string) {
      return convertLedgerInput({ dataProvider: 'CapitalOne', dataType: 'File', data: csv })
    }

    it('maps a Debit row to an expense', () => {
      const csv = makeCSV('04/10/26,Whole Foods,42.50,Debit,,,')
      const { convertedLedger, isSuccess } = convert(csv)

      assert.strictEqual(isSuccess, true)
      assert.strictEqual(convertedLedger.expenses.length, 1)
      assert.strictEqual(convertedLedger.earnings.length, 0)

      const [expense] = convertedLedger.expenses
      assert.strictEqual(expense.name, 'Whole Foods')
      assert.strictEqual(expense.amount, 42.5)
      assert.strictEqual(expense.date, '2026-04-10')
    })

    it('maps a Credit row to an earning with category Income', () => {
      const csv = makeCSV('04/10/26,Direct Deposit,1500.00,Credit,,,')
      const { convertedLedger } = convert(csv)

      assert.strictEqual(convertedLedger.earnings.length, 1)
      assert.strictEqual(convertedLedger.expenses.length, 0)

      const [earning] = convertedLedger.earnings
      assert.strictEqual(earning.name, 'Direct Deposit')
      assert.strictEqual(earning.amount, 1500)
      assert.strictEqual(earning.category, 'Income')
    })

    it('converts date from MM/DD/YY to YYYY-MM-DD', () => {
      const csv = makeCSV('01/05/26,Coffee,3.50,Debit,,,')
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses[0].date, '2026-01-05')
    })

    it('treats YY < 50 as 2000s and YY >= 50 as 1900s', () => {
      const csv = makeCSV('06/15/49,Old Coffee,3.50,Debit,,,', '06/15/50,Older Coffee,3.50,Debit,,,')
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses[0].date, '2049-06-15')
      assert.strictEqual(convertedLedger.expenses[1].date, '1950-06-15')
    })

    it('skips a row with a missing description and records an error', () => {
      const csv = makeCSV('04/10/26,,42.50,Debit,,,')
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses.length, 0)
      assert.strictEqual(convertedLedger.errors.length, 1)
    })

    it('skips a row with a non-numeric amount and records an error', () => {
      const csv = makeCSV('04/10/26,Whole Foods,N/A,Debit,,,')
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses.length, 0)
      assert.strictEqual(convertedLedger.errors.length, 1)
    })

    it('skips a row with a missing date and records an error', () => {
      const csv = makeCSV(',Whole Foods,42.50,Debit,,,')
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses.length, 0)
      assert.strictEqual(convertedLedger.errors.length, 1)
    })

    it('returns empty arrays for an empty CSV', () => {
      const { convertedLedger, isSuccess } = convert(CAPITAL_ONE_CSV_HEADERS)
      assert.strictEqual(isSuccess, true)
      assert.strictEqual(convertedLedger.expenses.length, 0)
      assert.strictEqual(convertedLedger.earnings.length, 0)
    })

    it('handles multiple rows correctly', () => {
      const csv = makeCSV(
        '04/10/26,Whole Foods,42.50,Debit,,,',
        '04/11/26,Direct Deposit,1500.00,Credit,,,',
        '04/12/26,Netflix,15.99,Debit,,,'
      )
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses.length, 2)
      assert.strictEqual(convertedLedger.earnings.length, 1)
    })

    it('trims whitespace from transaction description', () => {
      const csv = makeCSV('04/10/26,  Whole Foods  ,42.50,Debit,,,')
      const { convertedLedger } = convert(csv)
      assert.strictEqual(convertedLedger.expenses[0].name, 'Whole Foods')
    })
  })
})
