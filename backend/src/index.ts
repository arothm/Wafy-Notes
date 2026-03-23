import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createAuthMiddleware } from '@wafy/utils/server'
import { notesRouter } from './routes'

const app = express()
const PORT = process.env.PORT || 3003
const SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-secret'

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5175', credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(createAuthMiddleware(SECRET))
app.use('/', notesRouter)
app.get('/health', (_req, res) => { res.json({ status: 'ok', service: 'notes' }) })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wafy_notes'

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log('`Notes backend running on port ${PORT}`'))
}).catch((err) => { console.error('MongoDB connection error:', err); process.exit(1) })
