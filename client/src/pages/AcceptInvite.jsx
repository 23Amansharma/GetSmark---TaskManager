import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')   // loading | ready | error | expired
  const [inviteData, setInviteData] = useState(null)
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) { setStatus('error'); return }

    api.get(`/auth/invite-info?token=${token}`)
      .then(res => {
        setInviteData(res.data)
        setStatus('ready')
      })
      .catch(err => {
        const msg = err.response?.data?.message || ''
        if (msg.toLowerCase().includes('expired')) setStatus('expired')
        else setStatus('error')
      })
  }, [token])

  // ✅ FIX 2: Save token to localStorage, then redirect to signup/login
  const handleSignup = () => {
    localStorage.setItem('inviteToken', token)
    navigate('/signup')
  }

  const handleLogin = () => {
    localStorage.setItem('inviteToken', token)
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <h2 style={styles.logo}>⚡ 5Mart W0rk</h2>
        </div>

        {status === 'loading' && (
          <p style={styles.msg}>⏳ Checking invitation...</p>
        )}

        {status === 'error' && (
          <div style={styles.errorBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
            <h3 style={{ color: '#cf1322', margin: '0 0 8px' }}>Invalid Link</h3>
            <p style={{ color: '#666', margin: 0 }}>This invitation link is invalid or has already been used.</p>
            <button style={styles.btnOutline} onClick={() => navigate('/login')} >Go to Login</button>
          </div>
        )}

        {status === 'expired' && (
          <div style={styles.errorBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
            <h3 style={{ color: '#d46b08', margin: '0 0 8px' }}>Invitation Expired</h3>
            <p style={{ color: '#666', margin: 0 }}>This invitation has expired (7 days). Ask the project admin to re-invite you.</p>
            <button style={styles.btnOutline} onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div style={styles.inviteBox}>
              <p style={styles.sub}>
                <strong>{inviteData.invitedBy}</strong> ne aapko invite kiya hai:
              </p>
              <div style={styles.projectBox}>📁 {inviteData.projectName}</div>
              <p style={styles.emailNote}>
                Invite bheja gaya: <strong>{inviteData.email}</strong>
              </p>
            </div>

            {/* ✅ Pending status indicator */}
            <div style={styles.pendingBadge}>
              🕐 Status: <strong>Pending</strong> — Accept karne ke liye login/signup karein
            </div>

            <p style={styles.sub2}>Create an account or login to accept this invitation.</p>

            <button style={styles.btn} onClick={handleSignup}>
              Create Account &amp; Accept →
            </button>
            <button style={styles.btnOutline} onClick={handleLogin}>
              Login &amp; Accept →
            </button>

            <p style={styles.hint}>
              ⚠️ Usi email se login/signup karo jis pe invite aaya hai: <strong>{inviteData.email}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg,#e6f7ff,#f0f2f5)', padding: 20 },
  card: { background: 'white', padding: '40px', borderRadius: '16px', width: '420px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  logoWrap: { marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' },
  logo: { color: '#667eea', margin: 0, fontSize: '22px' },
  inviteBox: { marginBottom: 16 },
  projectBox: { background: '#f0f4ff', border: '1px solid #d0d9ff', padding: '14px', borderRadius: '8px', fontSize: '17px', fontWeight: '600', margin: '10px 0', color: '#333' },
  pendingBadge: { background: '#fff7e6', border: '1px solid #ffd591', color: '#ad6800', padding: '8px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  sub: { color: '#555', fontSize: '15px', margin: '0 0 6px' },
  sub2: { color: '#999', fontSize: '13px', margin: '0 0 18px' },
  emailNote: { color: '#888', fontSize: 13, margin: '6px 0 0' },
  btn: { display: 'block', width: '100%', padding: '13px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginBottom: '10px' },
  btnOutline: { display: 'block', width: '100%', padding: '13px', background: 'transparent', color: '#667eea', border: '2px solid #667eea', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginBottom: 12 },
  hint: { color: '#999', fontSize: 12, marginTop: 8, lineHeight: 1.5 },
  errorBox: { padding: '20px 10px' },
  msg: { color: '#666' }
}
