import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Card as CardType, Column as ColumnType } from './types'
import { api, type ApiBoard } from './api'
import Board from './components/Board'
import LoginPage from './components/LoginPage'
import AISidebar from './components/AISidebar'
import './index.css'

function apiToColumns(board: ApiBoard): ColumnType[] {
  return board.columns.map(col => ({
    id: String(col.id),
    title: col.title,
    cards: col.cards.map(c => ({
      id: String(c.id),
      title: c.title,
      details: c.description,
    })),
  }))
}

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [boardId, setBoardId] = useState<number | null>(null)
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [showAI, setShowAI] = useState(false)

  // Check auth on mount
  useEffect(() => {
    api.auth.me()
      .then(u => setUsername(u.username))
      .catch(() => {})
      .finally(() => setAuthChecked(true))
  }, [])

  // Load board when authenticated
  useEffect(() => {
    if (!username) return
    api.boards.getDefault()
      .then(({ boardId: id }) => {
        setBoardId(id)
        return api.boards.get(id)
      })
      .then(board => setColumns(apiToColumns(board)))
      .catch(console.error)
  }, [username])

  const refreshBoard = useCallback(() => {
    if (!boardId) return
    api.boards.get(boardId)
      .then(board => setColumns(apiToColumns(board)))
      .catch(console.error)
  }, [boardId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  async function handleAddCard(columnId: string, title: string, details: string) {
    const colId = parseInt(columnId, 10)
    try {
      const card = await api.cards.create(colId, title, details)
      setColumns(cols => cols.map(col =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, { id: String(card.id), title: card.title, details: card.description }] }
          : col
      ))
    } catch (err) {
      console.error('Failed to create card:', err)
    }
  }

  async function handleDeleteCard(columnId: string, cardId: string) {
    try {
      await api.cards.delete(parseInt(cardId, 10))
      setColumns(cols => cols.map(col =>
        col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
      ))
    } catch (err) {
      console.error('Failed to delete card:', err)
    }
  }

  async function handleRenameColumn(columnId: string, title: string) {
    if (!boardId) return
    setColumns(cols => cols.map(col => col.id === columnId ? { ...col, title } : col))
    try {
      await api.boards.renameColumn(boardId, parseInt(columnId, 10), title)
    } catch (err) {
      console.error('Failed to rename column:', err)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string
    for (const col of columns) {
      const card = col.cards.find(c => c.id === cardId)
      if (card) { setActiveCard(card); break }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const cardId = active.id as string
    const fromColumnId = (active.data.current as { columnId: string }).columnId
    const overId = over.id as string

    let toColumnId = fromColumnId
    let toIndex = 0

    const toColumn = columns.find(c => c.id === overId)
    if (toColumn) {
      if (fromColumnId === toColumn.id) return
      toColumnId = toColumn.id
      toIndex = toColumn.cards.length
    } else {
      for (const col of columns) {
        const idx = col.cards.findIndex(c => c.id === overId)
        if (idx !== -1) { toColumnId = col.id; toIndex = idx; break }
      }
    }

    let newColumns: ColumnType[]
    if (fromColumnId === toColumnId) {
      newColumns = columns.map(col => {
        if (col.id !== fromColumnId) return col
        const oldIndex = col.cards.findIndex(c => c.id === cardId)
        return { ...col, cards: arrayMove(col.cards, oldIndex, toIndex) }
      })
    } else {
      const fromCol = columns.find(c => c.id === fromColumnId)!
      const card = fromCol.cards.find(c => c.id === cardId)!
      newColumns = columns.map(col => {
        if (col.id === fromColumnId) return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        if (col.id === toColumnId) {
          const cards = [...col.cards]
          cards.splice(toIndex, 0, card)
          return { ...col, cards }
        }
        return col
      })
    }

    setColumns(newColumns)

    // Persist: update card's column and position
    const toColAfter = newColumns.find(c => c.id === toColumnId)!
    const newPos = toColAfter.cards.findIndex(c => c.id === cardId)
    try {
      await api.cards.update(parseInt(cardId, 10), {
        column_id: parseInt(toColumnId, 10),
        position: newPos,
      })
    } catch (err) {
      console.error('Failed to persist card move:', err)
      refreshBoard()
    }
  }

  async function handleLogout() {
    await api.auth.logout()
    setUsername(null)
    setBoardId(null)
    setColumns([])
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #032147 0%, #0a1628 100%)' }} />
    )
  }

  if (!username) {
    return <LoginPage onLogin={setUsername} />
  }

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0)

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <header style={{
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(3,33,71,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '0 32px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 4, height: 20, background: '#ecad0a', borderRadius: 2 }} />
              <div style={{ width: 4, height: 14, background: '#209dd7', borderRadius: 2, alignSelf: 'flex-end' }} />
              <div style={{ width: 4, height: 24, background: '#753991', borderRadius: 2 }} />
            </div>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 17,
              color: '#ffffff',
              letterSpacing: '-0.3px',
            }}>
              Project Board
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              {totalCards} cards across {columns.length} columns
            </span>
            <button
              onClick={() => setShowAI(v => !v)}
              style={{
                padding: '6px 12px',
                borderRadius: 7,
                border: '1px solid',
                borderColor: showAI ? 'rgba(32,157,215,0.5)' : 'rgba(255,255,255,0.12)',
                background: showAI ? 'rgba(32,157,215,0.12)' : 'transparent',
                color: showAI ? '#209dd7' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
              AI
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #209dd7, #753991)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'DM Sans, sans-serif',
              }}>
                {username.slice(0, 2).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.35)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  padding: 0,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflow: 'hidden', padding: '28px 32px 0' }}>
            <Board
              columns={columns}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onRenameColumn={handleRenameColumn}
            />
          </main>
          {showAI && boardId && (
            <AISidebar boardId={boardId} onBoardUpdate={refreshBoard} />
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '14px 16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(32,157,215,0.3)',
            width: 280,
            transform: 'rotate(2deg)',
            opacity: 0.96,
            borderLeft: '3px solid #ecad0a',
          }}>
            <p style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', lineHeight: 1.4 }}>{activeCard.title}</p>
            {activeCard.details && (
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>{activeCard.details}</p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default App
