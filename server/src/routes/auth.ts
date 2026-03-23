import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kanban-secret-key'

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username: string; password: string }
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number; username: string; password_hash: string } | undefined
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ username: user.username })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  const token = req.cookies?.token
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(payload.userId) as { id: number; username: string } | undefined
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return }
    res.json({ username: user.username })
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

export default router
