import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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
      login(res.data.token, res.data.user)

      const inviteToken = localStorage.getItem('inviteToken')
      if (inviteToken) {
        localStorage.removeItem('inviteToken')
        try {
          await api.post('/auth/accept-invite', { token: inviteToken })
        } catch (invErr) {
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
      <div style={s.left}>
        <div style={s.brand}>
          {/* Logo — click to go home */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', cursor: 'pointer' }}
          >
            <img src="/logo.svg" alt="GetSmark" style={{ height: 40, width: 40 }} />
            <h1 style={s.brandName}>GetSmark</h1>
          </div>
          <p style={s.brandTagline}>The smarter way to manage team work</p>
        </div>
        <div style={s.features}>
          {[
            { icon: '🗂️', text: 'Kanban boards with drag & drop' },
            { icon: '👥', text: '5-tier role-based access control' },
            { icon: '🔔', text: 'Real-time notifications' },
            { icon: '📊', text: 'Analytics & activity logs' },
          ].map((f, i) => (
            <div key={i} style={s.featureItem}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={s.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.header}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}
            >
              <img src="/logo.svg" alt="GetSmark" style={{ height: 32, width: 32 }} />
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: '#1e1b4b', letterSpacing: '-0.5px' }}>GetSmark</span>
            </div>
            <h2 style={s.title}>Welcome back</h2>
            <p style={s.subtitle}>Sign in to your GetSmark account</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.fieldGroup}>
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
            </div>

            <div style={s.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={s.label}>Password</label>
                <Link to="/forgot-password" style={s.forgotLink}>Forgot password?</Link>
              </div>
              <div style={s.passWrap}>
                <input
                  style={{ ...s.input, paddingRight: 46 }}
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
            </div>

            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={s.spinner} /> Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={s.divider}><span style={s.dividerText}>or</span></div>

          <p style={s.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" style={s.link}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex',
    background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  /* Left panel — visible only on larger screens */
  left: {
    flex: '0 0 420px', background: 'linear-gradient(160deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '60px 48px', color: 'white',
  },
  brand: { marginBottom: 48 },
  logoBox: { display: 'none' }, // replaced by img tag
  cardLogo: { display: 'none' }, // replaced by img tag
  brandName: { fontSize: 32, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' },
  brandTagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: 0 },
  features: { display: 'flex', flexDirection: 'column', gap: 16 },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(255,255,255,0.07)', borderRadius: 10,
    padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)',
  },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  /* Right panel */
  right: {
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white', padding: '40px 40px', borderRadius: 20,
    width: '100%', maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e1b4b', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, outline: 'none', boxSizing: 'border-box', width: '100%',
    transition: 'border-color 0.2s, box-shadow 0.2s', color: '#1e293b',
    fontFamily: 'inherit',
  },
  passWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1,
  },
  forgotLink: { fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 },
  btn: {
    padding: '13px', background: 'linear-gradient(135deg,#1e1b4b,#4338ca)',
    color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
    fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s',
    marginTop: 4, fontFamily: 'inherit',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '10px 14px', borderRadius: 10, fontSize: 13,
    marginBottom: 4, display: 'flex', gap: 8, alignItems: 'flex-start',
  },
  divider: {
    textAlign: 'center', margin: '20px 0 16px',
    borderTop: '1px solid #f1f5f9', paddingTop: 20, position: 'relative',
  },
  dividerText: {
    fontSize: 12, color: '#94a3b8',
    background: 'white', padding: '0 10px',
    position: 'relative', top: -10,
  },
  switchText: { textAlign: 'center', fontSize: 13, color: '#64748b' },
  link: { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
  spinner: {
    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.6s linear infinite',
  },
}