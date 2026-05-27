import { useState, useRef } from 'react'
import Button from '../common/Button'
import { Paperclip, X, FileText, Image, File } from 'lucide-react'

const priorities = ['LOW', 'MEDIUM', 'HIGH']

function getFileIcon(type) {
  if (type?.startsWith('image/')) return <Image size={14} className="text-blue-400" />
  if (type === 'application/pdf') return <FileText size={14} className="text-red-400" />
  return <File size={14} className="text-gray-400" />
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function TaskForm({ onSubmit, members = [], loading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: '',
  })
  const [attachments, setAttachments] = useState([])   // [{url, publicId, fileName, fileType, fileSize}]
  const [uploadingFiles, setUploadingFiles] = useState([]) // files being uploaded
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadError('')

    // Validate: max 5 attachments total, max 10MB each
    if (attachments.length + files.length > 5) {
      setUploadError('Maximum 5 attachments allowed')
      return
    }
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        setUploadError(`${f.name} is too large (max 10 MB)`)
        return
      }
    }

    setUploadingFiles(files.map(f => f.name))

    try {
      // 1. Get signed upload params from backend
      const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
      const token = localStorage.getItem('token')
      const signRes = await fetch(`${base}/upload/sign`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!signRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json()

      // 2. Upload each file directly to Cloudinary
      const uploaded = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', apiKey)
        fd.append('timestamp', timestamp)
        fd.append('signature', signature)
        fd.append('folder', folder)

        const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: fd
        })
        if (!upRes.ok) throw new Error(`Upload failed for ${file.name}`)
        const data = await upRes.json()

        uploaded.push({
          url: data.secure_url,
          publicId: data.public_id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      }

      setAttachments(prev => [...prev, ...uploaded])
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Try again.')
    } finally {
      setUploadingFiles([])
      e.target.value = ''
    }
  }

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (uploadingFiles.length > 0) return
    onSubmit({ ...form, attachments })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Task Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="Enter task title"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Task description..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Priority + Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {priorities.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Assign To */}
      {members.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Assign To</label>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select member</option>
            {members.map(m => (
              <option key={m.userId || m.id} value={m.userId || m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* File Attachments */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Attachments</label>
          <span className="text-xs text-gray-400">{attachments.length}/5 · max 10 MB each</span>
        </div>

        {/* Attached files list */}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {getFileIcon(att.fileType)}
                <span className="text-xs text-gray-700 flex-1 truncate">{att.fileName}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatBytes(att.fileSize)}</span>
                <button type="button" onClick={() => removeAttachment(idx)}
                  className="text-gray-300 hover:text-red-500 transition flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Uploading indicator */}
        {uploadingFiles.length > 0 && (
          <div className="text-xs text-indigo-500 mb-2 flex items-center gap-1">
            <span className="animate-spin inline-block w-3 h-3 border border-indigo-400 border-t-transparent rounded-full"></span>
            Uploading {uploadingFiles.join(', ')}...
          </div>
        )}

        {/* Error */}
        {uploadError && (
          <p className="text-xs text-red-500 mb-2">{uploadError}</p>
        )}

        {/* Upload button */}
        {attachments.length < 5 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles.length > 0}
              className="flex items-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-2 w-full hover:border-indigo-400 hover:text-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip size={15} />
              Attach files
            </button>
          </>
        )}
      </div>

      <Button type="submit" loading={loading || uploadingFiles.length > 0} fullWidth>
        Create Task
      </Button>
    </form>
  )
}