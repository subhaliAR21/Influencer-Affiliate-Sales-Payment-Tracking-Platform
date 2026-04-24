import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '../AuthContext'
import api from '../api'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6']

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{icon}</div>
      <div>
        <p style={{ color:'#64748b', fontSize:12, marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:22, fontWeight:700, color:'#e2e8f0' }}>{value}</p>
        {sub && <p style={{ color:'#64748b', fontSize:11, marginTop:2 }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [data, setData] = useState(null)
  const [payments, setPayments] = useState([])
  const [ai, setAi] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data))
    api.get('/payments').then(r => setPayments(r.data))
  }, [])

  const loadAI = async () => {
    setAiLoading(true)
    setAi(null) 
    try {
      const r = await api.get('/ai/insights')
      // Agar backend se proper insights mil rahi hain
      setAi(r.data)
    } catch (err) { 
      setAi({ error: 'AI Insights currently unavailable. Please verify GEMINI_API_KEY in backend .env' }) 
    }
    setAiLoading(false)
  }

  const updatePayment = async (id, status) => {
    await api.put(`/payments/${id}/status`, { status })
    const r = await api.get('/payments')
    setPayments(r.data)
  }

  const generatePayments = async () => {
    await api.post('/payments/generate')
    const r = await api.get('/payments')
    setPayments(r.data)
  }

  const tabs = ['overview','influencers','payments','ai']

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117' }}>
      {/* Navbar */}
      <div style={{ background:'#1a1d2e', borderBottom:'1px solid #2d3148', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>⚡</span>
          <span style={{ fontWeight:700, fontSize:16 }}>InfluenceTrack</span>
          <span style={{ background:'#6366f133', color:'#a5b4fc', fontSize:11, padding:'2px 8px', borderRadius:20, marginLeft:4 }}>Admin</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'#64748b', fontSize:13 }}>{user?.email}</span>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ padding:'24px', maxWidth:1200, margin:'0 auto' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'#1a1d2e', padding:4, borderRadius:10, width:'fit-content', border:'1px solid #2d3148' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'7px 18px', borderRadius:7, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background:tab===t?'#6366f1':'transparent', color:tab===t?'white':'#64748b', transition:'all 0.2s', textTransform:'capitalize' }}>
              {t === 'ai' ? '🤖 AI Insights' : t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && data && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
              <StatCard label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} icon="💰" color="#6366f1" sub={`${data.totalSales} sales`} />
              <StatCard label="Commission Paid" value={`₹${data.totalCommission.toLocaleString()}`} icon="💸" color="#10b981" sub="10% rate" />
              <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} icon="📈" color="#f59e0b" sub="clicks → sales" />
              <StatCard label="Pending Payments" value={data.pendingPayments} icon="⏳" color="#ef4444" sub="need approval" />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
              <div className="card">
                <h3 style={{ marginBottom:16, fontSize:14, fontWeight:600 }}>Revenue over time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                    <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3148', borderRadius:8 }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ fill:'#6366f1', r:3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{ marginBottom:16, fontSize:14, fontWeight:600 }}>Revenue split</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.revenueSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {data.revenueSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3148', borderRadius:8 }} formatter={v => [`₹${v.toLocaleString()}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Influencers Tab */}
        {tab === 'influencers' && data && (
          <>
            <div className="card" style={{ marginBottom:16 }}>
              <h3 style={{ marginBottom:16, fontSize:14, fontWeight:600 }}>Top influencers by revenue</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.topInfluencers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                  <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:12 }} />
                  <YAxis tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3148', borderRadius:8 }} formatter={v=>[`₹${v.toLocaleString()}`,'Revenue']} />
                  <Bar dataKey="revenue" radius={[6,6,0,0]}>
                    {data.topInfluencers.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <table>
                <thead><tr><th>Influencer</th><th>Code</th><th>Revenue</th><th>Sales</th><th>Clicks</th><th>Commission</th></tr></thead>
                <tbody>
                  {data.topInfluencers.map((inf,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:500 }}>{inf.name}</td>
                      <td><code style={{ background:'#2d3148', padding:'2px 8px', borderRadius:4, fontSize:12 }}>{inf.code}</code></td>
                      <td style={{ color:'#10b981' }}>₹{inf.revenue.toLocaleString()}</td>
                      <td>{inf.sales}</td>
                      <td>{inf.clicks}</td>
                      <td style={{ color:'#f59e0b' }}>₹{inf.commission.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:600 }}>Payment management</h3>
              <button className="btn btn-primary" onClick={generatePayments}>Generate pending payments</button>
            </div>
            <table>
              <thead><tr><th>Influencer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight:500 }}>{p.influencerName}</td>
                    <td style={{ color:'#10b981' }}>₹{p.amount.toLocaleString()}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td style={{ color:'#64748b' }}>{p.date}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {p.status === 'pending' && <button className="btn btn-warning" onClick={()=>updatePayment(p.id,'approved')}>Approve</button>}
                        {p.status === 'approved' && <button className="btn btn-success" onClick={()=>updatePayment(p.id,'paid')}>Mark Paid</button>}
                        {p.status === 'paid' && <span style={{ color:'#34d399', fontSize:12 }}>✓ Completed</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AI Tab (UPGRADED) */}
        {tab === 'ai' && (
          <div>
            {!ai && (
              <div style={{ textAlign:'center', padding:60 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
                <h3 style={{ marginBottom:8 }}>AI-Powered Growth Insights</h3>
                <p style={{ color:'#64748b', marginBottom:24, fontSize:14 }}>Analyze performance & predict future revenue using Gemini AI</p>
                <button className="btn btn-primary" onClick={loadAI} disabled={aiLoading} style={{ padding:'12px 32px' }}>
                  {aiLoading ? '⏳ AI is crunching numbers...' : '✨ Generate Smart Insights'}
                </button>
              </div>
            )}
            
            {ai && !ai.error && (
              <div style={{ display:'grid', gap:16 }}>
                <div className="card">
                  <h3 style={{ marginBottom:16, fontSize:14, fontWeight:600 }}>📊 Smart Performance Insights</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {ai.insights?.map((ins, i) => (
                      <div key={i} style={{ background:'#0f1117', borderRadius:8, padding:14, borderLeft:'3px solid #6366f1' }}>
                        <p style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.6 }}>{ins}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {ai.prediction && (
                  <div className="card" style={{ borderLeft:'4px solid #10b981' }}>
                    <h3 style={{ marginBottom:12, fontSize:14, fontWeight:600 }}>🔮 Next 7-Day Revenue Forecast</h3>
                    <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                      <div>
                        <p style={{ fontSize:36, fontWeight:800, color:'#10b981' }}>₹{ai.prediction.next7days?.toLocaleString()}</p>
                        <p style={{ color:'#64748b', fontSize:13 }}>Estimated Earnings</p>
                      </div>
                      <div style={{ flex:1, background:'#0f1117', borderRadius:8, padding:14 }}>
                        <p style={{ color:'#94a3b8', fontSize:13, lineHeight:1.6 }}>{ai.prediction.reason}</p>
                        <span style={{ 
                          background: ai.prediction.confidence === 'high' ? '#064e3b' : '#451a03', 
                          color: ai.prediction.confidence === 'high' ? '#34d399' : '#fbbf24', 
                          padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, marginTop:8, display:'inline-block' 
                        }}>
                          {ai.prediction.confidence?.toUpperCase()} CONFIDENCE
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <button className="btn btn-ghost" onClick={() => { setAi(null) }} style={{ width:'fit-content' }}>↺ Refresh Analysis</button>
              </div>
            )}

            {ai?.error && (
              <div className="card" style={{ border:'1px solid #ef444433', background:'#ef44440a' }}>
                <p style={{ color:'#f87171', fontSize:14 }}>⚠️ <strong>System Note:</strong> {ai.error}</p>
                <button className="btn btn-primary" onClick={loadAI} style={{ marginTop:16 }}>Try Again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}