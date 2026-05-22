import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await api.get('/projects')
    setProjects(res.data)
  }

  const createProject = async (e) => {
    e.preventDefault()
    await api.post('/projects', form)
    setForm({ name: '', description: '' })
    setShowForm(false)
    fetchProjects()
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Projects</h2>
        <div>
          <button style={styles.btn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={{...styles.btn, background:'#52c41a'}} onClick={() => setShowForm(!showForm)}>
            + New Project
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3>Create Project</h3>
          <form onSubmit={createProject}>
            <input
              style={styles.input}
              placeholder="Project Name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <input
              style={styles.input}
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <button style={styles.btn} type="submit">Create</button>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {projects.map(p => (
          <div key={p.id} style={styles.card} onClick={() => navigate(`/projects/${p.id}`)}>
            <h3 style={styles.projectName}>{p.name}</h3>
            <p style={styles.desc}>{p.description}</p>
            <p style={styles.members}>👥 {p.members?.length || 0} members</p>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={styles.empty}>
          <p>No projects yet. Create your first project!</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding:'20px', background:'#f0f2f5', minHeight:'100vh' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', background:'white', padding:'15px 20px', borderRadius:'10px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'15px' },
  card: { background:'white', padding:'20px', borderRadius:'10px', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', borderTop:'4px solid #1890ff' },
  projectName: { color:'#1890ff', marginBottom:'8px' },
  desc: { color:'#666', fontSize:'14px', marginBottom:'10px' },
  members: { color:'#999', fontSize:'13px' },
  btn: { padding:'8px 16px', background:'#1890ff', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', marginLeft:'10px' },
  formCard: { background:'white', padding:'20px', borderRadius:'10px', marginBottom:'20px' },
  input: { width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ddd', boxSizing:'border-box' },
  empty: { textAlign:'center', background:'white', padding:'40px', borderRadius:'10px', color:'#999' }
}