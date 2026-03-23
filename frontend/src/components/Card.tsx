import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card as CardType } from '../types'

interface Props {
  card: CardType
  columnId: string
  onDelete: (columnId: string, cardId: string) => void
}

export default function Card({ card, columnId, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { columnId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid="card"
      className="kanban-card"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#0f172a',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
          }}>
            {card.title}
          </p>
          {card.details && (
            <p style={{
              fontSize: 12,
              color: '#64748b',
              marginTop: 5,
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {card.details}
            </p>
          )}
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={() => onDelete(columnId, card.id)}
          aria-label="Delete card"
          data-testid="delete-card"
          className="kanban-card-delete"
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#cbd5e1',
            transition: 'all 0.12s',
            opacity: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.color = '#ef4444'
            e.currentTarget.style.background = '#fef2f2'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0'
            e.currentTarget.style.color = '#cbd5e1'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
