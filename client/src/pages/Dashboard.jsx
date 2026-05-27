import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import NotificationBell from '../components/common/NotificationBell'
import { useAuth } from '../hooks/useAuth'
import './dashboard.css'

const REFRESH_INTERVAL = 30000

const PRIORITY_CLASS = {
  LOW: 'priority-low',
  
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high'
}

const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  OVERDUE: 'Overdue'
}

const PRIMARY_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', action: 'dashboard' },
  { key: 'projects', label: 'Projects', action: 'projects' },
  { key: 'tasks', label: 'My Tasks', action: 'tasks' }
]

const SECONDARY_NAV_ITEMS = [
  { key: 'team', label: 'Team' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' }
]

function formatDate(value) {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

function formatRelativeTime(value) {
  if (!value) return 'Recently'

  const now = Date.now()
  const diffMs = now - new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

function buildDonutBackground(items = []) {
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0)

  if (!total) {
    return 'conic-gradient(#dbe3ee 0deg 360deg)'
  }

  let currentAngle = 0
  const segments = items
    .filter((item) => item.count > 0)
    .map((item) => {
      const startAngle = currentAngle
      const sweep = (item.count / total) * 360
      currentAngle += sweep
      return `${item.color} ${startAngle}deg ${currentAngle}deg`
    })

  return `conic-gradient(${segments.join(', ')})`
}

function DashboardTrendChart({ trend = [] }) {
  if (!trend.length) {
    return <div className="dashboard-empty chart-empty">No trend data available yet.</div>
  }

  const width = 420
  const height = 220
  const chartLeft = 36
  const chartTop = 18
  const chartWidth = 324
  const chartHeight = 134
  const maxValue = Math.max(
    1,
    ...trend.flatMap((item) => [item.created || 0, item.completed || 0])
  )

  const getPoint = (value, index) => {
    const x = chartLeft + (chartWidth / Math.max(trend.length - 1, 1)) * index
    const y = chartTop + chartHeight - (value / maxValue) * chartHeight
    return `${x},${y}`
  }

  const createdPoints = trend.map((item, index) => getPoint(item.created || 0, index)).join(' ')
  const completedPoints = trend.map((item, index) => getPoint(item.completed || 0, index)).join(' ')
  const gridValues = Array.from(new Set([maxValue, Math.ceil(maxValue / 2), 0])).sort((a, b) => b - a)

  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tasks created and completed trend">
      {gridValues.map((value) => {
        const y = chartTop + chartHeight - (value / maxValue) * chartHeight
        return (
          <g key={value}>
            <line x1={chartLeft} x2={chartLeft + chartWidth} y1={y} y2={y} className="trend-grid-line" />
            <text x={6} y={y + 4} className="trend-grid-label">{value}</text>
          </g>
        )
      })}

      {trend.map((item, index) => {
        const x = chartLeft + (chartWidth / Math.max(trend.length - 1, 1)) * index
        return (
          <text key={item.label} x={x} y={height - 14} textAnchor="middle" className="trend-axis-label">
            {item.label}
          </text>
        )
      })}

      <polyline points={createdPoints} className="trend-line trend-line-created" />
      <polyline points={completedPoints} className="trend-line trend-line-completed" />

      {trend.map((item, index) => {
        const [createdX, createdY] = getPoint(item.created || 0, index).split(',')
        const [completedX, completedY] = getPoint(item.completed || 0, index).split(',')
        return (
          <g key={`${item.label}-points`}>
            <circle cx={createdX} cy={createdY} r="4.5" className="trend-point trend-point-created" />
            <circle cx={completedX} cy={completedY} r="4.5" className="trend-point trend-point-completed" />
          </g>
        )
      })}
    </svg>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const fetchDashboard = async (background = false) => {
    if (background) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await api.get('/dashboard')
      setData(response.data)
      setError('')
      setLastUpdated(new Date())
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load dashboard data right now.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard(false)

    const intervalId = setInterval(() => {
      fetchDashboard(true)
    }, REFRESH_INTERVAL)

    const handleWindowFocus = () => fetchDashboard(true)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboard(true)
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const summaryCards = [
    {
      label: 'Total Tasks',
      value: data?.totalTasks ?? 0,
      detail: 'All tasks in your visible workspace',
      accent: 'brand'
    },
    {
      label: 'To Do',
      value: data?.todo ?? 0,
      detail: 'Pending tasks',
      accent: 'amber'
    },
    {
      label: 'In Progress',
      value: data?.inProgress ?? 0,
      detail: 'Tasks in progress',
      accent: 'blue'
    },
    {
      label: 'Done',
      value: data?.done ?? 0,
      detail: 'Completed tasks',
      accent: 'green'
    },
    {
      label: 'Overdue',
      value: data?.overdue ?? 0,
      detail: 'Tasks needing attention',
      accent: 'red'
    },
    {
      label: 'Total Projects',
      value: data?.totalProjects ?? 0,
      detail: 'Projects you can access',
      accent: 'violet'
    }
  ]

  const displayName =
    data?.user?.firstName ||
    data?.user?.name ||
    user?.email?.split('@')[0] ||
    'there'

  const fullName =
    data?.user?.name ||
    user?.email?.split('@')[0] ||
    'Workspace member'

  const userEmail =
    data?.user?.email ||
    user?.email ||
    'member@example.com'

  const teamWorkload = data?.teamWorkload || data?.tasksPerUser || []
  const workloadMax = Math.max(
    1,
    ...(teamWorkload.map((item) => item.count || 0) || [1])
  )

  const handlePrimaryNavClick = (action) => {
    if (action === 'dashboard') navigate('/dashboard')
    if (action === 'projects') navigate('/projects')
    if (action === 'tasks') navigate('/tasks')
  }

  return (
    <div className="p-6">
      <div>
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-copy">
            <span className="dashboard-kicker">Task Manager Dashboard</span>
            <h1>Welcome back, {displayName}.</h1>
            <p>Here&apos;s what&apos;s happening with your tasks today.</p>
          </div>

          <div className="dashboard-actions">
            <NotificationBell />
            <div className="dashboard-sync-chip">
              <span>Updated</span>
              <strong>{lastUpdated ? formatDateTime(lastUpdated) : 'Loading...'}</strong>
            </div>
            <button type="button" className="action-btn action-btn-muted" onClick={() => fetchDashboard(Boolean(data))}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
           
          </div>
        </header>

        <div className="dashboard-meta">
          <span>
            Completion rate <strong>{data?.completionRate ?? 0}%</strong>
          </span>
          <span>
            My open tasks <strong>{data?.myOpenTasks ?? 0}</strong>
          </span>
        </div>

        {error && <div className="dashboard-alert">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Loading live dashboard...</div>
        ) : (
          <>
            <section className="stats-grid">
              {summaryCards.map((card) => (
                <article key={card.label} className={`stat-card stat-card-${card.accent}`}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.detail}</p>
                </article>
              ))}
            </section>

            <section className="dashboard-grid dashboard-grid-main">
              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>Task Overview</h2>
                    <p>Visual overview of tasks by status.</p>
                  </div>
                </div>

                <div className="overview-layout">
                  <div className="donut-wrap">
                    <div className="donut-ring" style={{ background: buildDonutBackground(data?.statusBreakdown) }}>
                      <div className="donut-core">
                        <strong>{data?.totalTasks ?? 0}</strong>
                        <span>Total</span>
                      </div>
                    </div>
                  </div>

                  <div className="status-list">
                    {data?.statusBreakdown?.map((item) => (
                      <div key={item.key} className="status-row">
                        <div className="status-name">
                          <i style={{ background: item.color }} />
                          <span>{item.label}</span>
                        </div>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>Tasks Trend</h2>
                    <p>Created versus completed over the last seven days.</p>
                  </div>
                  <div className="panel-legend">
                    <span><i className="legend-dot legend-created" />Created</span>
                    <span><i className="legend-dot legend-completed" />Completed</span>
                  </div>
                </div>
                <DashboardTrendChart trend={data?.taskTrend || []} />
              </article>

              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>Upcoming Deadlines</h2>
                    <p>Your next tasks that need attention.</p>
                  </div>
                </div>

                {data?.upcomingDeadlines?.length ? (
                  <div className="deadline-list">
                    {data.upcomingDeadlines.map((item) => (
                      <div key={item.id} className="deadline-item">
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.projectName}</span>
                        </div>
                        <div className="deadline-meta">
                          <span className={`priority-pill ${PRIORITY_CLASS[item.priority] || ''}`}>{item.priority || 'MEDIUM'}</span>
                          <time>{formatDate(item.dueDate)}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">No upcoming deadlines yet.</div>
                )}
              </article>
            </section>

            <section className="dashboard-grid dashboard-grid-secondary">
              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>My Upcoming Tasks</h2>
                    <p>Assigned work that should stay in your focus.</p>
                  </div>
                </div>

                {data?.myUpcomingTasks?.length ? (
                  <div className="task-table">
                    <div className="task-table-head">
                      <span>Task</span>
                      <span>Project</span>
                      <span>Priority</span>
                      <span>Due Date</span>
                      <span>Status</span>
                    </div>

                    {data.myUpcomingTasks.map((task) => (
                      <div key={task.id} className="task-table-row">
                        <span>{task.title}</span>
                        <span>{task.projectName}</span>
                        <span className={`priority-pill ${PRIORITY_CLASS[task.priority] || ''}`}>{task.priority}</span>
                        <span>{formatDate(task.dueDate)}</span>
                        <span className="status-pill">{STATUS_LABELS[task.status] || task.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">No assigned tasks with due dates right now.</div>
                )}
              </article>

              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>Recent Activity</h2>
                    <p>The latest changes visible from your workspace data.</p>
                  </div>
                </div>

                {data?.recentActivity?.length ? (
                  <div className="activity-list">
                    {data.recentActivity.map((item) => (
                      <div key={item.id} className="activity-item">
                        <div className={`activity-badge activity-${item.type}`}>
                          {item.type.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="activity-copy">
                          <strong>{item.title}</strong>
                          <span>{item.summary}</span>
                          <small>{item.projectName} | {formatRelativeTime(item.occurredAt)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">No recent activity found yet.</div>
                )}
              </article>
            </section>

            <section className="dashboard-grid dashboard-grid-tertiary">
              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>Project Pulse</h2>
                    <p>Completion and open work across your projects.</p>
                  </div>
                </div>

                {data?.projectSummaries?.length ? (
                  <div className="project-pulse-list">
                    {data.projectSummaries.map((project) => (
                      <div key={project.id} className="project-pulse-card">
                        <div className="project-pulse-head">
                          <div>
                            <strong>{project.name}</strong>
                            <span>{project.memberCount} members</span>
                          </div>
                          <div className="project-rate">{project.completionRate}%</div>
                        </div>
                        <div className="project-progress">
                          <i style={{ width: `${project.completionRate}%` }} />
                        </div>
                        <div className="project-pulse-foot">
                          <span>{project.totalTasks} tasks</span>
                          <span>{project.openTasks} open</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">Create a project to start seeing project health.</div>
                )}
              </article>

              <article className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h2>Tasks Per User</h2>
                    <p>How assigned work is distributed right now.</p>
                  </div>
                </div>

                {teamWorkload.length ? (
                  <div className="workload-list">
                    {teamWorkload.map((member) => (
                      <div key={member.name} className="workload-row">
                        <div className="workload-copy">
                          <strong>{member.name}</strong>
                          <span>{member.count} tasks</span>
                        </div>
                        <div className="workload-bar">
                          <i style={{ width: `${(member.count / workloadMax) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">Assign tasks to teammates to see workload balance.</div>
                )}
              </article>
            </section>
          </>
        )}
      </div>
    </div>
  )
}