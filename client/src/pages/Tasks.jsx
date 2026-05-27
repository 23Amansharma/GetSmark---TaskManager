import { useState, useEffect } from 'react'
import api from '../utils/api'
import TaskCard from '../components/tasks/TaskCard'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks/my')
      setTasks(res.data)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status })
    fetchTasks()
  }

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`)
    fetchTasks()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">All tasks assigned to you</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks yet"
          description="Tasks assigned to you will appear here."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {tasks.map(task => (
            <div key={task.id}>
              <TaskCard task={task} onDelete={deleteTask} />
              {/* Status Update */}
              <select
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={task.status}
                onChange={e => updateStatus(task.id, e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}