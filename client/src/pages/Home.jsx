import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutGrid, Users, BarChart2, Zap, Shield, Star,
  ArrowRight, ChevronDown, Menu, X, MessageSquare,
  Send, TrendingUp, Clock, Target, CheckCircle, Lock
} from 'lucide-react'

const GFonts = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
)

const C = {
  black: '#0f0f0f', white: '#ffffff', off: '#f7f6f3',
  accent: '#2563eb', muted: '#6b7280', border: '#e5e7eb',
  r: '12px', rLg: '20px',
}
const sLabel = { fontFamily: 'Syne,sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: '0.65rem' }
const sH2 = { fontFamily: 'Syne,sans-serif', fontSize: 'clamp(1.8rem,3.5vw,2.7rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', color: C.black, marginBottom: '1rem' }
const sP = { fontFamily: 'DM Sans,sans-serif', fontSize: '1rem', color: C.muted, lineHeight: 1.8 }

/* ════════════════════════════════
   NAVBAR
════════════════════════════════ */
function Navbar({ nav }) {
  const [scrolled, setScrolled] = useState(false)
  const [mob, setMob] = useState(false)
  const [featD, setFeatD] = useState(false)
  const [supD, setSupD] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMob(false) }

  const lk = { fontFamily: 'Syne,sans-serif', fontSize: '0.85rem', fontWeight: 500, color: C.black, background: 'none', border: 'none', cursor: 'pointer', padding: '0.45rem 0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.18s', whiteSpace: 'nowrap' }
  const drop = { position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: C.r, padding: '0.35rem', minWidth: 178, boxShadow: '0 12px 36px rgba(0,0,0,0.09)', zIndex: 200 }
  const dl = { display: 'block', padding: '0.45rem 0.85rem', fontSize: '0.85rem', color: C.black, fontFamily: 'DM Sans,sans-serif', borderRadius: 8, cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left', transition: 'background 0.15s' }
  const btnG = { fontFamily: 'Syne,sans-serif', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 1.1rem', borderRadius: 40, border: `1.5px solid ${C.border}`, background: 'transparent', color: C.black, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }
  const btnP = { ...btnG, background: C.black, color: C.white, border: 'none' }

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? 'rgba(255,255,255,0.94)' : 'transparent', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.3s ease' }}>
      <GFonts />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', height: 64, gap: '1.5rem' }}>
        {/* Logo — replace with: <img src="/logo.png" style={{height:32}} alt="GetSmark" /> */}
        <a href="#" onClick={e => { e.preventDefault(); go('hero') }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: C.black, letterSpacing: '-0.03em', flexShrink: 0 }}>
          <img src="/logo.svg" alt="GetSmark" style={{ height: 32, width: 32 }} />
          GetSmark
        </a>

        <div className="gs-dlinks" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <div style={{ position: 'relative' }} onMouseEnter={() => setFeatD(true)} onMouseLeave={() => setFeatD(false)}>
            <button style={lk} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              Features <ChevronDown size={12} style={{ transform: featD ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {featD && <div style={drop}>
              {['Task Management', 'Project & Teams', 'Live Dashboard', 'Secure Auth'].map(t => (
                <button key={t} style={dl} onClick={() => go('features')} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>{t}</button>
              ))}
            </div>}
          </div>
          <button style={lk} onClick={() => go('why')} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>Why GetSmark</button>
          <button style={lk} onClick={() => go('how')} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>How It Works</button>
          <div style={{ position: 'relative' }} onMouseEnter={() => setSupD(true)} onMouseLeave={() => setSupD(false)}>
            <button style={lk} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              Support <ChevronDown size={12} style={{ transform: supD ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {supD && <div style={drop}>
              {['About Us', 'Contact Us', 'Blog', 'FAQ'].map(t => (
                <button key={t} style={dl} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>{t}</button>
              ))}
            </div>}
          </div>
        </div>

        <div className="gs-dright" style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem' }}>
          <button style={btnG} onClick={() => nav('/login')} onMouseOver={e => e.currentTarget.style.borderColor = C.black} onMouseOut={e => e.currentTarget.style.borderColor = C.border}>Login</button>
          <button style={btnP} onClick={() => nav('/signup')} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)' }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>Get Started</button>
        </div>

        <button className="gs-ham" onClick={() => setMob(!mob)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', padding: 4 }}>
          {mob ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mob && (
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {[['features', 'Features'], ['why', 'Why GetSmark'], ['how', 'How It Works']].map(([id, label]) => (
            <button key={id} style={{ ...lk, justifyContent: 'flex-start' }} onClick={() => go(id)}>{label}</button>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '0.4rem 0' }} />
          <button style={{ ...lk, justifyContent: 'flex-start' }} onClick={() => { nav('/login'); setMob(false) }}>Login</button>
          <button style={{ ...btnP, justifyContent: 'center', borderRadius: 10 }} onClick={() => { nav('/signup'); setMob(false) }}>Get Started</button>
        </div>
      )}
      <style>{`@media(max-width:768px){.gs-dlinks,.gs-dright{display:none!important}.gs-ham{display:flex!important}}`}</style>
    </nav>
  )
}

/* ════════════════════════════════
   HERO
════════════════════════════════ */
function Hero({ nav }) {
  const [charIdx, setCharIdx] = useState(0)
  const line1 = 'Manage Tasks.'
  const line2 = 'Lead Teams.'
  const vidRef = useRef()

  useEffect(() => {
    if (vidRef.current) { vidRef.current.muted = true; vidRef.current.play().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (charIdx < line1.length + line2.length) {
      const t = setTimeout(() => setCharIdx(i => i + 1), 55)
      return () => clearTimeout(t)
    }
  }, [charIdx])

  const renderLine = (text, offset) =>
    text.split('').map((ch, i) => (
      <span key={i} style={{ opacity: charIdx >= offset + i + 1 ? 1 : 0, transform: charIdx >= offset + i + 1 ? 'translateY(0)' : 'translateY(20px)', display: 'inline-block', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ))

  const done = charIdx >= line1.length + line2.length

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0f0f0f' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0f0f0f 0%,#1e293b 100%)', zIndex: 0 }} />
      <video ref={vidRef} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}>
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 2 }} />
      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem,5vw,3rem)', paddingTop: 80 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(2.6rem,7vw,5.8rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', color: C.white, marginBottom: '1.25rem', overflow: 'hidden' }}>
          <div>{renderLine(line1, 0)}</div>
          <div style={{ color: '#93c5fd' }}>{renderLine(line2, line1.length)}</div>
        </h1>
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 'clamp(0.95rem,2vw,1.1rem)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, maxWidth: 520, marginBottom: '2.25rem', opacity: done ? 1 : 0, transform: done ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease 0.1s' }}>
          Manage projects, assign tasks, and track your team's progress — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', opacity: done ? 1 : 0, transform: done ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease 0.25s' }}>
          <button onClick={() => nav('/signup')} style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 'clamp(0.85rem,2vw,0.95rem)', padding: 'clamp(0.65rem,2vw,0.8rem) clamp(1.4rem,3vw,2rem)', borderRadius: 40, border: 'none', background: C.white, color: C.black, cursor: 'pointer', transition: 'all 0.22s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.2)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
            Get Started Free
          </button>
          <button onClick={() => nav('/login')} style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 'clamp(0.85rem,2vw,0.95rem)', padding: 'clamp(0.65rem,2vw,0.8rem) clamp(1.2rem,3vw,1.6rem)', borderRadius: 40, border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: C.white, cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}>
            Login
          </button>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════
   IMAGE SCROLL
   public/ folder mein rakho: screen1.png, screen2.png, screen3.png, screen4.png
════════════════════════════════ */
function ImageScroll() {
  const imgs = ['/screen1.png', '/screen2.png', '/screen3.png', '/screen4.png']
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % imgs.length), 3200)
    return () => clearInterval(t)
  }, [])
  return (
    <section style={{ background: C.off, padding: '80px clamp(1rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={sLabel}>Product Preview</div>
          <h2 style={sH2}>See GetSmark in action</h2>
        </div>
        <div style={{ position: 'relative', borderRadius: C.rLg, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.14)', aspectRatio: '16/9', background: '#1e293b' }}>
          {imgs.map((src, i) => (
            <img key={i} src={src} alt={`Screen ${i + 1}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: active === i ? 1 : 0, transform: active === i ? 'scale(1)' : 'scale(1.03)', transition: 'opacity 0.75s ease, transform 0.75s ease' }} />
          ))}
          <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ width: active === i ? 24 : 8, height: 8, borderRadius: 40, background: active === i ? C.white : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════
   HOW IT WORKS — project accurate
════════════════════════════════ */
function HowItWorks({ nav }) {
  const steps = [
    {
      icon: <Zap size={20} color="white" />, n: '01',
      title: 'Sign Up & Create Account',
      desc: 'Register with email, verify via OTP, and set up your profile. Secure from the first click — JWT auth kicks in immediately.'
    },
    {
      icon: <Users size={20} color="white" />, n: '02',
      title: 'Create Projects & Invite Team',
      desc: 'Create a project, add a description, and invite members with ADMIN or MEMBER roles. Each member sees only what they need.'
    },
    {
      icon: <TrendingUp size={20} color="white" />, n: '03',
      title: 'Assign Tasks & Track Progress',
      desc: 'Create tasks with title, due date, and priority (HIGH / MEDIUM / LOW). Move them through TODO → IN PROGRESS → DONE and watch your dashboard update live.'
    },
  ]

  return (
    <section id="how" style={{ padding: '90px clamp(1rem,4vw,2.5rem)', background: C.white }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={sLabel}>How It Works</div>
          <h2 style={sH2}>Connect your team. Assign tasks. Celebrate success</h2>
          <p style={{ ...sP, maxWidth: 480, margin: '0 auto' }}>No setup calls. No onboarding docs. Just sign up and start managing your team's work.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.1rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: C.off, borderRadius: C.rLg, padding: '2.2rem', border: '1px solid transparent', position: 'relative', overflow: 'hidden', transition: 'all 0.28s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 18px 45px rgba(37,99,235,0.1)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '3.8rem', fontWeight: 800, color: C.black, opacity: 0.06, position: 'absolute', top: '0.8rem', right: '1.2rem', lineHeight: 1 }}>{s.n}</div>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.3rem' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.55rem', letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ ...sP, fontSize: '0.875rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.75rem' }}>
          <button onClick={() => nav('/how-it-works')} style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.875rem', padding: '0.7rem 1.8rem', borderRadius: 40, border: 'none', background: C.black, color: C.white, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.22s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
            See Full Details <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════
   FEATURES — project accurate, compact
════════════════════════════════ */
function Features() {
  const feats = [
    {
      icon: <LayoutGrid size={18} />,
      title: 'Task Management',
      desc: 'Create tasks with title, description, due date, priority (HIGH / MEDIUM / LOW) and status (TODO / IN_PROGRESS / DONE). Assign to any team member.',
      accent: '#2563eb', bg: '#eff6ff'
    },
    {
      icon: <Users size={18} />,
      title: 'Project & Team Roles',
      desc: 'Create projects, invite members, and assign roles — ADMIN or MEMBER. Full access control so the right people see the right things.',
      accent: '#7c3aed', bg: '#f5f3ff'
    },
    {
      icon: <BarChart2 size={18} />,
      title: 'Live Dashboard',
      desc: 'Total tasks, completion rate, overdue count, workload per member, upcoming deadlines, and a 7-day activity trend — all computed live from your data.',
      accent: '#059669', bg: '#ecfdf5'
    },
    {
      icon: <Clock size={18} />,
      title: 'Deadline & Overdue Alerts',
      desc: 'Any task past its due date is automatically flagged. Upcoming deadlines surface on the dashboard sorted by urgency — nothing slips through.',
      accent: '#dc2626', bg: '#fef2f2'
    },
    {
      icon: <Target size={18} />,
      title: 'Team Workload View',
      desc: 'See exactly how many tasks each team member is handling. Spot overloaded members and rebalance before deadlines get missed.',
      accent: '#d97706', bg: '#fffbeb'
    },
    {
      icon: <Lock size={18} />,
      title: 'OTP-based Secure Auth',
      desc: 'Email OTP verification on signup, JWT-secured sessions, and a full password reset flow — enterprise-grade security out of the box.',
      accent: '#0891b2', bg: '#ecfeff'
    },
  ]

  return (
    <section id="features" style={{ padding: '90px clamp(1rem,4vw,2.5rem)', background: C.off }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={sLabel}>Features</div>
          <h2 style={sH2}>What's inside GetSmark</h2>
          <p style={{ ...sP, maxWidth: 460, margin: '0 auto' }}>Every feature is built around how real teams actually work — from task creation to delivery.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.9rem' }}>
          {feats.map((f, i) => (
            <div key={i} style={{ background: C.white, borderRadius: C.r, padding: '1.4rem', border: `1px solid ${C.border}`, transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = f.accent + '55' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem', color: f.accent }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.35rem', letterSpacing: '-0.01em', color: C.black }}>{f.title}</h3>
              <p style={{ ...sP, fontSize: '0.82rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════
   WHY CHOOSE — project accurate
════════════════════════════════ */
function WhyChoose() {
  const reasons = [
    {
      icon: <CheckCircle size={20} />, color: '#eff6ff', stroke: '#2563eb',
      title: 'Full Clarity on Every Task',
      desc: 'Every task has a clear owner, due date, priority level, and real-time status. No chasing people. No guessing what\'s done.'
    },
    {
      icon: <Lock size={20} />, color: '#f0fdf4', stroke: '#16a34a',
      title: 'Secure by Default',
      desc: 'JWT authentication, OTP email verification, role-based access control, and Spring Security — production-grade security from day one.'
    },
    {
      icon: <BarChart2 size={20} />, color: '#fffbeb', stroke: '#d97706',
      title: 'Dashboard That Actually Helps',
      desc: 'Completion rate, overdue tasks, team workload, upcoming deadlines, and 7-day trends — all computed live from your MongoDB data. No manual reports.'
    },
    {
      icon: <Zap size={20} />, color: '#f5f3ff', stroke: '#7c3aed',
      title: 'Modern Stack, Zero Compromise',
      desc: 'React + Vite on the frontend, Spring Boot on the backend, MongoDB for data. Fast, scalable, and easy to extend as your team grows.'
    },
  ]

  const stats = [
    { val: 'TODO', label: 'Track pending work' },
    { val: 'IN PROGRESS', label: 'See active tasks' },
    { val: 'DONE', label: 'Measure delivery' },
    { val: 'OVERDUE', label: 'Catch what\'s late' },
  ]

  return (
    <section id="why" style={{ padding: '90px clamp(1rem,4vw,2.5rem)', background: C.white }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={sLabel}>Why GetSmark</div>
          <h2 style={sH2}>Why teams choose GetSmark</h2>
          <p style={{ ...sP, maxWidth: 480, margin: '0 auto' }}>Not just another task tool — GetSmark is purpose-built for teams that need clarity, speed, and accountability in one place.</p>
        </div>

        {/* Task status strip — shows real workflow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {stats.map((s, i) => {
            const colors = ['#2563eb', '#f59e0b', '#22c55e', '#ef4444']
            return (
              <div key={i} style={{ background: C.off, borderRadius: C.r, padding: '1.25rem', textAlign: 'center', border: `1px solid ${C.border}`, borderTop: `3px solid ${colors[i]}` }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(0.65rem,1.5vw,0.78rem)', fontWeight: 800, letterSpacing: '0.05em', color: colors[i], textTransform: 'uppercase' }}>{s.val}</div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.75rem', color: C.muted, marginTop: 4 }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* Reason cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
          {reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.4rem', background: C.off, borderRadius: C.r, border: `1px solid ${C.border}`, transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.07)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: r.stroke }}>{r.icon}</div>
              <div>
                <h4 style={{ fontFamily: 'Syne,sans-serif', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.3rem' }}>{r.title}</h4>
                <p style={{ ...sP, fontSize: '0.84rem' }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════
   REVIEWS
════════════════════════════════ */
function Reviews() {
  const ref = useRef()
  const reviews = [
    { name: 'Riya Kapoor',    role: 'Eng Manager, Zeta Finance', init: 'RK', color: '#2563eb', text: '"Finally a tool where I can see exactly who is working on what — and what\'s overdue. The dashboard alone saves us hours every week."' },
    { name: 'Arjun Mehta',    role: 'CTO, BuildStack',           init: 'AM', color: '#7c3aed', text: '"The role-based access is exactly what we needed. Admins manage, members execute. No confusion, no accidental changes."' },
    { name: 'Sofia Nakamura', role: 'Product Lead, Orbix',       init: 'SN', color: '#059669', text: '"OTP login was a pleasant surprise. Most tools skip security — GetSmark takes it seriously from the start."' },
    { name: 'Dev Liu',         role: 'Senior SWE, NovaTech',      init: 'DL', color: '#dc2626', text: '"Task priorities and due dates are simple but powerful. HIGH priority tasks never get buried anymore."' },
    { name: 'Priya Bose',     role: 'Head of Product, Fluxr',    init: 'PB', color: '#0891b2', text: '"The 7-day activity trend on the dashboard helped us spot that our team was burning out mid-sprint. Game changer."' },
  ]
  const scroll = d => ref.current?.scrollBy({ left: d * 330, behavior: 'smooth' })

  return (
    <section id="reviews" style={{ padding: '90px clamp(1rem,4vw,2.5rem)', background: C.off }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <div style={sLabel}>Reviews</div>
          <h2 style={sH2}>Teams that love GetSmark</h2>
        </div>
        <div ref={ref} style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', marginTop: '2.5rem' }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: C.white, borderRadius: C.rLg, padding: '1.6rem', minWidth: 'clamp(260px,80vw,300px)', maxWidth: 300, flexShrink: 0, scrollSnapAlign: 'start', border: `1px solid ${C.border}`, transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.07)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ color: '#f59e0b', fontSize: '0.95rem', letterSpacing: 2, marginBottom: '0.7rem' }}>★★★★★</div>
              <p style={{ ...sP, fontSize: '0.875rem', marginBottom: '1.1rem' }}>{r.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: C.white, fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>{r.init}</div>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '0.83rem', fontWeight: 700 }}>{r.name}</div>
                  <div style={{ ...sP, fontSize: '0.76rem' }}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', marginTop: '1.75rem' }}>
          {[[-1, '←'], [1, '→']].map(([d, l]) => (
            <button key={d} onClick={() => scroll(d)} style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.white, cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = C.black; e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.black }}
              onMouseOut={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.black; e.currentTarget.style.borderColor = C.border }}>{l}</button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════
   FOOTER — light, newsletter only
════════════════════════════════ */
function Footer({ nav }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [subError, setSubError] = useState('')

  const send = async () => {
    if (!email.includes('@')) return
    setSubLoading(true); setSubError('')
    try {
      const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
      const res = await fetch(`${base}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true); setEmail('')
        setTimeout(() => setSent(false), 4000)
      } else {
        setSubError(data.message || 'Failed. Try again.')
      }
    } catch {
      setSubError('Network error. Try again.')
    } finally {
      setSubLoading(false)
    }
  }

  const colH = { fontFamily: 'Syne,sans-serif', fontSize: '0.8rem', fontWeight: 700, color: C.black, marginBottom: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase' }
  const colA = { display: 'block', ...sP, fontSize: '0.84rem', marginBottom: '0.45rem', textDecoration: 'none', transition: 'color 0.18s', cursor: 'pointer' }

  return (
    <footer style={{ background: C.white, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px clamp(1rem,4vw,2.5rem) 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2.5rem' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.75rem', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.05rem', color: C.black }}>
            <img src="/logo.svg" alt="GetSmark" style={{ height: 28, width: 28 }} />
            GetSmark
          </div>
          <p style={{ ...sP, fontSize: '0.83rem', maxWidth: 200 }}>Project & task management for teams that value clarity and accountability.</p>
          <div style={{ display: 'flex', gap: '0.55rem', marginTop: '1rem' }}>
            {['𝕏', 'in', 'GH'].map(s => (
              <div key={s} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', color: C.muted, fontFamily: 'Syne,sans-serif', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = C.black; e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.black }}
                onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={colH}>Quick Links</h4>
          {['Features', 'How It Works', 'Why GetSmark', 'Reviews'].map(l => (
            <a key={l} style={colA} onMouseOver={e => e.target.style.color = C.black} onMouseOut={e => e.target.style.color = C.muted}>{l}</a>
          ))}
        </div>

        {/* Legal & Support */}
        <div>
          <h4 style={colH}>Legal & Support</h4>
          {['Privacy Policy', 'Terms of Use', 'Contact Us', 'FAQ'].map(l => (
            <a key={l} style={colA} onMouseOver={e => e.target.style.color = C.black} onMouseOut={e => e.target.style.color = C.muted}>{l}</a>
          ))}
        </div>

        {/* Newsletter */}
        <div>
          <h4 style={colH}>Newsletter</h4>
          <p style={{ ...sP, fontSize: '0.82rem', marginBottom: '0.85rem' }}>Product updates & tips — no spam.</p>
          {sent
            ? <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>✓ You're subscribed!</div>
            : (
              <>
                <div style={{ display: 'flex', border: `1.5px solid ${subError ? '#ef4444' : C.border}`, borderRadius: 40, overflow: 'hidden', background: C.white, transition: 'border-color 0.2s' }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = C.accent}
                  onBlurCapture={e => e.currentTarget.style.borderColor = subError ? '#ef4444' : C.border}>
                  <input value={email} onChange={e => { setEmail(e.target.value); setSubError('') }} onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="your@email.com"
                    disabled={subLoading}
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '0.5rem 0.9rem', fontSize: '0.83rem', fontFamily: 'DM Sans,sans-serif', background: 'transparent', minWidth: 0 }} />
                  <button onClick={send} disabled={subLoading} style={{ background: subLoading ? '#555' : C.black, border: 'none', cursor: subLoading ? 'not-allowed' : 'pointer', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                    onMouseOver={e => !subLoading && (e.currentTarget.style.background = '#333')}
                    onMouseOut={e => !subLoading && (e.currentTarget.style.background = C.black)}>
                    <Send size={13} color="white" />
                  </button>
                </div>
                {subError && <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0 8px' }}>{subError}</p>}
              </>
            )}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.1rem clamp(1rem,4vw,2.5rem)', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ ...sP, fontSize: '0.8rem' }}>© 2026 GetSmark. All rights reserved.</span>
        <span style={{ ...sP, fontSize: '0.8rem' }}>Made for teams that build together</span>
      </div>
    </footer>
  )
}

/* ════════════════════════════════
   CHATBOT
════════════════════════════════ */
function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ bot: true, text: "Hey! 👋 I'm Smark. How can I help?" }])
  const [inp, setInp] = useState('')
  const bodyRef = useRef()
  const replies = [
    'GetSmark is free to try — sign up in seconds, no card needed.',
    'You can create projects, add team members, and start assigning tasks right away.',
    'Tasks have priority levels (HIGH / MEDIUM / LOW) and move through TODO → IN PROGRESS → DONE.',
    'The dashboard shows live stats: completion rate, overdue tasks, workload per member, and a 7-day trend.',
    'Auth uses OTP email verification + JWT sessions — secure from day one.',
    'Reach us at hello@getsmark.io — we reply within 2 hours.',
  ]
  let ri = 0
  const send = () => {
    if (!inp.trim()) return
    setMsgs(p => [...p, { bot: false, text: inp }])
    setInp('')
    setTimeout(() => {
      setMsgs(p => [...p, { bot: true, text: replies[ri++ % replies.length] }])
      setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = 99999 }, 30)
    }, 650)
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', width: 52, height: 52, borderRadius: '50%', background: C.black, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', zIndex: 900, transition: 'all 0.22s' }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.07)'}
        onMouseOut={e => e.currentTarget.style.transform = 'none'}>
        {open ? <X size={19} color="white" /> : <MessageSquare size={19} color="white" />}
      </button>
      <div style={{ position: 'fixed', bottom: '5rem', right: '1.75rem', width: 'min(320px, calc(100vw - 2rem))', background: C.white, borderRadius: C.rLg, boxShadow: '0 20px 60px rgba(0,0,0,0.16)', border: `1px solid ${C.border}`, zIndex: 900, overflow: 'hidden', transition: 'all 0.3s cubic-bezier(.4,0,.2,1)', transform: open ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.96)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}>
        <div style={{ background: C.black, padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.white }}>GetSmark Support</span>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
        <div ref={bodyRef} style={{ height: 240, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ maxWidth: '82%', padding: '0.55rem 0.85rem', borderRadius: 11, fontFamily: 'DM Sans,sans-serif', fontSize: '0.85rem', lineHeight: 1.6, background: m.bot ? C.off : C.black, color: m.bot ? C.black : C.white, alignSelf: m.bot ? 'flex-start' : 'flex-end' }}>{m.text}</div>
          ))}
        </div>
        <div style={{ padding: '0.65rem 0.9rem', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '0.4rem' }}>
          <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…"
            style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 40, padding: '0.45rem 0.85rem', fontSize: '0.83rem', outline: 'none', fontFamily: 'DM Sans,sans-serif', minWidth: 0 }} />
          <button onClick={send} style={{ background: C.black, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={13} color="white" />
          </button>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════
   HOME PAGE
════════════════════════════════ */
export default function Home({ scrollTo }) {
  const nav = useNavigate()
  // If opened via /how-it-works, scroll to how-it-works section after mount
  useState(() => {
    if (scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(scrollTo)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  })
  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif', color: C.black, overflowX: 'hidden' }}>
      <Navbar nav={nav} />
      <Hero nav={nav} />
      <ImageScroll />
      <HowItWorks nav={nav} />
      <Features />
      <WhyChoose />
      <Reviews />

      {/* CTA — background image set via ctaBg prop or default dark */}
      <section style={{
        padding: '100px clamp(1.25rem,5vw,3rem)',
        background: C.black,
        color: C.white,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background image overlay — tua image yahan inject hogi */}
        <div id="cta-bg" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('/footer.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1.0,
          zIndex: 0,
        }} />
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1 }} />

        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ ...sLabel, color: '#93c5fd', textAlign: 'center', marginBottom: '0.75rem' }}>Get Started Today</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(1.9rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.04em', color: C.white, marginBottom: '0.85rem' }}>Plan Today, Lead Tomorrow</h2>
          <p style={{ ...sP, color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>Sign up free. No credit card. No catch.</p>
          <button onClick={() => nav('/signup')} style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.9rem', padding: '0.75rem 2.25rem', borderRadius: 40, border: 'none', background: C.white, color: C.black, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#f0f0f0'}
            onMouseOut={e => e.currentTarget.style.background = C.white}>
            Create Free Account
          </button>
        </div>
      </section>

      <Footer nav={nav} />
      <Chatbot />

      <style>{`
        :root { --cta-bg-image: none; }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
        body{overflow-x:hidden}
        img{max-width:100%;height:auto;display:block}
        #reviews div::-webkit-scrollbar{display:none}

        /* ── Navbar ── */
        @media(max-width:768px){
          .gs-dlinks,.gs-dright{display:none!important}
          .gs-ham{display:flex!important}
        }

        /* ── Hero — stack on mobile ── */
        @media(max-width:640px){
          #hero > div > h1 { font-size: clamp(2.2rem,10vw,3.2rem) !important }
          #hero > div > p  { font-size: 0.95rem !important; max-width:100% !important }
          #hero > div > div { flex-direction:column !important }
          #hero > div > div > button { width:100% !important; justify-content:center !important }
        }

        /* ── ImageScroll aspect ratio on small screens ── */
        @media(max-width:480px){
          [style*="aspectRatio: '16/9'"] { aspect-ratio: 4/3 !important }
        }

        /* ── How It Works — single col on mobile ── */
        @media(max-width:600px){
          #how [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important }
        }

        /* ── Features — 2 col on tablet, 1 col on phone ── */
        @media(max-width:640px){
          #features [style*="gridTemplateColumns"] { grid-template-columns: 1fr 1fr !important }
        }
        @media(max-width:400px){
          #features [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important }
        }

        /* ── Why GetSmark — stack on mobile ── */
        @media(max-width:640px){
          #why [style*="gridTemplateColumns"] { grid-template-columns: 1fr 1fr !important }
        }
        @media(max-width:400px){
          #why [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important }
        }

        /* ── Reviews cards — full width on mobile ── */
        @media(max-width:480px){
          #reviews [style*="minWidth"] { min-width: calc(100vw - 3rem) !important; max-width: calc(100vw - 3rem) !important }
        }

        /* ── CTA section ── */
        @media(max-width:480px){
          section[style*="background: rgb(15, 15, 15)"] button { width:100% !important }
        }

        /* ── Footer grid — 2 col on tablet, 1 col on phone ── */
        @media(max-width:640px){
          footer > div:first-child { grid-template-columns: 1fr 1fr !important; gap: 1.5rem !important }
        }
        @media(max-width:400px){
          footer > div:first-child { grid-template-columns: 1fr !important }
        }

        /* ── Prevent text overflow everywhere ── */
        h1,h2,h3,h4,p,a,button,span{word-break:break-word;overflow-wrap:break-word}

        /* ── Section padding tighten on mobile ── */
        @media(max-width:480px){
          section { padding-top: 60px !important; padding-bottom: 60px !important }
        }
      `}</style>
    </div>
  )
}