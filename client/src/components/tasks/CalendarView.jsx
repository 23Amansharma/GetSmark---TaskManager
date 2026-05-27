import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

const priorityColor = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }

export default function CalendarView({ tasks }) {
  const [current, setCurrent] = useState(new Date())

  const year = current.getFullYear()
  const month = current.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const due = new Date(task.dueDate)
      return due.getFullYear() === year &&
             due.getMonth() === month &&
             due.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={prevMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
          <ChevronLeft size={16} />
        </button>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e1b4b' }}>
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#94a3b8', padding: '4px' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dayTasks = getTasksForDay(day)
          const isOverdue = dayTasks.some(t => t.status !== 'DONE' && new Date(t.dueDate) < today)

          return (
            <div key={day} style={{
              minHeight: '70px', padding: '6px',
              borderRadius: '8px',
              border: isToday(day) ? '2px solid #6366f1' : '1px solid #f1f5f9',
              background: isToday(day) ? '#f5f3ff' : isOverdue ? '#fff5f5' : 'white',
              position: 'relative'
            }}>
              {/* Day number */}
              <div style={{
                fontSize: '12px', fontWeight: isToday(day) ? '700' : '500',
                color: isToday(day) ? '#6366f1' : '#374151',
                marginBottom: '4px'
              }}>
                {day}
              </div>

              {/* Tasks */}
              {dayTasks.slice(0, 2).map(task => (
                <div key={task.id} style={{
                  fontSize: '10px', padding: '2px 5px', borderRadius: '4px', marginBottom: '2px',
                  background: priorityColor[task.priority] + '20',
                  color: priorityColor[task.priority],
                  fontWeight: '600',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  textDecoration: task.status === 'DONE' ? 'line-through' : 'none'
                }}>
                  {task.title}
                </div>
              ))}

              {dayTasks.length > 2 && (
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                  +{dayTasks.length - 2} more
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        {Object.entries(priorityColor).map(([p, c]) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: c }} />
            {p}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f5f3ff', border: '1px solid #6366f1' }} />
          Today
        </div>
      </div>
    </div>
  )
}