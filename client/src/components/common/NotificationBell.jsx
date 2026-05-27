import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import api from '../../utils/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (err) { console.error(err) }
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setUnreadCount(0)
    fetchNotifications()
  }

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    fetchNotifications()
    fetchUnreadCount()
  }

  const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`)
    fetchNotifications()
    fetchUnreadCount()
  }

  const handleOpen = () => {
    setOpen(!open)
    if (!open) fetchNotifications()
  }

  const formatTime = (dateTime) => {
    if (!dateTime) return ''
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
    }).format(new Date(dateTime))
  }

  const typeIcon = {
    TASK_ASSIGNED: '📋',
    COMMENT_ADDED: '💬',
    MEMBER_ADDED: '👥',
    INVITE: '📧',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell Button — FIX: white color so visible on dark #1e1b4b sidebar bg */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.12)',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          color: 'Blue',           /* ← FIX: was #1e1b4b (dark on dark = invisible) */
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#ef4444', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '10px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #1e1b4b',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: 0,
          width: '320px', background: 'white', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 100,
          border: '1px solid #e2e8f0', overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
            background: '#fafafa',
          }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  borderRadius: '20px', padding: '1px 8px',
                  fontSize: '11px', marginLeft: '6px',
                }}>{unreadCount}</span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', color: '#6366f1', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                <Bell size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  style={{
                    display: 'flex', gap: '10px', padding: '12px 16px',
                    background: n.read ? 'white' : '#f5f3ff',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: n.read ? '3px solid transparent' : '3px solid #6366f1',
                    cursor: n.read ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>
                    {typeIcon[n.type] || '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: n.read ? '400' : '600',
                      color: '#1e293b', margin: '0 0 2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{n.title}</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px', lineHeight: '1.4' }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#cbd5e1', flexShrink: 0, padding: '2px',
                      borderRadius: '4px', transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}