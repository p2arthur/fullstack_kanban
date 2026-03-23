import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import db from '../db.js'
import type { Request } from 'express'

const router = Router()
type AuthReq = Request & { userId: number }

router.get('/:boardId', requireAuth, (req, res) => {
  const authReq = req as AuthReq
  const boardId = parseInt(req.params.boardId, 10)
  const board = db.prepare('SELECT * FROM boards WHERE id = ? AND user_id = ?').get(boardId, authReq.userId) as { id: number; title: string } | undefined
  if (!board) { res.status(404).json({ error: 'Board not found' }); return }

  const columns = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position').all(boardId) as { id: number; title: string; position: number }[]
  const cards = db.prepare(`
    SELECT c.* FROM cards c
    JOIN columns col ON c.column_id = col.id
    WHERE col.board_id = ?
    ORDER BY c.position
  `).all(boardId) as { id: number; column_id: number; title: string; description: string; position: number }[]

  const result = {
    id: board.id,
    title: board.title,
    columns: columns.map(col => ({
      id: col.id,
      title: col.title,
      cards: cards.filter(c => c.column_id === col.id),
    })),
  }
  res.json(result)
})

router.get('/', requireAuth, (req, res) => {
  const authReq = req as AuthReq
  const board = db.prepare('SELECT * FROM boards WHERE user_id = ? LIMIT 1').get(authReq.userId) as { id: number } | undefined
  if (!board) { res.status(404).json({ error: 'No board found' }); return }
  res.json({ boardId: board.id })
})

router.patch('/:boardId/columns/:columnId', requireAuth, (req, res) => {
  const authReq = req as AuthReq
  const boardId = parseInt(req.params.boardId, 10)
  const columnId = parseInt(req.params.columnId, 10)
  const board = db.prepare('SELECT id FROM boards WHERE id = ? AND user_id = ?').get(boardId, authReq.userId)
  if (!board) { res.status(404).json({ error: 'Board not found' }); return }
  const { title } = req.body as { title: string }
  db.prepare('UPDATE columns SET title = ? WHERE id = ? AND board_id = ?').run(title, columnId, boardId)
  res.json({ ok: true })
})

export default router
