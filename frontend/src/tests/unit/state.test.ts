import { describe, it, expect } from 'vitest'
import { addCard, deleteCard, moveCard, renameColumn } from '../../state'
import type { Column } from '../../types'

const makeColumns = (): Column[] => [
  { id: 'col1', title: 'Backlog', cards: [{ id: 'c1', title: 'Task 1', details: 'Details 1' }] },
  { id: 'col2', title: 'To Do', cards: [{ id: 'c2', title: 'Task 2', details: 'Details 2' }] },
  { id: 'col3', title: 'Done', cards: [] },
]

describe('addCard', () => {
  it('adds a card to the correct column', () => {
    const cols = makeColumns()
    const newCard = { id: 'c99', title: 'New', details: '' }
    const result = addCard(cols, 'col1', newCard)
    expect(result[0].cards).toHaveLength(2)
    expect(result[0].cards[1]).toEqual(newCard)
  })

  it('does not affect other columns', () => {
    const cols = makeColumns()
    const result = addCard(cols, 'col1', { id: 'c99', title: 'X', details: '' })
    expect(result[1].cards).toHaveLength(1)
    expect(result[2].cards).toHaveLength(0)
  })
})

describe('deleteCard', () => {
  it('removes the card from the column', () => {
    const cols = makeColumns()
    const result = deleteCard(cols, 'col1', 'c1')
    expect(result[0].cards).toHaveLength(0)
  })

  it('does not affect other columns', () => {
    const cols = makeColumns()
    const result = deleteCard(cols, 'col1', 'c1')
    expect(result[1].cards).toHaveLength(1)
  })

  it('returns same columns if card not found', () => {
    const cols = makeColumns()
    const result = deleteCard(cols, 'col1', 'nonexistent')
    expect(result[0].cards).toHaveLength(1)
  })
})

describe('moveCard', () => {
  it('moves a card from one column to another', () => {
    const cols = makeColumns()
    const result = moveCard(cols, 'col1', 'col2', 'c1', 0)
    expect(result[0].cards).toHaveLength(0)
    expect(result[1].cards).toHaveLength(2)
    expect(result[1].cards[0].id).toBe('c1')
  })

  it('moves card to end of destination column', () => {
    const cols = makeColumns()
    const result = moveCard(cols, 'col1', 'col2', 'c1', 1)
    expect(result[1].cards[1].id).toBe('c1')
  })

  it('moves to empty column', () => {
    const cols = makeColumns()
    const result = moveCard(cols, 'col1', 'col3', 'c1', 0)
    expect(result[2].cards).toHaveLength(1)
    expect(result[0].cards).toHaveLength(0)
  })

  it('returns same state for nonexistent card', () => {
    const cols = makeColumns()
    const result = moveCard(cols, 'col1', 'col2', 'nonexistent', 0)
    expect(result).toEqual(cols)
  })
})

describe('renameColumn', () => {
  it('renames the specified column', () => {
    const cols = makeColumns()
    const result = renameColumn(cols, 'col1', 'Sprint 1')
    expect(result[0].title).toBe('Sprint 1')
  })

  it('does not affect other columns', () => {
    const cols = makeColumns()
    const result = renameColumn(cols, 'col1', 'Sprint 1')
    expect(result[1].title).toBe('To Do')
    expect(result[2].title).toBe('Done')
  })
})
