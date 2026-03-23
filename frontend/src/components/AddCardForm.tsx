import { useState } from 'react'

interface Props {
  columnId: string
  onAdd: (columnId: string, title: string, details: string) => void
  onCancel: () => void
}

export default function AddCardForm({ columnId, onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(columnId, title.trim(), details.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="add-card-form"
      style={{
        background: '#ffffff',
        borderRadius: 10,
        padding: '12px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 2px rgba(32,157,215,0.25)',
        marginBottom: 2,
      }}
    >
      <input
        autoFocus
        type="text"
        placeholder="Card title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        data-testid="card-title-input"
        style={{
          width: '100%',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: '#0f172a',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          letterSpacing: '-0.01em',
        }}
      />
      <div style={{ height: 1, background: '#f1f5f9', margin: '10px 0' }} />
      <textarea
        placeholder="Details (optional)"
        value={details}
        onChange={e => setDetails(e.target.value)}
        rows={2}
        data-testid="card-details-input"
        style={{
          width: '100%',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
          color: '#64748b',
          border: 'none',
          outline: 'none',
          resize: 'none',
          background: 'transparent',
          lineHeight: 1.55,
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          type="submit"
          disabled={!title.trim()}
          data-testid="add-card-submit"
          style={{
            padding: '6px 14px',
            fontSize: 12,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            background: title.trim() ? '#753991' : '#e2e8f0',
            color: title.trim() ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: 6,
            cursor: title.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Add card
        </button>
        <button
          type="button"
          onClick={onCancel}
          data-testid="add-card-cancel"
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            background: 'transparent',
            color: '#94a3b8',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
