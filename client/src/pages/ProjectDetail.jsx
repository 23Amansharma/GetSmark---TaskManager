import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [memberEmails, setMemberEmails] = useState('')
  const [addingMembers, setAddingMembers] = useState(false)
  const [addResult, setAddResult] = useState(null) // {added:[], pending:[], failed:[]}
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' })
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchProject()
    fetchTasks()
  }, [])

  const fetchProject = async () => {
    const response = await api.get('/projects')
    const found = response.data.find((entry) => entry.id === id)
    setProject(found)
  }

  const fetchTasks = async () => {
    const response = await api.get(`/tasks/project/${id}`)
    setTasks(response.data)
  }

  // ✅ FIX 1: Multiple emails support (comma/newline separated)
  const addMembers = async (event) => {
    event.preventDefault()
    setAddResult(null)
    setAddingMembers(true)

    // Parse emails — comma ya newline se split karo, trim + filter blanks
    const emails = memberEmails
      .split(/[\n,]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)

    if (emails.length === 0) {
      setAddingMembers(false)
      return
    }

    const result = { added: [], pending: [], failed: [] }

    // Each email ke liye sequentially API call karo
    for (const email of emails) {
      try {
        await api.post(`/projects/${id}/members`, { email })
        // Backend returns project — agar user registered tha toh directly added
        result.added.push(email)
      } catch (err) {
        const msg = err.response?.data?.message || ''
        if (msg.includes('already a member') || msg.includes('already')) {
          result.failed.push({ email, reason: 'Already a member' })
        } else if (msg.includes('invite') || msg.includes('Invite')) {
          // Invite bheja gaya — pending
          result.pending.push(email)
        } else {
          // Unregistered user — invite sent (backend sends invite for unregistered)
          result.pending.push(email)
        }
      }
    }

    setAddResult(result)
    setMemberEmails('')
    setAddingMembers(false)
    fetchProject()
  }

  const createTask = async (event) => {
    event.preventDefault()
    await api.post('/tasks', {
      ...taskForm,
      projectId: id,
      assignedTo: taskForm.assignedTo || null
    })
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' })
    setShowTaskForm(false)
    fetchTasks()
  }

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status })
    fetchTasks()
  }

  const statusColor = { TODO: '#faad14', IN_PROGRESS: '#1890ff', DONE: '#52c41a' }
  const priorityColor = { LOW: '#52c41a', MEDIUM: '#faad14', HIGH: '#ff4d4f' }

  if (!project) return <div style={{ padding: '20px' }}>Loading...</div>

  const currentMember = project.members?.find((member) => member.email === user?.email)
  const isAdmin = currentMember?.role === 'ADMIN'

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate('/projects')}>Back</button>
          <h2 style={{ display: 'inline', marginLeft: '10px' }}>{project.name}</h2>
        </div>
        {isAdmin && (
          <button style={styles.btn} onClick={() => setShowTaskForm(!showTaskForm)}>+ Add Task</button>
        )}
      </div>

      {!isAdmin && (
        <div style={styles.infoBanner}>
          You are a member on this project. You can view the project and update only the tasks assigned to you.
        </div>
      )}

      {/* ✅ TEAM MEMBERS SECTION */}
      <div style={styles.section}>
        <h3>Team Members ({project.members?.length || 0})</h3>
        <div style={styles.memberList}>
          {project.members?.map((member) => (
            <span key={member.userId} style={{
              ...styles.memberBadge,
              background: member.role === 'ADMIN' ? '#fff7e6' : '#e6f7ff',
              color: member.role === 'ADMIN' ? '#d46b08' : '#1890ff',
              border: member.role === 'ADMIN' ? '1px solid #ffd591' : '1px solid #91d5ff'
            }}>
              {member.role === 'ADMIN' ? '👑' : '👤'} {member.name} <span style={{ opacity: 0.6, fontSize: 11 }}>({member.role})</span>
            </span>
          ))}
        </div>

        {isAdmin && (
          <div style={{ marginTop: 16 }}>
            {/* ✅ FIX 1: Multi-email textarea */}
            <form onSubmit={addMembers}>
              <label style={styles.label}>
                Add Members by Email
                <span style={styles.labelHint}> (multiple emails? comma se alag karo ya ek per line)</span>
              </label>
              <textarea
                style={styles.textarea}
                placeholder={"member1@example.com\nmember2@example.com, member3@example.com"}
                value={memberEmails}
                onChange={(e) => setMemberEmails(e.target.value)}
                rows={3}
                required
              />
              <button style={{ ...styles.btn, marginTop: 8, opacity: addingMembers ? 0.7 : 1 }} type="submit" disabled={addingMembers}>
                {addingMembers ? 'Adding...' : '+ Add Members'}
              </button>
            </form>

            {/* ✅ FIX 3: Result feedback — added/pending/failed */}
            {addResult && (
              <div style={styles.resultBox}>
                {addResult.added.length > 0 && (
                  <div style={styles.resultRow}>
                    <span style={styles.successDot}>✅</span>
                    <span><strong>Added to project:</strong> {addResult.added.join(', ')}</span>
                  </div>
                )}
                {addResult.pending.length > 0 && (
                  <div style={styles.resultRow}>
                    <span style={styles.pendingDot}>📧</span>
                    <span>
                      <strong>Invite sent (Pending):</strong> {addResult.pending.join(', ')}
                      <br />
                      <span style={{ color: '#888', fontSize: 12 }}>
                        Ye log register nahi hain — inhe invitation email bhej diya gaya. Jab ye signup ya login karenge, automatically project mein add ho jayenge.
                      </span>
                    </span>
                  </div>
                )}
                {addResult.failed.length > 0 && (
                  <div style={styles.resultRow}>
                    <span style={styles.failDot}>⚠️</span>
                    <span>
                      {addResult.failed.map(f => `${f.email} (${f.reason})`).join(', ')}
                    </span>
                  </div>
                )}
                <button style={styles.dismissBtn} onClick={() => setAddResult(null)}>Dismiss</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && showTaskForm && (
        <div style={styles.section}>
          <h3>Create Task</h3>
          <form onSubmit={createTask}>
            <input
              style={styles.input}
              placeholder="Title"
              value={taskForm.title}
              onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
              required
            />
            <input
              style={styles.input}
              placeholder="Description"
              value={taskForm.description}
              onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
            />
            <input
              style={styles.input}
              type="date"
              value={taskForm.dueDate}
              onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
            />
            <select
              style={styles.input}
              value={taskForm.priority}
              onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select
              style={styles.input}
              value={taskForm.assignedTo}
              onChange={(event) => setTaskForm({ ...taskForm, assignedTo: event.target.value })}
            >
              <option value="">Assign to...</option>
              {project.members?.map((member) => (
                <option key={member.userId} value={member.userId}>{member.name}</option>
              ))}
            </select>
            <button style={styles.btn} type="submit">Create Task</button>
          </form>
        </div>
      )}

      <div style={styles.section}>
        <h3>Tasks ({tasks.length})</h3>
        {tasks.map((task) => {
          const canUpdateTask = isAdmin || task.assignedTo === currentMember?.userId

          return (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <div>
                  <span style={{ ...styles.badge, background: priorityColor[task.priority] }}>
                    {task.priority}
                  </span>
                  <select
                    style={{ ...styles.badge, background: statusColor[task.status], border: 'none', cursor: canUpdateTask ? 'pointer' : 'not-allowed', color: 'white' }}
                    value={task.status}
                    disabled={!canUpdateTask}
                    onChange={(event) => updateStatus(task.id, event.target.value)}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>
              {task.description && <p style={styles.taskDesc}>{task.description}</p>}
              <div style={styles.taskMeta}>
                {task.assignedToName && <span>Assigned: {task.assignedToName}</span>}
                {task.dueDate && <span>Due: {task.dueDate}</span>}
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && <p style={{ color: '#999' }}>No tasks available for your access level yet.</p>}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '20px', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 20px', borderRadius: '10px' },
  section: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px' },
  infoBanner: { marginBottom: '15px', padding: '14px 16px', borderRadius: '10px', background: '#fff7e6', color: '#ad6800', border: '1px solid #ffd591' },
  memberList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  memberBadge: { padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500 },
  label: { fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 },
  labelHint: { fontWeight: 400, color: '#888', fontSize: 12 },
  textarea: { width: '100%', padding: '10px 12px', border: '1.5px solid #d9d9d9', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  input: { width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' },
  btn: { padding: '9px 20px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  backBtn: { padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  taskCard: { border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '10px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  taskDesc: { color: '#666', fontSize: '14px', margin: '5px 0' },
  taskMeta: { display: 'flex', gap: '15px', color: '#999', fontSize: '13px', marginTop: '8px' },
  badge: { padding: '3px 10px', borderRadius: '12px', color: 'white', fontSize: '12px', marginLeft: '5px' },
  resultBox: { marginTop: 14, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '14px 16px' },
  resultRow: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, fontSize: 13, color: '#333' },
  successDot: { fontSize: 15, flexShrink: 0 },
  pendingDot: { fontSize: 15, flexShrink: 0 },
  failDot: { fontSize: 15, flexShrink: 0 },
  dismissBtn: { marginTop: 6, background: 'none', border: '1px solid #bbb', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#666' }
}
