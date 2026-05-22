import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.token)

      // ✅ FIX 2: After login, check if invite token is stored
      const inviteToken = localStorage.getItem('inviteToken')
      if (inviteToken) {
        localStorage.removeItem('inviteToken')
        try {
          // Accept the invitation via backend
          await api.post('/auth/accept-invite', { token: inviteToken })
        } catch (invErr) {
          // Invite already processed or expired — silently ignore
          console.warn('Invite accept failed:', invErr.message)
        }
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>✅</div>
          <h2 style={s.title}>Task Manager</h2>
          <p style={s.subtitle}>Welcome back! Please sign in.</p>
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Email */}
          <label style={s.label}>Email Address</label>
          <input
            style={s.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            autoFocus
            required
          />

          {/* Password */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <label style={s.label}>Password</label>
            <Link to="/forgot-password" style={s.forgotLink}>Forgot password?</Link>
          </div>
          <div style={s.passWrap}>
            <input
              style={{ ...s.input, marginBottom: 0, paddingRight: 46 }}
              type={showPass ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              required
            />
            <button
              type="button"
              style={s.eyeBtn}
              onClick={() => setShowPass(v => !v)}
              tabIndex={-1}
              title={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Login →'}
          </button>
        </form>

        <div style={s.divider}><span>or</span></div>

        <p style={s.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" style={s.link}>Create account</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg,#e6f7ff 0%,#f0f2f5 100%)', padding: '20px' },
  card: { background: '#fff', padding: '36px 40px', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: { fontSize: 36, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: '#1890ff', margin: 0 },
  subtitle: { fontSize: 14, color: '#888', margin: '4px 0 0' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: { padding: '11px 14px', border: '1.5px solid #d9d9d9', borderRadius: 8, fontSize: 14, marginBottom: 0, outline: 'none', boxSizing: 'border-box', width: '100%', transition: 'border 0.2s' },
  passWrap: { position: 'relative', marginTop: 6 },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 },
  forgotLink: { fontSize: 12, color: '#1890ff', textDecoration: 'none', fontWeight: 500 },
  btn: { marginTop: 22, padding: '12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' },
  errorBox: { background: '#fff1f0', border: '1px solid #ffccc7', color: '#cf1322', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 18 },
  divider: { textAlign: 'center', margin: '20px 0 16px', color: '#ccc', fontSize: 12, borderTop: '1px solid #f0f0f0', paddingTop: 16 },
  switchText: { textAlign: 'center', fontSize: 13, color: '#888' },
  link: { color: '#1890ff', fontWeight: 600, textDecoration: 'none' },
}
