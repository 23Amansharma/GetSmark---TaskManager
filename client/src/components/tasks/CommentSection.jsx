import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import { Send, Trash2 } from 'lucide-react'

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => { fetchComments() }, [taskId])

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/task/${taskId}`)
      setComments(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await api.post(`/comments/task/${taskId}`, { content })
      setContent('')
      fetchComments()
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (commentId) => {
    await api.delete(`/comments/${commentId}`)
    fetchComments()
  }

  const formatTime = (dateTime) => {
    if (!dateTime) return ''
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
    }).format(new Date(dateTime))
  }

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
      <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', letterSpacing: '0.5px' }}>
        COMMENTS ({comments.length})
      </p>

      {/* Comments List */}
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center', padding: '16px' }}>No comments yet</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#1e1b4b', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', flexShrink: 0
              }}>
                {comment.userName?.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{comment.userName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTime(comment.createdAt)}</span>
                    {comment.userId === user?.id && (
                      <button onClick={() => deleteComment(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 0 }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.4' }}>{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={addComment} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write a comment..."
          style={{
            flex: 1, padding: '8px 12px',
            border: '1px solid #e2e8f0', borderRadius: '8px',
            fontSize: '13px', outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{
            padding: '8px 14px', background: '#1e1b4b',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}