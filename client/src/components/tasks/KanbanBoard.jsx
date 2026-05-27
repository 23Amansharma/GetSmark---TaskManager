import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Flag, User, Calendar, Trash2 } from 'lucide-react'
import CommentSection from './CommentSection'

const columns = [
  { id: 'TODO', title: 'To Do', color: '#f59e0b' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#3b82f6' },
  { id: 'DONE', title: 'Done', color: '#22c55e' },
]

const priorityColor = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

export default function KanbanBoard({ tasks, onStatusChange, onDelete, isAdmin }) {
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const onDragEnd = (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    onStatusChange(draggableId, destination.droppableId)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {columns.map(col => (
          <div key={col.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px' }}>
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{col.title}</span>
              </div>
              <span style={{ background: col.color + '20', color: col.color, borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
                {getTasksByStatus(col.id).length}
              </span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: '200px',
                    background: snapshot.isDraggingOver ? col.color + '10' : 'transparent',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                    padding: '4px'
                  }}
                >
                  {getTasksByStatus(col.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: 'white',
                            borderRadius: '10px',
                            padding: '14px',
                            marginBottom: '10px',
                            boxShadow: snapshot.isDragging
                              ? '0 8px 24px rgba(0,0,0,0.15)'
                              : '0 1px 4px rgba(0,0,0,0.06)',
                            border: '1px solid #e2e8f0',
                            cursor: 'grab',
                            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                            ...provided.draggableProps.style
                          }}
                        >
                          {/* Priority + Delete */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{
                              fontSize: '11px', fontWeight: '600',
                              padding: '2px 8px', borderRadius: '20px',
                              background: priorityColor[task.priority] + '20',
                              color: priorityColor[task.priority]
                            }}>
                              <Flag size={9} style={{ display: 'inline', marginRight: '3px' }} />
                              {task.priority}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (window.confirm(`Delete "${task.title}"?`)) onDelete(task.id)
                                }}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#cbd5e1', padding: '2px', borderRadius: '4px',
                                  display: 'flex', alignItems: 'center',
                                  transition: 'color 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                                title="Delete task"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {/* Title */}
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                            {task.title}
                          </p>

                          {/* Description */}
                          {task.description && (
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px', lineHeight: '1.4' }}>
                              {task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description}
                            </p>
                          )}

                          {/* Footer */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                            {task.assignedToName && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User size={11} /> {task.assignedToName}
                              </span>
                            )}
                            {task.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={11} /> {task.dueDate}
                              </span>
                            )}
                          </div>
                          <CommentSection taskId={task.id} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}