import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

// OTP rate limiting: max 4 sends, then 5 minute lockout
const OTP_MAX_TRIES = 4
const OTP_LOCKOUT_SECONDS = 5 * 60 // 5 minutes

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Rate limiting state
  const [resendCountdown, setResendCountdown] = useState(0)    // per-send cooldown (60s)
  const [otpSendCount, setOtpSendCount] = useState(0)          // how many times OTP sent
  const [lockoutSeconds, setLockoutSeconds] = useState(0)      // 5 min lockout after 4 tries

  const otpRefs = useRef([])
  const navigate = useNavigate()

  // Per-send 60s countdown
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // 5 min lockout countdown
  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const t = setTimeout(() => setLockoutSeconds(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [lockoutSeconds])

  const isLocked = lockoutSeconds > 0
  const formatLockout = (s) => {
    const m = Math.floor(s / 60), sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  // Step 1: Send reset OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (isLocked) return
    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      const newCount = otpSendCount + 1
      setOtpSendCount(newCount)
      setInfo(`Reset OTP sent! Check your email. (${newCount}/${OTP_MAX_TRIES} attempts used)`)
      setStep(2)
      setResendCountdown(60)

      if (newCount >= OTP_MAX_TRIES) {
        setLockoutSeconds(OTP_LOCKOUT_SECONDS)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found. Please check and try again.')
    } finally { setLoading(false) }
  }

  // Resend OTP
  const handleResend = async () => {
    if (resendCountdown > 0 || isLocked) return

    if (otpSendCount >= OTP_MAX_TRIES) {
      setLockoutSeconds(OTP_LOCKOUT_SECONDS)
      setError(`Too many OTP requests. Please wait ${formatLockout(OTP_LOCKOUT_SECONDS)} before trying again.`)
      return
    }

    setError(''); setInfo(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      const newCount = otpSendCount + 1
      setOtpSendCount(newCount)
      setInfo(`New OTP sent! (${newCount}/${OTP_MAX_TRIES} attempts used)`)
      setOtp(['', '', '', '', '', ''])
      setResendCountdown(60)
      otpRefs.current[0]?.focus()

      if (newCount >= OTP_MAX_TRIES) {
        setLockoutSeconds(OTP_LOCKOUT_SECONDS)
        setError('Maximum OTP attempts reached. You can try again after 5 minutes.')
      }
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

  // Step 2: Verify OTP
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
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally { setLoading(false) }
  }

  // Step 3: Reset password
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
      setError(err.response?.data?.message || 'Reset failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ color: '#22c55e', fontSize: 20, margin: '0 0 8px' }}>Password Reset Successful!</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Redirecting to login in 3 seconds…</p>
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 700 }}>Go to Login →</Link>
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
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}
          >
            <img src="/logo.svg" alt="GetSmark" style={{ height: 32, width: 32 }} />
            <span style={{ fontWeight: 800, fontSize: 20, color: '#1e1b4b', letterSpacing: '-0.5px' }}>GetSmark</span>
          </div>
          <h2 style={s.title}>Forgot Password</h2>
          <p style={s.subtitle}>{stepTitles[step]}</p>
        </div>

        {/* Step dots */}
        <div style={s.dots}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              ...s.dot,
              background: i === step ? '#6366f1' : i < step ? '#22c55e' : '#e8e8e8',
              transform: i === step ? 'scale(1.4)' : 'scale(1)',
              boxShadow: i === step ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
            }} />
          ))}
        </div>

        {/* Lockout warning */}
        {isLocked && (
          <div style={s.lockoutBox}>
            🔒 Too many OTP requests. Please wait <strong>{formatLockout(lockoutSeconds)}</strong> before trying again.
          </div>
        )}

        {!isLocked && error && <div style={s.errorBox}>⚠️ {error}</div>}
        {!isLocked && info && <div style={s.infoBox}>✉️ {info}</div>}

        {/* OTP attempts indicator — shown when on step 2 */}
        {step === 2 && otpSendCount > 0 && !isLocked && (
          <div style={s.attemptsBar}>
            {[...Array(OTP_MAX_TRIES)].map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i < otpSendCount ? '#f59e0b' : '#e8e8e8',
                transition: 'background 0.3s',
              }} />
            ))}
            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {OTP_MAX_TRIES - otpSendCount} left
            </span>
          </div>
        )}

        {/* STEP 1: Email */}
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
              disabled={isLocked}
            />
            <button
              style={{ ...s.btn, opacity: (loading || isLocked) ? 0.6 : 1 }}
              type="submit"
              disabled={loading || isLocked}
            >
              {loading ? 'Sending…' : 'Send Reset OTP →'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={s.form}>
            <p style={s.emailTag}>
              {email}
              <button
                type="button" style={s.changeBtn}
                onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); setInfo('') }}
              >Change</button>
            </p>
            <label style={s.label}>6-digit OTP</label>
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
              {isLocked ? (
                <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                  🔒 Locked. Try again in {formatLockout(lockoutSeconds)}
                </span>
              ) : resendCountdown > 0 ? (
                <span style={s.countdownText}>
                  Resend in <strong>{resendCountdown}s</strong>
                  {otpSendCount > 1 && ` · ${OTP_MAX_TRIES - otpSendCount} resends remaining`}
                </span>
              ) : otpSendCount >= OTP_MAX_TRIES ? (
                <span style={{ fontSize: 13, color: '#ef4444' }}>No more resends allowed</span>
              ) : (
                <button
                  type="button" style={s.resendBtn}
                  onClick={handleResend} disabled={loading}
                >
                  🔄 Resend OTP ({OTP_MAX_TRIES - otpSendCount} remaining)
                </button>
              )}
            </div>
            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              type="submit" disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>
          </form>
        )}

        {/* STEP 3: New Password */}
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
                autoFocus required
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              type="submit" disabled={loading}
            >
              {loading ? 'Resetting…' : '✅ Reset Password'}
            </button>
          </form>
        )}

        <p style={s.backLink}>
          <Link to="/login" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: 'linear-gradient(135deg,#f0f9ff 0%,#f8fafc 50%,#fdf4ff 100%)',
    padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'white', padding: '40px 40px', borderRadius: 20,
    width: '100%', maxWidth: 420,
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '1px solid #e2e8f0',
  },
  header: { textAlign: 'center', marginBottom: 20 },
  cardLogo: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, margin: '0 auto 12px', boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1e1b4b', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: 0 },
  dots: { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 },
  dot: { width: 10, height: 10, borderRadius: '50%', transition: 'all 0.3s' },
  attemptsBar: {
    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14,
    padding: '8px 12px', background: '#fffbeb', borderRadius: 8,
    border: '1px solid #fde68a',
  },
  lockoutBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 14,
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, marginBottom: 6, outline: 'none', boxSizing: 'border-box',
    width: '100%', fontFamily: 'inherit',
  },
  btn: {
    marginTop: 10, padding: '13px',
    background: 'linear-gradient(135deg,#1e1b4b,#4338ca)',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  passWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '40%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 17,
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14,
  },
  infoBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
    padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14,
  },
  emailTag: { fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 8 },
  changeBtn: { marginLeft: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' },
  otpRow: { display: 'flex', gap: 8, justifyContent: 'center', margin: '10px 0' },
  otpBox: {
    width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
    border: '2px solid #e2e8f0', borderRadius: 10, outline: 'none', transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  resendRow: { textAlign: 'center', margin: '8px 0 6px' },
  countdownText: { fontSize: 13, color: '#94a3b8' },
  resendBtn: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' },
  backLink: { textAlign: 'center', marginTop: 20 },
}