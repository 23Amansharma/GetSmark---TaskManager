import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/tasks/my').then(res => setTasks(res.data))
  }, [])

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status })
    const res = await api.get('/tasks/my')
    setTasks(res.data)
  }

  const statusColor = { TODO:'#faad14', IN_PROGRESS:'#1890ff', DONE:'#52c41a' }
  const priorityColor = { LOW:'#52c41a', MEDIUM:'#faad14', HIGH:'#ff4d4f' }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Tasks</h2>
        <button style={styles.btn} onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>

      {tasks.map(task => (
        <div key={task.id} style={styles.taskCard}>
          <div style={styles.taskHeader}>
            <h3 style={{margin:0}}>{task.title}</h3>
            <div>
              <span style={{...styles.badge, background: priorityColor[task.priority]}}>
                {task.priority}
              </span>
              <select
                style={{...styles.badge, background: statusColor[task.status], border:'none', cursor:'pointer', color:'white'}}
                value={task.status}
                onChange={e => updateStatus(task.id, e.target.value)}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          </div>
          {task.description && <p style={styles.desc}>{task.description}</p>}
          <div style={styles.meta}>
            {task.dueDate && <span>📅 Due: {task.dueDate}</span>}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div style={styles.empty}>No tasks assigned to you yet.</div>
      )}
    </div>
  )
}

const styles = {
  container: { padding:'20px', background:'#f0f2f5', minHeight:'100vh' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', background:'white', padding:'15px 20px', borderRadius:'10px' },
  taskCard: { background:'white', padding:'20px', borderRadius:'10px', marginBottom:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  taskHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' },
  desc: { color:'#666', fontSize:'14px' },
  meta: { color:'#999', fontSize:'13px', marginTop:'8px' },
  badge: { padding:'3px 10px', borderRadius:'12px', color:'white', fontSize:'12px', marginLeft:'5px' },
  btn: { padding:'8px 16px', background:'#1890ff', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' },
  empty: { textAlign:'center', background:'white', padding:'40px', borderRadius:'10px', color:'#999' }
}