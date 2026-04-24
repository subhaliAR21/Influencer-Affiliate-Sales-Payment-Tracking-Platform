import express from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { v4 as uuid } from 'uuid'
import db from '../db.js'

const router = express.Router()

router.get('/', authenticate, adminOnly, async (req, res) => {
  await db.read()
  const payments = db.data.payments.map(p => {
    const inf = db.data.influencers.find(i => i.id === p.influencerId)
    return { ...p, influencerName: inf?.name || 'Unknown' }
  })
  res.json(payments)
})

router.put('/:id/status', authenticate, adminOnly, async (req, res) => {
  await db.read()
  const payment = db.data.payments.find(p => p.id === req.params.id)
  if (!payment) return res.status(404).json({ error: 'Not found' })
  payment.status = req.body.status
  await db.write()
  res.json(payment)
})

router.post('/generate', authenticate, adminOnly, async (req, res) => {
  await db.read()
  const { sales, influencers, payments } = db.data
  const newPayments = []
  influencers.forEach(inf => {
    const unpaidSales = sales.filter(s => s.influencerId === inf.id)
    const alreadyPaid = payments.filter(p => p.influencerId === inf.id && p.status === 'paid').reduce((a, p) => a + p.amount, 0)
    const totalEarned = Math.round(unpaidSales.reduce((a, s) => a + s.amount, 0) * 0.10)
    const due = totalEarned - alreadyPaid
    if (due > 0) {
      const existing = payments.find(p => p.influencerId === inf.id && p.status === 'pending')
      if (!existing) {
        const p = { id: uuid(), influencerId: inf.id, amount: due, status: 'pending', date: new Date().toISOString().split('T')[0] }
        db.data.payments.push(p)
        newPayments.push(p)
      }
    }
  })
  await db.write()
  res.json({ generated: newPayments.length, payments: newPayments })
})

export default router