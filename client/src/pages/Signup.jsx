import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

// ── Step indicator ──────────────────────────────────────────────────────────
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
              background: done ? '#52c41a' : active ? '#1890ff' : '#e8e8e8',
              color: done || active ? '#fff' : '#aaa',
            }}>
              {done ? '✓' : idx}
            </div>
            <span style={{ ...s.stepLabel, color: active ? '#1890ff' : done ? '#52c41a' : '#aaa', fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ ...s.stepLine, background: done ? '#52c41a' : '#e8e8e8' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
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

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/send-otp', { email })
      setInfo('OTP sent! Check your inbox (and spam folder).')
      setStep(2)
      setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.')
    } finally { setLoading(false) }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
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

  // ── OTP box input handler ─────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length) {
      setOtp([...text.split(''), ...Array(6).fill('')].slice(0, 6))
      otpRefs.current[Math.min(text.length, 5)]?.focus()
    }
    e.preventDefault()
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
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

  // ── Step 3: Complete signup ───────────────────────────────────────────────
  const handleCompleteSignup = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/complete-signup', { email, name, password })
      login(res.data.token)

      // ✅ FIX 2: After signup, accept pending invite if token was saved
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>✅</div>
          <h2 style={s.title}>Task Manager</h2>
          <p style={s.subtitle}>Create your account</p>
        </div>

        <StepBar current={step} />

        {/* Messages */}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}
        {info  && <div style={s.infoBox}>✉️ {info}</div>}

        {/* ── STEP 1: Email ── */}
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
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send Verification Code →'}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={s.form}>
            <label style={s.label}>Enter OTP sent to</label>
            <p style={s.emailTag}>{email} <button type="button" style={s.changeBtn} onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); setInfo('') }}>Change</button></p>

            <div style={s.otpRow} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  style={{ ...s.otpBox, borderColor: digit ? '#1890ff' : '#d9d9d9', boxShadow: digit ? '0 0 0 2px rgba(24,144,255,0.15)' : 'none' }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKeyDown(e, i)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div style={s.resendRow}>
              {countdown > 0
                ? <span style={s.countdownText}>Resend OTP in {countdown}s</span>
                : <button type="button" style={s.resendBtn} onClick={handleResend} disabled={loading}>
                    🔄 Resend OTP
                  </button>
              }
            </div>

            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>
          </form>
        )}

        {/* ── STEP 3: Name + Password ── */}
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
                style={{ ...s.input, marginBottom: 0, paddingRight: 44 }}
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

            {/* Password strength bar */}
            {password.length > 0 && (
              <div style={s.strengthWrap}>
                {['weak','fair','good','strong'].map((lvl, i) => {
                  const score = password.length < 6 ? 0 : password.length < 8 ? 1 : /[A-Z]/.test(password) && /\d/.test(password) ? 3 : 2
                  const colors = ['#ff4d4f','#faad14','#1890ff','#52c41a']
                  return <div key={lvl} style={{ ...s.strengthBar, background: i <= score ? colors[score] : '#e8e8e8' }} />
                })}
                <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>
                  {password.length < 6 ? 'Too short' : password.length < 8 ? 'Fair' : /[A-Z]/.test(password) && /\d/.test(password) ? 'Strong' : 'Good'}
                </span>
              </div>
            )}

            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1, marginTop: 20 }} type="submit" disabled={loading}>
              {loading ? 'Creating account…' : '🎉 Create Account'}
            </button>
          </form>
        )}

        <p style={s.switchText}>
          Already have an account? <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg,#e6f7ff 0%,#f0f2f5 100%)', padding: '20px' },
  card: { background: '#fff', padding: '36px 40px', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' },
  header: { textAlign: 'center', marginBottom: 24 },
  logo: { fontSize: 36, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: '#1890ff', margin: 0 },
  subtitle: { fontSize: 14, color: '#888', margin: '4px 0 0' },

  // Step bar
  stepBar: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 28, gap: 0 },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepCircle: { width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, zIndex: 1 },
  stepLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  stepLine: { position: 'absolute', top: 15, left: '60%', width: '80%', height: 2 },

  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: { padding: '11px 14px', border: '1.5px solid #d9d9d9', borderRadius: 8, fontSize: 14, marginBottom: 6, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box', width: '100%' },
  hint: { fontSize: 12, color: '#888', marginBottom: 16 },
  btn: { padding: '12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 6, transition: 'background 0.2s' },

  // OTP
  otpRow: { display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' },
  otpBox: { width: 44, height: 50, textAlign: 'center', fontSize: 22, fontWeight: 700, border: '2px solid #d9d9d9', borderRadius: 8, outline: 'none', transition: 'all 0.2s' },
  emailTag: { fontSize: 14, color: '#1890ff', fontWeight: 600, marginBottom: 4 },
  changeBtn: { marginLeft: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' },
  resendRow: { textAlign: 'center', margin: '8px 0 4px' },
  countdownText: { fontSize: 13, color: '#aaa' },
  resendBtn: { background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' },

  // Password
  passWrap: { position: 'relative', marginBottom: 6 },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 },
  strengthWrap: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, transition: 'background 0.3s' },

  // Messages
  errorBox: { background: '#fff1f0', border: '1px solid #ffccc7', color: '#cf1322', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  infoBox: { background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },

  switchText: { textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 },
  link: { color: '#1890ff', fontWeight: 600, textDecoration: 'none' },
}