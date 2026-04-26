import { z } from 'zod'

const ExpenseSchema = z.object({
  id: z.number().int(),
  created_at: z.iso.datetime(),
  user_id: z.uuid(),
  name: z.string(),
  amount: z.number(),
  category: z.string().nullable(),
  sub_category: z.string().nullable(),
  date: z.iso.date()
})

export type Expense = z.infer<typeof ExpenseSchema>

export function validateExpense(data: unknown): Expense {
  return ExpenseSchema.parse(data)
}

const EarningSchema = z.object({
  id: z.number().int(),
  created_at: z.iso.datetime(),
  name: z.string(),
  amount: z.number(),
  category: z.string(),
  sub_category: z.string().nullable(),
  date: z.iso.date(),
  user_id: z.uuid()
})

export type Earning = z.infer<typeof EarningSchema>

export function validateEarning(data: unknown): Earning {
  return EarningSchema.parse(data)
}

const LedgerInputFileSchema = z.looseObject({
  dataProvider: z.enum(['CapitalOne']),
  dataType: z.literal('File'),
  data: z.string()
})

const LedgerInputJSONSchema = z.looseObject({
  dataProvider: z.enum(['CapitalOne']),
  dataType: z.literal('JSON'),
  data: z.record(z.string(), z.unknown())
})

const LedgerInputSchema = z.discriminatedUnion('dataType', [LedgerInputFileSchema, LedgerInputJSONSchema])

export type LedgerInput = z.infer<typeof LedgerInputSchema>

export function validateLedgerInput(data: unknown): LedgerInput {
  return LedgerInputSchema.parse(data)
}

export type ExpenseInput = Omit<Expense, 'id' | 'created_at' | 'user_id'>
export type EarningInput = Omit<Earning, 'id' | 'created_at' | 'user_id'>
export type ConvertedLedger = { earnings: EarningInput[]; expenses: ExpenseInput[] }

export interface Result {
  message: string
  isSuccess: boolean
}

export interface ErrorContext {
  errors: string[]
}
