import { useNavigate } from 'react-router-dom'
import { Users, CheckSquare, Calendar } from 'lucide-react'

const colors = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
]

export default function ProjectCard({ project, index }) {
  const navigate = useNavigate()
  const gradient = colors[index % colors.length]

  return (
    <div
  onClick={() => navigate(`/projects/${project.id}`)}
  style={{ background: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444'][index % 5]}` }}
>
  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e1b4b', marginBottom: '8px' }}>{project.name}</h3>
  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{project.description || 'No description'}</p>
  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#9ca3af' }}>
    <span>👥 {project.memberCount || 0} members</span>
    <span>✅ {project.taskCount || 0} tasks</span>
  </div>
</div>
  )
}