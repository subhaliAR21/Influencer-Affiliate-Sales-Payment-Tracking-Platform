import express from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import db from '../db.js'
import { GoogleGenerativeAI } from "@google/generative-ai" // Naya import

const router = express.Router()

router.get('/insights', authenticate, adminOnly, async (req, res) => {
  await db.read()
  const { sales, influencers, clicks } = db.data

  // Summary logic (Aapka purana logic ekdum sahi hai)
  const summary = influencers.map(inf => {
    const mySales = sales.filter(s => s.influencerId === inf.id)
    const myClicks = clicks.filter(c => c.influencerId === inf.id).reduce((a, c) => a + c.count, 0)
    const revenue = mySales.reduce((a, s) => a + s.amount, 0)
    const weekendSales = mySales.filter(s => {
      const d = new Date(s.date).getDay(); return d === 0 || d === 6
    }).length
    return { name: inf.name, revenue, sales: mySales.length, clicks: myClicks, weekendSales }
  })

  const totalRevenue = sales.reduce((a, s) => a + s.amount, 0)
  const last7 = sales.filter(s => {
    const diff = (new Date() - new Date(s.date)) / 86400000
    return diff <= 7
  }).reduce((a, s) => a + s.amount, 0)

  const prompt = `You are an AI analyst for an influencer marketing platform. Analyze this data and give 4 short, specific insights and a 7-day revenue prediction. Be direct and use ₹ for currency.

Influencer data: ${JSON.stringify(summary)}
Total platform revenue: ₹${totalRevenue}
Last 7 days revenue: ₹${last7}

Respond ONLY in this JSON format (no markdown):
{
  "insights": ["insight1", "insight2", "insight3", "insight4"],
  "prediction": { "next7days": <number>, "confidence": "<low|medium|high>", "reason": "<one sentence>" }
}`

  try {
    // Gemini Integration
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast & Free

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    
    res.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
})

export default router