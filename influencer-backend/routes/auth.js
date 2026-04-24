import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import db from '../db.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'influencer' } = req.body
  await db.read()
  if (db.data.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email already exists' })

  const hashed = await bcrypt.hash(password, 10)
  const userId = uuid()
  const user = { id: userId, name, email, password: hashed, role }
  db.data.users.push(user)

  if (role === 'influencer') {
    const code = name.toUpperCase().replace(/\s+/g, '').slice(0, 8) + Math.floor(Math.random() * 100)
    db.data.influencers.push({ id: uuid(), userId, name, code, email })
  }

  await db.write()
  const token = jwt.sign({ id: userId, role, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: userId, name, email, role } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  await db.read()
  const user = db.data.users.find(u => u.email === email)
  if (!user) return res.status(400).json({ error: 'User not found' })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ error: 'Wrong password' })
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

export default router