import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Card from '../../components/Card'

// dnd-kit requires a DndContext; mock useSortable for unit tests
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const card = { id: 'c1', title: 'Test Card', details: 'Some details here' }

describe('Card', () => {
  it('renders the title', () => {
    render(<Card card={card} columnId="col1" onDelete={vi.fn()} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('renders the details', () => {
    render(<Card card={card} columnId="col1" onDelete={vi.fn()} />)
    expect(screen.getByText('Some details here')).toBeInTheDocument()
  })

  it('calls onDelete with correct args when delete button clicked', async () => {
    const onDelete = vi.fn()
    render(<Card card={card} columnId="col1" onDelete={onDelete} />)
    await userEvent.click(screen.getByLabelText('Delete card'))
    expect(onDelete).toHaveBeenCalledWith('col1', 'c1')
  })

  it('does not show details when empty', () => {
    render(<Card card={{ ...card, details: '' }} columnId="col1" onDelete={vi.fn()} />)
    expect(screen.queryByText('Some details here')).not.toBeInTheDocument()
  })
})
