import express from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import db from '../db.js'

const router = express.Router()

router.get('/dashboard', authenticate, adminOnly, async (req, res) => {
  await db.read()
  const { sales, influencers, payments, clicks } = db.data

  // Sales over time (group by date)
  const salesByDate = {}
  sales.forEach(s => {
    salesByDate[s.date] = (salesByDate[s.date] || 0) + s.amount
  })
  const salesOverTime = Object.entries(salesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }))

  // Top influencers
  const infMap = {}
  sales.forEach(s => {
    if (!infMap[s.influencerId]) infMap[s.influencerId] = { revenue: 0, sales: 0 }
    infMap[s.influencerId].revenue += s.amount
    infMap[s.influencerId].sales += 1
  })
  const topInfluencers = influencers.map(inf => ({
    name: inf.name,
    code: inf.code,
    revenue: infMap[inf.id]?.revenue || 0,
    sales: infMap[inf.id]?.sales || 0,
    commission: Math.round((infMap[inf.id]?.revenue || 0) * 0.10),
    clicks: clicks.filter(c => c.influencerId === inf.id).reduce((a, c) => a + c.count, 0)
  })).sort((a, b) => b.revenue - a.revenue)

  // Revenue split (pie)
  const revenueSplit = topInfluencers.map(i => ({ name: i.name, value: i.revenue }))

  // Summary stats
  const totalRevenue = sales.reduce((a, s) => a + s.amount, 0)
  const totalCommission = Math.round(totalRevenue * 0.10)
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const totalClicks = clicks.reduce((a, c) => a + c.count, 0)
  const conversionRate = totalClicks > 0 ? ((sales.length / totalClicks) * 100).toFixed(1) : 0

  res.json({ salesOverTime, topInfluencers, revenueSplit, totalRevenue, totalCommission, pendingPayments, conversionRate, totalSales: sales.length })
})

export default router