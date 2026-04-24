import express from 'express'
import { authenticate } from '../middleware/auth.js'
import db from '../db.js'

const router = express.Router()

// Get my stats (influencer)
router.get('/me', authenticate, async (req, res) => {
  await db.read()
  const inf = db.data.influencers.find(i => i.userId === req.user.id)
  if (!inf) return res.status(404).json({ error: 'Influencer not found' })

  const mySales = db.data.sales.filter(s => s.influencerId === inf.id)
  const myPayments = db.data.payments.filter(p => p.influencerId === inf.id)
  const myClicks = db.data.clicks.filter(c => c.influencerId === inf.id)
  const totalRevenue = mySales.reduce((a, s) => a + s.amount, 0)
  const totalClicks = myClicks.reduce((a, c) => a + c.count, 0)

  res.json({
    influencer: inf,
    affiliateLink: `https://abhishek.store/product?ref=${inf.code}`,
    totalRevenue,
    totalSales: mySales.length,
    totalClicks,
    commission: Math.round(totalRevenue * 0.10),
    conversionRate: totalClicks > 0 ? ((mySales.length / totalClicks) * 100).toFixed(1) : 0,
    sales: mySales.sort((a, b) => b.date.localeCompare(a.date)),
    payments: myPayments
  })
})

// Track affiliate click
router.get('/track/:code', async (req, res) => {
  await db.read()
  const inf = db.data.influencers.find(i => i.code === req.params.code)
  if (!inf) return res.status(404).json({ error: 'Invalid code' })
  const today = new Date().toISOString().split('T')[0]
  const existing = db.data.clicks.find(c => c.influencerId === inf.id && c.date === today)
  if (existing) existing.count++
  else db.data.clicks.push({ id: Date.now().toString(), influencerId: inf.id, date: today, count: 1 })
  await db.write()
  res.json({ message: 'Click tracked', code: inf.code })
})

export default router