import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './routes/auth.js'
import boardsRouter from './routes/boards.js'
import cardsRouter from './routes/cards.js'
import aiRouter from './routes/ai.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 4000
const isProd = process.env.NODE_ENV === 'production'

if (!isProd) {
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }))
}

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => { res.json({ status: 'ok' }) })
app.use('/api/auth', authRouter)
app.use('/api/boards', boardsRouter)
app.use('/api/cards', cardsRouter)
app.use('/api/ai', aiRouter)

if (isProd) {
  const frontendDist = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
