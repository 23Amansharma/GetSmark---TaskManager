import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)   // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [success, setSuccess] = useState(false)
  const otpRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Step 1: Send reset OTP ────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setInfo('Reset OTP sent! Check your email.')
      setStep(2)
      setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found.')
    } finally { setLoading(false) }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setInfo('New OTP sent!')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.')
    } finally { setLoading(false) }
  }

  // ── OTP input handler ─────────────────────────────────────────────────────
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

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpVal = otp.join('')
    if (otpVal.length < 6) { setError('Enter the complete 6-digit OTP.'); return }
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp: otpVal, purpose: 'reset' })
      setInfo('OTP verified! Now set your new password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.')
    } finally { setLoading(false) }
  }

  // ── Step 3: Reset password ────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(''); setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try again.')
    } finally { setLoading(false) }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ color: '#52c41a', fontSize: 20 }}>Password Reset Successful!</h3>
            <p style={{ color: '#666', fontSize: 14 }}>Redirecting to login in 3 seconds…</p>
            <Link to="/login" style={{ color: '#1890ff', fontWeight: 600 }}>Go to Login →</Link>
          </div>
        </div>
      </div>
    )
  }

  const stepTitles = ['', 'Enter your email', 'Verify OTP', 'Set new password']

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>🔑</div>
          <h2 style={s.title}>Forgot Password</h2>
          <p style={s.subtitle}>{stepTitles[step]}</p>
        </div>

        {/* Step dots */}
        <div style={s.dots}>
          {[1,2,3].map(i => (
            <div key={i} style={{ ...s.dot, background: i === step ? '#1890ff' : i < step ? '#52c41a' : '#e8e8e8', transform: i === step ? 'scale(1.3)' : 'scale(1)' }} />
          ))}
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}
        {info  && <div style={s.infoBox}>✉️ {info}</div>}

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={s.form}>
            <label style={s.label}>Registered Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoFocus
              required
            />
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset OTP →'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={s.form}>
            <p style={s.emailTag}>{email} <button type="button" style={s.changeBtn} onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); setInfo('') }}>Change</button></p>
            <label style={s.label}>6-digit OTP</label>
            <div style={s.otpRow} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  style={{ ...s.otpBox, borderColor: digit ? '#ff4d4f' : '#d9d9d9', boxShadow: digit ? '0 0 0 2px rgba(255,77,79,0.15)' : 'none' }}
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
                ? <span style={s.countdownText}>Resend in {countdown}s</span>
                : <button type="button" style={s.resendBtn} onClick={handleResend} disabled={loading}>🔄 Resend OTP</button>
              }
            </div>
            <button style={{ ...s.btn, background: '#ff4d4f', opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={s.form}>
            <label style={s.label}>New Password</label>
            <div style={s.passWrap}>
              <input
                style={{ ...s.input, paddingRight: 46 }}
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError('') }}
                autoFocus
                required
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Resetting…' : '✅ Reset Password'}
            </button>
          </form>
        )}

        <p style={s.backLink}>
          <Link to="/login" style={{ color: '#888', fontSize: 13 }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg,#fff1f0 0%,#f0f2f5 100%)', padding: '20px' },
  card: { background: '#fff', padding: '36px 40px', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' },
  header: { textAlign: 'center', marginBottom: 20 },
  logo: { fontSize: 36, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: '#ff4d4f', margin: 0 },
  subtitle: { fontSize: 14, color: '#888', margin: '4px 0 0' },
  dots: { display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 },
  dot: { width: 10, height: 10, borderRadius: '50%', transition: 'all 0.3s' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: { padding: '11px 14px', border: '1.5px solid #d9d9d9', borderRadius: 8, fontSize: 14, marginBottom: 6, outline: 'none', boxSizing: 'border-box', width: '100%' },
  btn: { marginTop: 10, padding: '12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  passWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: '40%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17 },
  errorBox: { background: '#fff1f0', border: '1px solid #ffccc7', color: '#cf1322', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  infoBox: { background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  emailTag: { fontSize: 13, color: '#1890ff', fontWeight: 600, marginBottom: 8 },
  changeBtn: { marginLeft: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' },
  otpRow: { display: 'flex', gap: 8, justifyContent: 'center', margin: '10px 0' },
  otpBox: { width: 44, height: 50, textAlign: 'center', fontSize: 22, fontWeight: 700, border: '2px solid #d9d9d9', borderRadius: 8, outline: 'none', transition: 'all 0.2s' },
  resendRow: { textAlign: 'center', margin: '6px 0' },
  countdownText: { fontSize: 13, color: '#aaa' },
  resendBtn: { background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' },
  backLink: { textAlign: 'center', marginTop: 20 },
}