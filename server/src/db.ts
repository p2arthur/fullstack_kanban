import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/kanban.db')

// ensure data dir exists
import fs from 'fs'
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL DEFAULT 'My Board'
  );

  CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL REFERENCES boards(id),
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    column_id INTEGER NOT NULL REFERENCES columns(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL REFERENCES boards(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Seed default user + board if not present
const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('user') as { id: number } | undefined
if (!existingUser) {
  const hash = bcrypt.hashSync('password', 10)
  const userId = (db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('user', hash)).lastInsertRowid as number
  const boardId = (db.prepare('INSERT INTO boards (user_id, title) VALUES (?, ?)').run(userId, 'My Board')).lastInsertRowid as number

  const columns = [
    { title: 'Backlog', position: 0 },
    { title: 'To Do', position: 1 },
    { title: 'In Progress', position: 2 },
    { title: 'In Review', position: 3 },
    { title: 'Done', position: 4 },
  ]
  for (const col of columns) {
    const colId = (db.prepare('INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)').run(boardId, col.title, col.position)).lastInsertRowid as number
    if (col.title === 'Backlog') {
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'User authentication', 'Implement login, signup, and JWT token management.', 0)
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Database schema design', 'Design tables for users, projects, and tasks.', 1)
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'API rate limiting', 'Add rate limiting middleware to prevent abuse.', 2)
    }
    if (col.title === 'To Do') {
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Dashboard layout', 'Create the main dashboard with sidebar navigation.', 0)
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Notification system', 'Email and in-app notifications for task updates.', 1)
    }
    if (col.title === 'In Progress') {
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Kanban board UI', 'Build the interactive kanban board with drag and drop.', 0)
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'REST API endpoints', 'Create CRUD endpoints for all resources.', 1)
    }
    if (col.title === 'In Review') {
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Mobile responsiveness', 'Ensure all pages work well on small screens.', 0)
    }
    if (col.title === 'Done') {
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Project setup', 'Initialize repo, CI/CD pipeline, and dev environment.', 0)
      db.prepare('INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(colId, 'Wireframes', 'Complete all wireframes and get stakeholder approval.', 1)
    }
  }
}

export default db
