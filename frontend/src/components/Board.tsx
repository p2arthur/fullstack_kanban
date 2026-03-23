import type { Column as ColumnType } from '../types'
import ColumnComponent from './Column'

interface Props {
  columns: ColumnType[]
  onAddCard: (columnId: string, title: string, details: string) => void
  onDeleteCard: (columnId: string, cardId: string) => void
  onRenameColumn: (columnId: string, title: string) => void
}

export default function Board({ columns, onAddCard, onDeleteCard, onRenameColumn }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      height: '100%',
      overflowX: 'auto',
      paddingBottom: 28,
    }}>
      {columns.map(col => (
        <ColumnComponent
          key={col.id}
          column={col}
          onAddCard={onAddCard}
          onDeleteCard={onDeleteCard}
          onRenameColumn={onRenameColumn}
        />
      ))}
    </div>
  )
}
