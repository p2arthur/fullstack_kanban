import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import db from '../db.js'
import type { Request } from 'express'

const router = Router()
type AuthReq = Request & { userId: number }

router.post('/', requireAuth, (req, res) => {
  const authReq = req as AuthReq
  const { column_id, title, description } = req.body as { column_id: number; title: string; description?: string }
  if (!column_id || !title) { res.status(400).json({ error: 'column_id and title required' }); return }

  // verify ownership
  const col = db.prepare(`
    SELECT col.id FROM columns col
    JOIN boards b ON col.board_id = b.id
    WHERE col.id = ? AND b.user_id = ?
  `).get(column_id, authReq.userId)
  if (!col) { res.status(403).json({ error: 'Forbidden' }); return }

  const maxPos = (db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM cards WHERE column_id = ?').get(column_id) as { m: number }).m
  const result = db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(column_id, title, description || '', maxPos + 1)
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid) as { id: number; column_id: number; title: string; description: string; position: number }
  res.status(201).json(card)
})

router.patch('/:id', requireAuth, (req, res) => {
  const authReq = req as AuthReq
  const cardId = parseInt(req.params.id, 10)
  const { title, description, column_id, position } = req.body as { title?: string; description?: string; column_id?: number; position?: number }

  const card = db.prepare(`
    SELECT cards.* FROM cards
    JOIN columns col ON cards.column_id = col.id
    JOIN boards b ON col.board_id = b.id
    WHERE cards.id = ? AND b.user_id = ?
  `).get(cardId, authReq.userId) as { id: number; column_id: number; title: string; description: string; position: number } | undefined
  if (!card) { res.status(404).json({ error: 'Card not found' }); return }

  const newTitle = title !== undefined ? title : card.title
  const newDesc = description !== undefined ? description : card.description
  const newColId = column_id !== undefined ? column_id : card.column_id
  const newPos = position !== undefined ? position : card.position

  db.prepare('UPDATE cards SET title = ?, description = ?, column_id = ?, position = ? WHERE id = ?').run(newTitle, newDesc, newColId, newPos, cardId)
  const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId)
  res.json(updated)
})

router.delete('/:id', requireAuth, (req, res) => {
  const authReq = req as AuthReq
  const cardId = parseInt(req.params.id, 10)

  const card = db.prepare(`
    SELECT cards.id FROM cards
    JOIN columns col ON cards.column_id = col.id
    JOIN boards b ON col.board_id = b.id
    WHERE cards.id = ? AND b.user_id = ?
  `).get(cardId, authReq.userId)
  if (!card) { res.status(404).json({ error: 'Card not found' }); return }

  db.prepare('DELETE FROM cards WHERE id = ?').run(cardId)
  res.json({ ok: true })
})

export default router
