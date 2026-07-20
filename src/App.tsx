import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import type { Category, Essentiality, Frequency, Transaction, TransactionType } from './types'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import './App.css'

function toMonthly(amount: number, frequency: Frequency) {
  switch (frequency) {
    case 'monthly':
      return amount
    case 'semiannual':
      return amount / 6
    case 'annual':
      return amount / 12
  }
}

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)

    const [categoriesRes, transactionsRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false }),
    ])

    if (categoriesRes.error) setError(categoriesRes.error.message)
    else setCategories(categoriesRes.data as Category[])

    if (transactionsRes.error) setError(transactionsRes.error.message)
    else setTransactions(transactionsRes.data as Transaction[])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleAdd(data: {
    type: TransactionType
    name: string
    categoryId: string
    amount: number
    frequency: Frequency
    essentiality: Essentiality
  }) {
    const { error } = await supabase.from('transactions').insert({
      type: data.type,
      name: data.name,
      category_id: data.categoryId,
      amount: data.amount,
      frequency: data.frequency,
      essentiality: data.essentiality,
    })
    if (error) throw new Error(error.message)
    await loadData()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) setError(error.message)
    else await loadData()
  }

  const monthlyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + toMonthly(t.amount, t.frequency), 0)

  const expenses = transactions.filter((t) => t.type === 'expense')
  const monthlyExpense = expenses.reduce((sum, t) => sum + toMonthly(t.amount, t.frequency), 0)
  const monthlyEssentialExpense = expenses
    .filter((t) => t.essentiality === 'essential')
    .reduce((sum, t) => sum + toMonthly(t.amount, t.frequency), 0)
  const monthlyNonEssentialExpense = expenses
    .filter((t) => t.essentiality === 'non_essential')
    .reduce((sum, t) => sum + toMonthly(t.amount, t.frequency), 0)
  const monthlyDebt = expenses
    .filter((t) => t.category?.tag === 'debt')
    .reduce((sum, t) => sum + toMonthly(t.amount, t.frequency), 0)
  const monthlySavingsInvestment = expenses
    .filter((t) => t.category?.tag === 'savings_investment')
    .reduce((sum, t) => sum + toMonthly(t.amount, t.frequency), 0)

  return (
    <div className="app">
      <h1>Finanzas personales</h1>

      {error && <p className="form-error">{error}</p>}

      <section className="summary">
        <div className="summary-card income">
          <span>Ingresos / mes</span>
          <strong>{currencyFormatter.format(monthlyIncome)}</strong>
        </div>
        <div className="summary-card expense">
          <span>Gastos / mes</span>
          <strong>{currencyFormatter.format(monthlyExpense)}</strong>
        </div>
        <div className="summary-card balance">
          <span>Balance / mes</span>
          <strong>{currencyFormatter.format(monthlyIncome - monthlyExpense)}</strong>
        </div>
        <div className="summary-card essential">
          <span>Gastos esenciales / mes</span>
          <strong>{currencyFormatter.format(monthlyEssentialExpense)}</strong>
        </div>
        <div className="summary-card non-essential">
          <span>Gastos no esenciales / mes</span>
          <strong>{currencyFormatter.format(monthlyNonEssentialExpense)}</strong>
        </div>
        <div className="summary-card debt">
          <span>Deudas / mes</span>
          <strong>{currencyFormatter.format(monthlyDebt)}</strong>
        </div>
        <div className="summary-card savings">
          <span>Ahorro e inversion / mes</span>
          <strong>{currencyFormatter.format(monthlySavingsInvestment)}</strong>
        </div>
      </section>

      <section className="content">
        <TransactionForm categories={categories} onSubmit={handleAdd} />
        {loading ? <p>Cargando...</p> : <TransactionList transactions={transactions} onDelete={handleDelete} />}
      </section>
    </div>
  )
}

export default App
