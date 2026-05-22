import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>⚡</div>
          <div>
            <span style={styles.logoText}>5MART W<span style={styles.logoO}>0</span>RK</span>
            <div style={styles.logoTagline}>▌▌ BINDAS KAAM ▌▌</div>
          </div>
        </div>
        <div style={styles.navLinks}>
          <a style={styles.navLink} href="#">Home</a>
          <a style={styles.navLink} href="#">Features</a>
          <a style={styles.navLink} href="#">Pricing</a>
          <a style={styles.navLink} href="#">About Us</a>
          <a style={styles.navLink} href="#">Contact</a>
        </div>
        <div style={styles.navBtns}>
          <span style={styles.darkIcon}>🌙</span>
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
          <button style={styles.getStartedBtn} onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>
            Manage Your Team Tasks<br />
            Like a <span style={styles.heroHighlight}>Pro</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Create projects, assign tasks, track progress —<br />
            all in one place. Simple, fast, and powerful.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.ctaBtn} onClick={() => navigate('/signup')}>
              Get Started →
            </button>
            <button style={styles.demoBtn}>
              ▶ Demo
            </button>
          </div>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.logoCircle}>
            <div style={styles.innerCircle}>⚡</div>
          </div>
          <div style={styles.heroLogoText}>
            <span style={styles.heroLogoMain}>5MART W<span style={styles.oColor}>0</span>RK</span>
            <div style={styles.heroLogoSub}>▌▌ BINDAS KAAM ▌▌</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={styles.features}>
        {[
          { icon: '📋', title: 'Project Management', desc: 'Create and manage multiple projects with ease' },
          { icon: '👥', title: 'Team Collaboration', desc: 'Add members and assign roles — Admin or Member' },
          { icon: '✅', title: 'Task Tracking', desc: 'Track tasks from To Do to Done with priorities' },
          { icon: '📊', title: 'Dashboard Analytics', desc: 'See overdue tasks, progress and team stats' },
        ].map((f, i) => (
          <div key={i} style={styles.featureCard}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
            <div style={styles.featureArrow}>→</div>
          </div>
        ))}
      </div>

      {/* Workflow */}
      <div style={styles.workflow}>
        <h2 style={styles.workflowTitle}>— WORK FLOW —</h2>
        <div style={styles.workflowSteps}>
          {[
            { icon: '📁', num: '1', title: 'Create Project', desc: 'Start by creating a new project for your team.' },
            { icon: '👥', num: '2', title: 'Add Team Members', desc: 'Invite your team and assign roles.' },
            { icon: '📝', num: '3', title: 'Assign Tasks', desc: 'Break down the work and assign tasks.' },
            { icon: '⏰', num: '4', title: 'Track Progress', desc: 'Track tasks in real-time and stay updated.' },
            { icon: '📈', num: '5', title: 'Get Results', desc: 'Complete tasks and achieve your goals.' },
          ].map((s, i) => (
            <div key={i} style={styles.stepWrapper}>
              <div style={styles.stepCircle}>
                <span style={styles.stepIcon}>{s.icon}</span>
              </div>
              {i < 4 && <div style={styles.stepLine}>••••</div>}
              <p style={styles.stepNum}>{s.num}. {s.title}</p>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>
              <span style={styles.footerLogoIcon}>⚡</span>
              <span style={styles.footerLogoText}>5MART W<span style={styles.oColor}>0</span>RK</span>
            </div>
            <p style={styles.footerBrandDesc}>All-in-one platform to manage projects, tasks, and teams efficiently.</p>
            <div style={styles.socialIcons}>
              <span style={styles.socialIcon}>f</span>
              <span style={styles.socialIcon}>t</span>
              <span style={styles.socialIcon}>in</span>
              <span style={styles.socialIcon}>ig</span>
            </div>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Product</h4>
            {['Features','Pricing','Demo','Roadmap','Updates'].map(i => (
              <a key={i} style={styles.footerLink} href="#">{i}</a>
            ))}
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Company</h4>
            {['About Us','Blog','Careers','Contact Us','Privacy Policy'].map(i => (
              <a key={i} style={styles.footerLink} href="#">{i}</a>
            ))}
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Support</h4>
            {['Help Center','FAQs','Terms & Conditions','Privacy Policy','Contact Support'].map(i => (
              <a key={i} style={styles.footerLink} href="#">{i}</a>
            ))}
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>Newsletter</h4>
            <p style={styles.footerDesc}>Stay updated with our latest features and offers.</p>
            <div style={styles.newsletterInput}>
              <input placeholder="Enter your email" style={styles.emailInput} />
              <button style={styles.sendBtn}>➤</button>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2026 5Mart W0rk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' },

  // Navbar
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#0d0d0d', borderBottom: '1px solid #222' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '28px', background: 'linear-gradient(135deg, #ff6b00, #ff9f00)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '20px', fontWeight: '800', color: 'white', letterSpacing: '1px' },
  logoO: { color: '#ff6b00' },
  logoTagline: { fontSize: '9px', color: '#ff6b00', letterSpacing: '2px' },
  navLinks: { display: 'flex', gap: '30px' },
  navLink: { color: '#ff6b00', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  navBtns: { display: 'flex', alignItems: 'center', gap: '12px' },
  darkIcon: { fontSize: '18px', cursor: 'pointer' },
  loginBtn: { padding: '8px 20px', background: 'transparent', color: 'white', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  getStartedBtn: { padding: '8px 20px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },

  // Hero
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '80px 80px', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)', minHeight: '500px', position: 'relative' },
  heroLeft: { maxWidth: '500px' },
  heroTitle: { fontSize: '44px', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px', color: 'white' },
  heroHighlight: { color: '#ff6b00' },
  heroSubtitle: { fontSize: '16px', color: '#aaa', lineHeight: '1.8', marginBottom: '35px' },
  heroBtns: { display: 'flex', gap: '15px' },
  ctaBtn: { padding: '14px 30px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' },
  demoBtn: { padding: '14px 30px', background: 'transparent', color: 'white', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  heroRight: { textAlign: 'center' },
  logoCircle: { width: '200px', height: '200px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b00, #ff9f00, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 60px rgba(255,107,0,0.4)' },
  innerCircle: { fontSize: '80px' },
  heroLogoMain: { fontSize: '28px', fontWeight: '800', color: 'white' },
  oColor: { color: '#ff6b00' },
  heroLogoSub: { color: '#ff6b00', fontSize: '11px', letterSpacing: '3px', marginTop: '5px' },

  // Features
  features: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '60px 40px', background: '#0d0d0d' },
  featureCard: { background: '#151515', padding: '30px 20px', borderRadius: '12px', border: '1px solid #222', position: 'relative' },
  featureIcon: { fontSize: '36px', marginBottom: '15px' },
  featureTitle: { color: 'white', marginBottom: '10px', fontSize: '16px' },
  featureDesc: { color: '#888', fontSize: '13px', lineHeight: '1.6' },
  featureArrow: { position: 'absolute', bottom: '15px', right: '15px', background: '#222', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00' },

  // Workflow
  workflow: { padding: '60px 40px', background: '#0a0a0a', textAlign: 'center' },
  workflowTitle: { color: '#ff6b00', fontSize: '20px', letterSpacing: '4px', marginBottom: '50px' },
  workflowSteps: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '0px' },
  stepWrapper: { textAlign: 'center', width: '180px' },
  stepCircle: { width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', background: '#151515' },
  stepIcon: { fontSize: '28px' },
  stepLine: { color: '#ff6b00', fontSize: '20px', letterSpacing: '3px', margin: '-35px 0 0 75px', position: 'relative', top: '-35px' },
  stepNum: { color: 'white', fontWeight: '600', fontSize: '13px', margin: '5px 0' },
  stepDesc: { color: '#888', fontSize: '12px', lineHeight: '1.5' },

  // Footer
  footer: { background: '#0d0d0d', borderTop: '1px solid #222' },
  footerTop: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', gap: '40px', padding: '50px 40px' },
  footerBrand: {},
  footerLogo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' },
  footerLogoIcon: { fontSize: '22px', background: 'linear-gradient(135deg, #ff6b00, #ff9f00)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  footerLogoText: { fontSize: '16px', fontWeight: '800', color: 'white' },
  footerBrandDesc: { color: '#888', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' },
  socialIcons: { display: 'flex', gap: '10px' },
  socialIcon: { width: '32px', height: '32px', border: '1px solid #333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '12px', cursor: 'pointer' },
  footerCol: { display: 'flex', flexDirection: 'column' },
  footerColTitle: { color: 'white', marginBottom: '15px', fontSize: '14px' },
  footerLink: { color: '#888', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' },
  footerDesc: { color: '#888', fontSize: '13px', marginBottom: '15px' },
  newsletterInput: { display: 'flex', gap: '8px' },
  emailInput: { flex: 1, padding: '10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white', fontSize: '13px' },
  sendBtn: { padding: '10px 15px', background: '#ff6b00', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' },
  footerBottom: { textAlign: 'center', padding: '20px', borderTop: '1px solid #222', color: '#555', fontSize: '13px' },
}