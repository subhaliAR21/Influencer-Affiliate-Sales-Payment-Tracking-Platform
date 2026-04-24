import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../AuthContext'
import api from '../api'

export default function InfluencerDashboard() {
  const { user, logout } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/influencer/me').then(r => setData(r.data))
  }, [])

  if (!data) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#64748b' }}>Loading...</div>

  const salesByDate = {}
  data.sales.forEach(s => { salesByDate[s.date] = (salesByDate[s.date]||0) + s.amount })
  const chartData = Object.entries(salesByDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,revenue])=>({date,revenue}))

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117' }}>
      <div style={{ background:'#1a1d2e', borderBottom:'1px solid #2d3148', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>⚡</span>
          <span style={{ fontWeight:700, fontSize:16 }}>InfluenceTrack</span>
          <span style={{ background:'#10b98133', color:'#34d399', fontSize:11, padding:'2px 8px', borderRadius:20, marginLeft:4 }}>Influencer</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'#64748b', fontSize:13 }}>{user?.name}</span>
          <button onClick={logout} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #2d3148', background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:13 }}>Logout</button>
        </div>
      </div>

      <div style={{ padding:24, maxWidth:1000, margin:'0 auto' }}>
        {/* Affiliate link */}
        <div className="card" style={{ marginBottom:20, borderColor:'#6366f133', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'#64748b', fontSize:12, marginBottom:6 }}>Your affiliate link</p>
            <code style={{ color:'#a5b4fc', fontSize:14 }}>{data.affiliateLink}</code>
          </div>
          <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(data.affiliateLink)}>Copy link</button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
          {[
            { label:'Total Revenue', value:`₹${data.totalRevenue.toLocaleString()}`, icon:'💰' },
            { label:'Commission Earned', value:`₹${data.commission.toLocaleString()}`, icon:'💸' },
            { label:'Total Sales', value:data.totalSales, icon:'🛒' },
            { label:'Conversion Rate', value:`${data.conversionRate}%`, icon:'📈' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <p style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>{s.value}</p>
              <p style={{ color:'#64748b', fontSize:12 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <h3 style={{ marginBottom:16, fontSize:14, fontWeight:600 }}>My sales over time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={d=>d.slice(5)} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3148', borderRadius:8 }} formatter={v=>[`₹${v.toLocaleString()}`,'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill:'#10b981', r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Recent Sales */}
          <div className="card">
            <h3 style={{ marginBottom:14, fontSize:14, fontWeight:600 }}>Recent sales</h3>
            <table>
              <thead><tr><th>Product</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {data.sales.slice(0,6).map(s => (
                  <tr key={s.id}>
                    <td>{s.product}</td>
                    <td style={{ color:'#10b981' }}>₹{s.amount.toLocaleString()}</td>
                    <td style={{ color:'#64748b' }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payments */}
          <div className="card">
            <h3 style={{ marginBottom:14, fontSize:14, fontWeight:600 }}>Payment history</h3>
            {data.payments.length === 0 ? (
              <p style={{ color:'#64748b', fontSize:13 }}>No payments yet</p>
            ) : (
              <table>
                <thead><tr><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {data.payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ color:'#10b981' }}>₹{p.amount.toLocaleString()}</td>
                      <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                      <td style={{ color:'#64748b' }}>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}