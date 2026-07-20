import { useState, type FormEvent } from 'react'
import type { Category, Essentiality, Frequency, TransactionType } from '../types'
import { NAME_MAX_LENGTH } from '../types'
import { AmountInput } from './AmountInput'

interface Props {
  categories: Category[]
  onSubmit: (data: {
    type: TransactionType
    name: string
    categoryId: string
    amount: number
    frequency: Frequency
    essentiality: Essentiality
  }) => Promise<void>
}

export function TransactionForm({ categories, onSubmit }: Props) {
  const [type, setType] = useState<TransactionType>('expense')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amountDigits, setAmountDigits] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [essentiality, setEssentiality] = useState<Essentiality | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoriesForType = categories.filter((c) => c.type === type)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedAmount = Number(amountDigits)
    if (!name.trim()) return setError('El nombre / descripcion es obligatorio.')
    if (!categoryId) return setError('Selecciona una categoria.')
    if (!parsedAmount || parsedAmount <= 0) return setError('El valor debe ser mayor a 0.')
    if (!essentiality) return setError('Selecciona si es esencial o no esencial.')

    setSubmitting(true)
    try {
      await onSubmit({
        type,
        name: name.trim(),
        categoryId,
        amount: parsedAmount,
        frequency,
        essentiality,
      })
      setName('')
      setAmountDigits('')
      setCategoryId('')
      setEssentiality('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="type-toggle">
        <button
          type="button"
          className={type === 'income' ? 'active' : ''}
          onClick={() => {
            setType('income')
            setCategoryId('')
          }}
        >
          Ingreso
        </button>
        <button
          type="button"
          className={type === 'expense' ? 'active' : ''}
          onClick={() => {
            setType('expense')
            setCategoryId('')
          }}
        >
          Gasto
        </button>
      </div>

      <label>
        Nombre / descripcion
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Arriendo"
          maxLength={NAME_MAX_LENGTH}
          required
        />
        <span className="char-counter">
          {name.length}/{NAME_MAX_LENGTH}
        </span>
      </label>

      <label>
        Categoria
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Selecciona una categoria</option>
          {categoriesForType.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Valor aproximado
        <AmountInput digits={amountDigits} onChange={setAmountDigits} />
      </label>

      <label>
        Frecuencia
        <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} required>
          <option value="monthly">Mensual</option>
          <option value="semiannual">Semestral</option>
          <option value="annual">Anual</option>
        </select>
      </label>

      <label>
        Clasificacion
        <select
          value={essentiality}
          onChange={(e) => setEssentiality(e.target.value as Essentiality)}
          required
        >
          <option value="">Selecciona una clasificacion</option>
          <option value="essential">Esencial (E)</option>
          <option value="non_essential">No esencial (NE)</option>
        </select>
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting} className="submit-btn">
        {submitting ? 'Guardando...' : `Agregar ${type === 'income' ? 'ingreso' : 'gasto'}`}
      </button>
    </form>
  )
}
