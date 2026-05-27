import { useState, useEffect } from 'react'
import api from '../../utils/api'

const actionConfig = {
  TASK_CREATED:   { icon: '✅', color: '#22c55e', text: 'created task' },
  TASK_DELETED:   { icon: '🗑️', color: '#ef4444', text: 'deleted task' },
  TASK_ASSIGNED:  { icon: '👤', color: '#3b82f6', text: 'assigned task' },
  STATUS_CHANGED: { icon: '🔄', color: '#f59e0b', text: 'changed status' },
  MEMBER_ADDED:   { icon: '➕', color: '#6366f1', text: 'added member' },
  MEMBER_REMOVED: { icon: '➖', color: '#ef4444', text: 'removed member' },
  MEMBER_INVITED: { icon: '📧', color: '#8b5cf6', text: 'invited' },
  ROLE_CHANGED:   { icon: '🛡️', color: '#0369a1', text: 'changed role of' },
  PROJECT_CREATED:{ icon: '🚀', color: '#22c55e', text: 'created project' },
  COMMENT_ADDED:  { icon: '💬', color: '#64748b', text: 'commented on' },
}

const formatTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function ActivityLog({ projectId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [projectId])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/activity/project/${projectId}`)
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e1b4b', margin: 0 }}>
          Activity Log
        </h3>
        <button onClick={fetchLogs} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading...</p>
      ) : logs.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No activity yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {logs.map((log, i) => {
            const config = actionConfig[log.action] || { icon: '🔔', color: '#64748b', text: log.action }
            return (
              <div key={log.id || i} style={{ display: 'flex', gap: '12px', padding: '10px 8px', borderRadius: '8px', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                {/* Icon */}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: config.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                  {config.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    <strong>{log.userName}</strong>
                    {' '}
                    <span style={{ color: config.color, fontWeight: '500' }}>{config.text}</span>
                    {' '}
                    <strong>{log.entityName}</strong>
                    {log.oldValue && log.newValue && (
                      <span style={{ color: '#94a3b8' }}>
                        {' '}({log.oldValue} → <span style={{ color: config.color }}>{log.newValue}</span>)
                      </span>
                    )}
                    {!log.oldValue && log.newValue && (
                      <span style={{ color: '#94a3b8' }}> as <span style={{ color: config.color }}>{log.newValue}</span></span>
                    )}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    {formatTime(log.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}