import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectForm from '../components/projects/ProjectForm'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Plus } from 'lucide-react'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (form) => {
    setCreating(true)
    try {
      await api.post('/projects', form)
      setShowModal(false)
      fetchProjects()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your team projects</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          description="Create your first project and start collaborating with your team."
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Project
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
      >
        <ProjectForm onSubmit={createProject} loading={creating} />
      </Modal>
    </div>
  )
}