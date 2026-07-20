import type { Transaction } from '../types'

interface Props {
  transactions: Transaction[]
  onDelete: (id: string) => void
}

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const frequencyLabels: Record<Transaction['frequency'], string> = {
  monthly: 'Mensual',
  semiannual: 'Semestral',
  annual: 'Anual',
}

export function TransactionList({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return <p className="empty-state">No hay registros todavia.</p>
  }

  return (
    <table className="transaction-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>Valor</th>
          <th>Frecuencia</th>
          <th>Clasificacion</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id} className={t.type}>
            <td>{t.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
            <td>{t.name}</td>
            <td>{t.category?.name ?? '-'}</td>
            <td>{currencyFormatter.format(t.amount)}</td>
            <td>{frequencyLabels[t.frequency]}</td>
            <td>
              <span className={`badge ${t.essentiality}`}>
                {t.essentiality === 'essential' ? 'E' : 'NE'}
              </span>
            </td>
            <td>
              <button type="button" className="delete-btn" onClick={() => onDelete(t.id)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
