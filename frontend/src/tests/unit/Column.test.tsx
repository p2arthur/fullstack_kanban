import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Column from '../../components/Column'
import type { Column as ColumnType } from '../../types'

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const column: ColumnType = {
  id: 'col1',
  title: 'Backlog',
  cards: [
    { id: 'c1', title: 'Card One', details: 'Details one' },
    { id: 'c2', title: 'Card Two', details: 'Details two' },
  ],
}

describe('Column', () => {
  it('renders column title', () => {
    render(<Column column={column} onAddCard={vi.fn()} onDeleteCard={vi.fn()} onRenameColumn={vi.fn()} />)
    expect(screen.getByTestId('column-title')).toHaveTextContent('Backlog')
  })

  it('renders all cards', () => {
    render(<Column column={column} onAddCard={vi.fn()} onDeleteCard={vi.fn()} onRenameColumn={vi.fn()} />)
    expect(screen.getAllByTestId('card')).toHaveLength(2)
  })

  it('renders card count badge', () => {
    render(<Column column={column} onAddCard={vi.fn()} onDeleteCard={vi.fn()} onRenameColumn={vi.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows add card form when button clicked', async () => {
    render(<Column column={column} onAddCard={vi.fn()} onDeleteCard={vi.fn()} onRenameColumn={vi.fn()} />)
    await userEvent.click(screen.getByTestId('add-card-button'))
    expect(screen.getByTestId('add-card-form')).toBeInTheDocument()
  })

  it('shows title input when title is clicked', async () => {
    render(<Column column={column} onAddCard={vi.fn()} onDeleteCard={vi.fn()} onRenameColumn={vi.fn()} />)
    await userEvent.click(screen.getByTestId('column-title'))
    expect(screen.getByTestId('column-title-input')).toBeInTheDocument()
  })

  it('calls onRenameColumn when title edited and Enter pressed', async () => {
    const onRenameColumn = vi.fn()
    render(<Column column={column} onAddCard={vi.fn()} onDeleteCard={vi.fn()} onRenameColumn={onRenameColumn} />)
    await userEvent.click(screen.getByTestId('column-title'))
    const input = screen.getByTestId('column-title-input')
    await userEvent.clear(input)
    await userEvent.type(input, 'Sprint 1{Enter}')
    expect(onRenameColumn).toHaveBeenCalledWith('col1', 'Sprint 1')
  })
})
