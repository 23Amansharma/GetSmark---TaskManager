import { CheckSquare, FolderKanban, UserPlus } from 'lucide-react'

const iconMap = {
  task: <CheckSquare size={16} className="text-indigo-500" />,
  project: <FolderKanban size={16} className="text-green-500" />,
  member: <UserPlus size={16} className="text-blue-500" />,
}

export default function RecentActivity({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="flex flex-col gap-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-gray-50 rounded-lg">
              {iconMap[activity.type] || iconMap.task}
            </div>
            <div>
              <p className="text-sm text-gray-700">{activity.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}