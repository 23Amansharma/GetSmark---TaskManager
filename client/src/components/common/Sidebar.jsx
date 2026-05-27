import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import NotificationBell from './NotificationBell'

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/projects', icon: <FolderKanban size={18} />, label: 'Projects' },
  { to: '/tasks', icon: <CheckSquare size={18} />, label: 'My Tasks' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" alt="GetSmark" style={{ height: 32, width: 32 }} />
          <div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px' }}>
              GetSmark
            </span>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Task Manager</p>
          </div>
        </div>
        {/* Notification Bell — visible on dark background */}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        <p style={{
          color: 'rgba(255,255,255,0.35)', fontSize: '11px',
          padding: '8px 12px', letterSpacing: '1.2px', fontWeight: '600',
        }}>OVERVIEW</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              textDecoration: 'none', fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              transition: 'all 0.15s',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {user && (
          <div style={{
            padding: '10px 12px', marginBottom: '4px',
            background: 'rgba(255,255,255,0.06)', borderRadius: '8px',
          }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>
              {user.name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', width: '100%',
            color: 'rgba(255,255,255,0.55)', background: 'transparent',
            border: 'none', cursor: 'pointer', fontSize: '14px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
            e.currentTarget.style.color = '#fca5a5'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: '16px', left: '16px', zIndex: 50,
          background: '#1e1b4b', border: 'none', borderRadius: '8px',
          padding: '8px', cursor: 'pointer', color: 'white'
        }}
        id="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <aside style={{
        width: '224px', minHeight: '100vh',
        background: '#1e1b4b', position: 'fixed',
        top: 0, left: 0, zIndex: 40,
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
      }} id="desktop-sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
          />
          <aside style={{
            width: '224px', height: '100vh',
            background: '#1e1b4b', position: 'fixed',
            top: 0, left: 0, zIndex: 50,
          }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '6px', padding: '4px', cursor: 'pointer', color: 'white',
              }}
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}