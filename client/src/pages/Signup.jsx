import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'

// Step indicator
const StepBar = ({ current }) => {
  const steps = ['Email', 'Verify OTP', 'Set Password']
  return (
    <div style={s.stepBar}>
      {steps.map((label, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current
        return (
          <div key={idx} style={s.stepItem}>
            <div style={{
              ...s.stepCircle,
              background: done ? '#22c55e' : active ? '#6366f1' : '#e8e8e8',
              color: done || active ? '#fff' : '#aaa',
              boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
            }}>
              {done ? '✓' : idx}
            </div>
            <span style={{
              ...s.stepLabel,
              color: active ? '#6366f1' : done ? '#22c55e' : '#aaa',
              fontWeight: active ? 700 : 400,
            }}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ ...s.stepLine, background: done ? '#22c55e' : '#e8e8e8' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Signup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef([])
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Step 1: Send OTP — backend already checks duplicate email and throws "Email already registered"
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/send-otp', { email })
      setInfo('OTP sent! Check your inbox (and spam folder).')
      setStep(2)
      setCountdown(60)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.'
      // Backend returns "Email already registered. Please login." — show that directly
      setError(msg)
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/send-otp', { email })
      setInfo('New OTP sent!')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length) {
      setOtp([...text.split(''), ...Array(6).fill('')].slice(0, 6))
      otpRefs.current[Math.min(text.length, 5)]?.focus()
    }
    e.preventDefault()
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpVal = otp.join('')
    if (otpVal.length < 6) { setError('Please enter the complete 6-digit OTP.'); return }
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp: otpVal, purpose: 'signup' })
      setInfo('Email verified! Now set your name and password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.')
    } finally { setLoading(false) }
  }

  const handleCompleteSignup = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/complete-signup', { email, name, password })
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
      setError(err.response?.data?.message || 'Signup failed. Try again.')
    } finally { setLoading(false) }
  }

  const pwScore = password.length < 6 ? 0 : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /\d/.test(password) ? 3 : 2
  const pwColors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e']
  const pwLabels = ['Too short', 'Fair', 'Good', 'Strong']

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', cursor: 'pointer' }}
          >
            <img src="/logo.svg" alt="GetSmark" style={{ height: 40, width: 40 }} />
            <h1 style={s.brandName}>GetSmark</h1>
          </div>
          <p style={s.brandTagline}>Move from chaos to clarity</p>
        </div>
        <div style={s.steps}>
          {[
            { n: '01', t: 'Enter Email', d: 'We verify you are real, not a bot' },
            { n: '02', t: 'Verify OTP', d: '6-digit code sent to your inbox' },
            { n: '03', t: 'Set Password', d: 'Create a secure password to start' },
          ].map(({ n, t, d }) => (
            <div key={n} style={s.stepGuide}>
              <div style={s.stepNum}>{n}</div>
              <div>
                <p style={s.stepTitle}>{t}</p>
                <p style={s.stepDesc}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <div style={s.header}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}
            >
              <img src="/logo.svg" alt="GetSmark" style={{ height: 32, width: 32 }} />
              <span style={{ fontWeight: 800, fontSize: 20, color: '#1e1b4b', letterSpacing: '-0.5px' }}>GetSmark</span>
            </div>
            <h2 style={s.title}>Create your account</h2>
            <p style={s.subtitle}>It's free to get started</p>
          </div>

          <StepBar current={step} />

          {error && (
            <div style={s.errorBox}>
              ⚠️ {error}
              {/* If duplicate email, show login link */}
              {error.toLowerCase().includes('already registered') && (
                <span> <Link to="/login" style={{ color: '#dc2626', fontWeight: 700 }}>Login instead →</Link></span>
              )}
            </div>
          )}
          {info && <div style={s.infoBox}>✉️ {info}</div>}

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} style={s.form}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                autoFocus
                required
              />
              <p style={s.hint}>We'll send a 6-digit verification code to this email.</p>
              <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send Verification Code →'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} style={s.form}>
              <label style={s.label}>OTP sent to</label>
              <p style={s.emailTag}>
                {email}
                <button
                  type="button" style={s.changeBtn}
                  onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); setInfo('') }}
                >Change</button>
              </p>

              <div style={s.otpRow} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    style={{
                      ...s.otpBox,
                      borderColor: digit ? '#6366f1' : '#d9d9d9',
                      boxShadow: digit ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                      background: digit ? '#f5f3ff' : 'white',
                    }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div style={s.resendRow}>
                {countdown > 0
                  ? <span style={s.countdownText}>Resend OTP in <strong>{countdown}s</strong></span>
                  : <button type="button" style={s.resendBtn} onClick={handleResend} disabled={loading}>
                      🔄 Resend OTP
                    </button>
                }
              </div>

              <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP →'}
              </button>
            </form>
          )}

          {/* STEP 3: Name + Password */}
          {step === 3 && (
            <form onSubmit={handleCompleteSignup} style={s.form}>
              <label style={s.label}>Full Name</label>
              <input
                style={s.input}
                type="text"
                placeholder="Your full name (e.g. Rahul Sharma)"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                autoFocus
                required
              />

              <label style={{ ...s.label, marginTop: 12 }}>Password</label>
              <div style={s.passWrap}>
                <input
                  style={{ ...s.input, paddingRight: 44 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  required
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              {password.length > 0 && (
                <div style={s.strengthWrap}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{
                      ...s.strengthBar,
                      background: i <= pwScore ? pwColors[pwScore] : '#e8e8e8',
                    }} />
                  ))}
                  <span style={{ fontSize: 11, color: pwColors[pwScore], fontWeight: 600, marginLeft: 6 }}>
                    {pwLabels[pwScore]}
                  </span>
                </div>
              )}

              <button style={{ ...s.btn, opacity: loading ? 0.75 : 1, marginTop: 20 }} type="submit" disabled={loading}>
                {loading ? 'Creating account…' : '🎉 Create Account'}
              </button>
            </form>
          )}

          <p style={s.switchText}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
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
  left: {
    flex: '0 0 400px', background: 'linear-gradient(160deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '60px 48px', color: 'white',
  },
  brand: { marginBottom: 48 },
  logoBox: { display: 'none' }, // replaced by img tag
  brandName: { fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: 'white' },
  brandTagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: 0 },
  steps: { display: 'flex', flexDirection: 'column', gap: 20 },
  stepGuide: {
    display: 'flex', gap: 14, alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.07)', borderRadius: 10,
    padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)',
  },
  stepNum: {
    fontSize: 11, fontWeight: 700, color: '#a5b4fc',
    background: 'rgba(99,102,241,0.2)', borderRadius: 6,
    padding: '2px 6px', letterSpacing: '0.5px', flexShrink: 0, height: 'fit-content',
  },
  stepTitle: { margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: 'white' },
  stepDesc: { margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  right: {
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white', padding: '40px 40px', borderRadius: 20,
    width: '100%', maxWidth: 440,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
  },
  header: { textAlign: 'center', marginBottom: 24 },
  cardLogo: { display: 'none' }, // replaced by img + text combo
  title: { fontSize: 22, fontWeight: 700, color: '#1e1b4b', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: 0 },
  stepBar: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginBottom: 24, gap: 0 },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepCircle: {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, zIndex: 1, transition: 'all 0.3s',
  },
  stepLabel: { fontSize: 11, marginTop: 4, textAlign: 'center', transition: 'color 0.3s' },
  stepLine: { position: 'absolute', top: 15, left: '60%', width: '80%', height: 2, transition: 'background 0.3s' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, marginBottom: 6, outline: 'none', boxSizing: 'border-box',
    width: '100%', transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
  },
  hint: { fontSize: 12, color: '#94a3b8', marginBottom: 16 },
  btn: {
    padding: '13px', background: 'linear-gradient(135deg,#1e1b4b,#4338ca)',
    color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
    fontWeight: 600, cursor: 'pointer', marginTop: 6, fontFamily: 'inherit',
  },
  otpRow: { display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' },
  otpBox: {
    width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
    border: '2px solid #e2e8f0', borderRadius: 10, outline: 'none', transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  emailTag: { fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 6 },
  changeBtn: { marginLeft: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' },
  resendRow: { textAlign: 'center', margin: '8px 0 4px' },
  countdownText: { fontSize: 13, color: '#94a3b8' },
  resendBtn: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' },
  passWrap: { position: 'relative', marginBottom: 6 },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17 },
  strengthWrap: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 },
  strengthBar: { flex: 1, height: 5, borderRadius: 3, transition: 'background 0.3s' },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14,
  },
  infoBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
    padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14,
  },
  switchText: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 },
  link: { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
}