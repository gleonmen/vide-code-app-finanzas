export type TransactionType = 'income' | 'expense'
export type Frequency = 'monthly' | 'semiannual' | 'annual'
export type Essentiality = 'essential' | 'non_essential'
export type CategoryTag = 'debt' | 'savings_investment'

export const NAME_MAX_LENGTH = 159

export interface Category {
  id: string
  name: string
  type: TransactionType
  tag: CategoryTag | null
  created_at: string
}

export interface Transaction {
  id: string
  type: TransactionType
  name: string
  category_id: string
  amount: number
  frequency: Frequency
  essentiality: Essentiality
  created_at: string
  category?: Category
}
