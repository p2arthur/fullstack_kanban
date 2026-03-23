import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import db from '../db.js'
import type { Request } from 'express'

const router = Router()
type AuthReq = Request & { userId: number }

interface BoardUpdate {
  create?: { title: string; description?: string; column_id: number }[]
  update?: { id: number; title?: string; description?: string; column_id?: number }[]
  delete?: number[]
}

interface AIResponse {
  message: string
  board_update?: BoardUpdate
}

router.post('/chat', requireAuth, async (req, res) => {
  const authReq = req as AuthReq
  const { board_id, message } = req.body as { board_id: number; message: string }

  if (!board_id || !message) {
    res.status(400).json({ error: 'board_id and message required' })
    return
  }

  const board = db.prepare('SELECT * FROM boards WHERE id = ? AND user_id = ?').get(board_id, authReq.userId)
  if (!board) { res.status(404).json({ error: 'Board not found' }); return }

  // Get board state
  const columns = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position').all(board_id) as { id: number; title: string }[]
  const cards = db.prepare(`
    SELECT c.* FROM cards c
    JOIN columns col ON c.column_id = col.id
    WHERE col.board_id = ? ORDER BY c.position
  `).all(board_id) as { id: number; column_id: number; title: string; description: string }[]

  const boardState = {
    columns: columns.map(col => ({
      id: col.id,
      title: col.title,
      cards: cards.filter(c => c.column_id === col.id).map(c => ({ id: c.id, title: c.title, description: c.description })),
    })),
  }

  // Get chat history
  const history = db.prepare('SELECT role, content FROM chat_history WHERE board_id = ? ORDER BY id DESC LIMIT 20').all(board_id) as { role: string; content: string }[]
  history.reverse()

  const systemPrompt = `You are a Kanban board assistant. Help the user manage their project board.

Current board state:
${JSON.stringify(boardState, null, 2)}

You can create, update, and delete cards. When performing actions, return a JSON response with this structure:
{
  "message": "Human-readable response describing what you did or answering the question",
  "board_update": {
    "create": [{ "title": "...", "description": "...", "column_id": <number> }],
    "update": [{ "id": <number>, "title": "...", "description": "...", "column_id": <number> }],
    "delete": [<id>, ...]
  }
}

board_update is optional. Only include the fields that are needed. column_id must be one of: ${columns.map(c => `${c.id} (${c.title})`).join(', ')}.

IMPORTANT: Always respond with valid JSON only. No markdown, no code blocks.`

  try {
    const apiKey = process.env.OPEN_ROUTER_API_KEY
    if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY not set')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
          { role: 'user', content: message },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenRouter error: ${errText}`)
    }

    const data = await response.json() as { choices: { message: { content: string } }[] }
    const rawContent = data.choices[0]?.message?.content || ''

    let aiResponse: AIResponse
    // Extract JSON from the response (may be wrapped in markdown code blocks)
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || rawContent.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr.trim()) as Partial<AIResponse>
        aiResponse = {
          message: parsed.message || rawContent,
          board_update: parsed.board_update,
        }
      } catch {
        aiResponse = { message: rawContent }
      }
    } else {
      aiResponse = { message: rawContent }
    }

    // Apply board mutations
    if (aiResponse.board_update) {
      const update = aiResponse.board_update

      if (update.create) {
        for (const item of update.create) {
          const maxPos = (db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM cards WHERE column_id = ?').get(item.column_id) as { m: number }).m
          db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(item.column_id, item.title, item.description || '', maxPos + 1)
        }
      }
      if (update.update) {
        for (const item of update.update) {
          const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(item.id) as { title: string; description: string; column_id: number; position: number } | undefined
          if (card) {
            db.prepare('UPDATE cards SET title = ?, description = ?, column_id = ? WHERE id = ?').run(
              item.title ?? card.title,
              item.description ?? card.description,
              item.column_id ?? card.column_id,
              item.id
            )
          }
        }
      }
      if (update.delete) {
        for (const id of update.delete) {
          db.prepare('DELETE FROM cards WHERE id = ?').run(id)
        }
      }
    }

    // Save to history
    db.prepare('INSERT INTO chat_history (board_id, role, content) VALUES (?, ?, ?)').run(board_id, 'user', message)
    db.prepare('INSERT INTO chat_history (board_id, role, content) VALUES (?, ?, ?)').run(board_id, 'assistant', aiResponse.message)

    res.json(aiResponse)
  } catch (err) {
    console.error('AI error:', err)
    res.status(500).json({ error: 'AI service error' })
  }
})

export default router
