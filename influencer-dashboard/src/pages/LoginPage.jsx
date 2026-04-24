import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import api from '../api'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'influencer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async () => {
    setError(''); setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const { data } = await api.post(endpoint, form)
      login(data.token, data.user)
      navigate(data.user.role === 'admin' ? '/admin' : '/influencer')
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f1117' }}>
      <div style={{ width: 400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48, height:48, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:12 }}>⚡</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#e2e8f0' }}>InfluenceTrack</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:4 }}>Affiliate Sales & Payment Platform</p>
        </div>

        <div className="card">
          <div style={{ display:'flex', marginBottom:20, background:'#0f1117', borderRadius:8, padding:4 }}>
            {['Login','Register'].map(t => (
              <button key={t} onClick={() => setIsRegister(t==='Register')}
                style={{ flex:1, padding:'8px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: (t==='Register')==isRegister ? '#6366f1' : 'transparent', color: (t==='Register')==isRegister ? 'white' : '#64748b', transition:'all 0.2s' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {isRegister && <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />}
            <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            {isRegister && (
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                <option value="influencer">Influencer</option>
                <option value="admin">Admin (Brand)</option>
              </select>
            )}
          </div>

          {error && <p style={{ color:'#f87171', fontSize:12, marginTop:10 }}>{error}</p>}

          <button className="btn btn-primary" onClick={handle} disabled={loading}
            style={{ width:'100%', marginTop:16, justifyContent:'center', padding:'11px' }}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <div style={{ marginTop:16, padding:12, background:'#0f1117', borderRadius:8, fontSize:12, color:'#64748b' }}>
            <p style={{ marginBottom:4 }}>Demo credentials:</p>
            <p>Admin → <span style={{color:'#a5b4fc'}}>admin@brand.com</span> / <span style={{color:'#a5b4fc'}}>password</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}