import { useEffect, useState } from 'react'
import KanbanBoard from '../components/tasks/KanbanBoard'
import CalendarView from '../components/tasks/CalendarView'
import ActivityLog from '../components/common/ActivityLog'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { ArrowLeft, Plus, UserPlus, Crown, Shield, Briefcase, User, Eye } from 'lucide-react'

const ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']

const roleConfig = {
  OWNER:   { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <Crown size={12} />,    label: 'Owner'   },
  ADMIN:   { color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', icon: <Shield size={12} />,   label: 'Admin'   },
  MANAGER: { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', icon: <Briefcase size={12} />,label: 'Manager' },
  MEMBER:  { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: <User size={12} />,     label: 'Member'  },
  VIEWER:  { color: '#374151', bg: '#f9fafb', border: '#e5e7eb', icon: <Eye size={12} />,      label: 'Viewer'  },
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [memberEmails, setMemberEmails] = useState('')
  const [memberRole, setMemberRole] = useState('MEMBER')
  const [addingMembers, setAddingMembers] = useState(false)
  const [addResult, setAddResult] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: ''
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects'),
        api.get(`/tasks/project/${id}`)
      ])
      const found = projectsRes.data.find(p => p.id === id)
      setProject(found)
      setTasks(tasksRes.data)
    } finally {
      setLoading(false)
    }
  }

  const addMembers = async (e) => {
    e.preventDefault()
    setAddingMembers(true)
    setAddResult(null)
    const emails = memberEmails.split(/[\n,]+/).map(e => e.trim().toLowerCase()).filter(Boolean)
    const result = { added: [], pending: [], failed: [] }
    for (const email of emails) {
      try {
        await api.post(`/projects/${id}/members`, { email, role: memberRole })
        result.added.push(email)
      } catch (err) {
        const msg = err.response?.data?.message || ''
        if (msg.includes('already')) result.failed.push({ email, reason: 'Already a member' })
        else result.pending.push(email)
      }
    }
    setAddResult(result)
    setMemberEmails('')
    setAddingMembers(false)
    fetchAll()
  }

  const updateMemberRole = async (memberEmail, newRole) => {
    try {
      await api.patch(`/projects/${id}/members/role`, { email: memberEmail, role: newRole })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role')
    }
  }

  const removeMember = async (memberEmail) => {
    if (!window.confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members`, { data: { email: memberEmail } })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    await api.post('/tasks', { ...taskForm, projectId: id, assignedTo: taskForm.assignedTo || null })
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' })
    setShowTaskModal(false)
    fetchAll()
  }

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status })
    fetchAll()
  }

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`)
    fetchAll()
  }

  if (loading) return <LoadingSpinner />
  if (!project) return <div style={{ padding: 40 }}>Project not found.</div>

  const currentMember = project.members?.find(m =>
    (m.email?.toLowerCase() && user?.email?.toLowerCase() &&
      m.email.toLowerCase() === user.email.toLowerCase()) ||
    (m.userId && user?.id && m.userId === user.id)
)
  const currentRole = currentMember?.role || 'VIEWER'
  const canManageProject = ['OWNER', 'ADMIN'].includes(currentRole)
  const canManageMembers = ['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole)
  const canManageTasks = ['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole)
  const isViewer = currentRole === 'VIEWER'

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: 'white', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/projects')} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#64748b" />
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e1b4b', margin: 0 }}>{project.name}</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{project.description}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentMember && (() => {
            const cfg = roleConfig[currentRole] || roleConfig.MEMBER
            return (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.icon} {cfg.label}
              </span>
            )
          })()}
          {canManageMembers && (
            <button onClick={() => setShowMemberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <UserPlus size={16} /> Add Member
            </button>
          )}
          {canManageTasks && (
            <button onClick={() => setShowTaskModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#1e1b4b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Role banners */}
      {isViewer && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#0369a1', fontSize: '14px' }}>
          👁️ You are a Viewer. You can view tasks and add comments only.
        </div>
      )}
      {currentRole === 'MEMBER' && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#c2410c', fontSize: '14px' }}>
          👤 You are a Member. You can update tasks assigned to you and add comments.
        </div>
      )}

      {/* Members */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e1b4b', marginBottom: '12px' }}>
          Team Members ({project.members?.length || 0})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {project.members?.map(member => {
            const cfg = roleConfig[member.role] || roleConfig.MEMBER
            return (
              <div key={member.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', border: `1px solid ${cfg.border}` }}>
                    {member.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{member.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{member.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {canManageProject && member.role !== 'OWNER' ? (
                    <select value={member.role} onChange={e => updateMemberRole(member.email, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '8px', border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      {ROLES.filter(r => r !== 'OWNER').map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: '600', border: `1px solid ${cfg.border}` }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  )}
                  {canManageMembers && member.role !== 'OWNER' && member.email !== user?.email && (
                    <button onClick={() => removeMember(member.email)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: '#ef4444', fontSize: '12px' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e1b4b', margin: 0 }}>
            Tasks ({tasks.length})
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setView('kanban')} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: view === 'kanban' ? '#1e1b4b' : '#f1f5f9', color: view === 'kanban' ? 'white' : '#64748b' }}>
              Kanban
            </button>
            <button onClick={() => setView('calendar')} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: view === 'calendar' ? '#1e1b4b' : '#f1f5f9', color: view === 'calendar' ? 'white' : '#64748b' }}>
              Calendar
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
            No tasks yet. {canManageTasks && 'Create the first task!'}
          </p>
        ) : view === 'kanban' ? (
          <KanbanBoard tasks={tasks} onStatusChange={updateStatus} onDelete={deleteTask} isAdmin={canManageTasks} />
        ) : (
          <CalendarView tasks={tasks} />
        )}
      </div>

      {/* Activity Log */}
      <ActivityLog projectId={id} />

      {/* Add Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
        <form onSubmit={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input required placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
          <textarea placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={3} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
          </div>
          <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
            <option value="">Assign to...</option>
            {project.members?.filter(m => m.role !== 'VIEWER').map(m => (
              <option key={m.userId} value={m.userId}>{m.name} ({m.role})</option>
            ))}
          </select>
          <button type="submit" style={{ padding: '10px', background: '#1e1b4b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Create Task
          </button>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Members">
        <form onSubmit={addMembers} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Emails (comma or new line separated)</label>
            <textarea placeholder="member1@example.com&#10;member2@example.com" value={memberEmails} onChange={e => setMemberEmails(e.target.value)} rows={3} required
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assign Role</label>
            <select value={memberRole} onChange={e => setMemberRole(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
              {canManageProject
                ? ROLES.filter(r => r !== 'OWNER').map(r => <option key={r} value={r}>{r}</option>)
                : ['MEMBER', 'VIEWER'].map(r => <option key={r} value={r}>{r}</option>)
              }
            </select>
          </div>
          <button type="submit" disabled={addingMembers} style={{ padding: '10px', background: '#1e1b4b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            {addingMembers ? 'Adding...' : 'Add Members'}
          </button>
          {addResult && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', fontSize: '13px' }}>
              {addResult.added.length > 0 && <p style={{ color: '#16a34a', margin: '0 0 4px' }}>✅ Added: {addResult.added.join(', ')}</p>}
              {addResult.pending.length > 0 && <p style={{ color: '#d97706', margin: '0 0 4px' }}>📧 Invite sent: {addResult.pending.join(', ')}</p>}
              {addResult.failed.length > 0 && <p style={{ color: '#dc2626', margin: 0 }}>⚠️ Failed: {addResult.failed.map(f => f.email).join(', ')}</p>}
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}