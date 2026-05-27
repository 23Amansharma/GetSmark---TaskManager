import { Trash2, User, Calendar, Flag, Paperclip } from 'lucide-react'

const priorityColors = {
  HIGH: 'text-red-500 bg-red-50',
  MEDIUM: 'text-yellow-500 bg-yellow-50',
  LOW: 'text-green-500 bg-green-50',
}

export default function TaskCard({ task, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
          <Flag size={10} className="inline mr-1" />
          {task.priority || 'MEDIUM'}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        {/* Assigned To */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <User size={12} />
          <span>{task.assignedToName || 'Unassigned'}</span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {task.attachments?.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Paperclip size={12} />
            <span>{task.attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}