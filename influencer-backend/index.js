import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import analyticsRoutes from './routes/analytics.js'
import influencerRoutes from './routes/influencers.js'
import paymentRoutes from './routes/payments.js'
import aiRoutes from './routes/ai.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/influencer', influencerRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/ai', aiRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`))