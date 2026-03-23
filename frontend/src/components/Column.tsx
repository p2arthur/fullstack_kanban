import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Column as ColumnType } from '../types'
import CardComponent from './Card'
import AddCardForm from './AddCardForm'

interface Props {
  column: ColumnType
  onAddCard: (columnId: string, title: string, details: string) => void
  onDeleteCard: (columnId: string, cardId: string) => void
  onRenameColumn: (columnId: string, title: string) => void
}

export default function Column({ column, onAddCard, onDeleteCard, onRenameColumn }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column.title)

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  function commitRename() {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed)
    } else {
      setTitleValue(column.title)
    }
    setEditingTitle(false)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') {
      setTitleValue(column.title)
      setEditingTitle(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 280,
      flexShrink: 0,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Column header */}
      <div style={{
        padding: '16px 16px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {editingTitle ? (
            <input
              autoFocus
              type="text"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleTitleKeyDown}
              data-testid="column-title-input"
              style={{
                flex: 1,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                color: '#ffffff',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(32,157,215,0.5)',
                borderRadius: 6,
                padding: '4px 8px',
                outline: 'none',
                letterSpacing: '0.05em',
              }}
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              data-testid="column-title"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ecad0a')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >
              {column.title}
            </button>
          )}
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 99,
            padding: '2px 8px',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}>
            {column.cards.length}
          </span>
        </div>
        {/* Accent line */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #ecad0a, transparent)',
          borderRadius: 1,
          marginTop: 12,
        }} />
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        data-testid="column-cards"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 10px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transition: 'background 0.15s',
          background: isOver ? 'rgba(32,157,215,0.06)' : 'transparent',
          minHeight: 60,
        }}
      >
        <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <CardComponent key={card.id} card={card} columnId={column.id} onDelete={onDeleteCard} />
          ))}
        </SortableContext>

        {showForm ? (
          <AddCardForm
            columnId={column.id}
            onAdd={(colId, title, details) => {
              onAddCard(colId, title, details)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : null}
      </div>

      {/* Add card button — always at bottom */}
      {!showForm && (
        <div style={{ padding: '8px 10px 10px' }}>
          <button
            onClick={() => setShowForm(true)}
            data-testid="add-card-button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 10px',
              background: 'transparent',
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(32,157,215,0.4)'
              e.currentTarget.style.color = '#209dd7'
              e.currentTarget.style.background = 'rgba(32,157,215,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add card
          </button>
        </div>
      )}
    </div>
  )
}
