import { useState } from 'react'
import Button from '../common/Button'

export default function ProjectForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Project Name *
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Enter project name"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="What is this project about?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <Button type="submit" loading={loading} fullWidth>
        Create Project
      </Button>
    </form>
  )
}