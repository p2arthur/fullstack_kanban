import type { Column, Card } from './types'

export function addCard(columns: Column[], columnId: string, card: Card): Column[] {
  return columns.map(col =>
    col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
  )
}

export function deleteCard(columns: Column[], columnId: string, cardId: string): Column[] {
  return columns.map(col =>
    col.id === columnId
      ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
      : col
  )
}

export function moveCard(
  columns: Column[],
  fromColumnId: string,
  toColumnId: string,
  cardId: string,
  toIndex: number
): Column[] {
  const fromCol = columns.find(c => c.id === fromColumnId)
  if (!fromCol) return columns

  const card = fromCol.cards.find(c => c.id === cardId)
  if (!card) return columns

  return columns.map(col => {
    if (col.id === fromColumnId && col.id === toColumnId) {
      const cards = col.cards.filter(c => c.id !== cardId)
      cards.splice(toIndex, 0, card)
      return { ...col, cards }
    }
    if (col.id === fromColumnId) {
      return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
    }
    if (col.id === toColumnId) {
      const cards = [...col.cards]
      cards.splice(toIndex, 0, card)
      return { ...col, cards }
    }
    return col
  })
}

export function renameColumn(columns: Column[], columnId: string, title: string): Column[] {
  return columns.map(col => col.id === columnId ? { ...col, title } : col)
}
