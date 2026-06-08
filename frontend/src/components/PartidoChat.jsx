import { useState, useRef, useEffect } from 'react'

const COLORS = ['#00a651','#0066f5','#e11a27','#f39c12','#9b59b6','#e67e22','#1abc9c','#e74c3c']
function avatarColor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`
  return `hace ${Math.floor(diff/86400)} días`
}
function getComments(matchId) {
  try { const all = JSON.parse(localStorage.getItem('polla_comments') || '{}'); return all[matchId] || [] } catch { return [] }
}
function saveComment(matchId, comment) {
  try {
    const all = JSON.parse(localStorage.getItem('polla_comments') || '{}')
    all[matchId] = [...(all[matchId] || []), comment]
    localStorage.setItem('polla_comments', JSON.stringify(all))
  } catch {}
}

export default function PartidoChat({ matchId, currentUser }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState(() => getComments(matchId))
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, comments])

  const submit = () => {
    const t = text.trim()
    if (!t || !currentUser) return
    const c = { id: Date.now().toString(), author: currentUser, text: t, ts: new Date().toISOString() }
    saveComment(matchId, c)
    setComments(getComments(matchId))
    setText('')
  }

  const count = comments.length

  return (
    <div className="partido-chat" style={{ marginTop: '0' }}>
      {/* Toggle button */}
      <button
        className={open ? 'partido-chat-toggle partido-chat-toggle-open' : 'partido-chat-toggle'}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: open
            ? 'rgba(0,0,0,0.28)'
            : 'rgba(0,0,0,0.22)',
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.7rem 1rem',
          color: '#fff',
          fontSize: '0.82rem',
          fontWeight: 800,
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        {/* Chat icon */}
        <div className="partido-chat-icon" style={{
          width: '1.8rem', height: '1.8rem', borderRadius: '0.5rem', flexShrink: 0,
          background: open ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          color: '#fff',
          display: 'grid', placeItems: 'center',
          transition: 'all 0.2s',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>

        <span>
          {count > 0
            ? `${count} comentario${count !== 1 ? 's' : ''}`
            : 'Comentar este partido'}
        </span>

        <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '0.7rem' }}>
          {open ? '▲ Cerrar' : '▼ Abrir'}
        </span>
      </button>

      {/* Collapsible panel */}
      <div className="partido-chat-collapse" style={{
        overflow: 'hidden',
        maxHeight: open ? '22rem' : '0',
        transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div className="partido-chat-panel" style={{ padding: '0.75rem 1rem 1rem', background: 'rgba(0,0,0,0.25)' }}>

          {/* Comment list */}
          <div
            ref={listRef}
            style={{
              maxHeight: '12rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              marginBottom: '0.75rem',
              paddingRight: '0.25rem',
            }}
          >
            {comments.length === 0 ? (
              <div className="partido-chat-empty" style={{
                textAlign: 'center',
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                border: '1px dashed rgba(255,255,255,0.25)',
              }}>
                <p style={{ margin: 0, fontSize: '1.3rem' }}>💬</p>
                <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Sé el primero en comentar este partido...
                </p>
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className={c.author === currentUser ? 'partido-chat-message partido-chat-message-me' : 'partido-chat-message'} style={{
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'flex-start',
                  background: c.author === currentUser
                    ? 'rgba(255,255,255,0.18)'
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <div className="partido-chat-avatar" style={{
                    width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                    background: avatarColor(c.author),
                    display: 'grid', placeItems: 'center',
                    fontSize: '0.75rem', fontWeight: 900, color: '#fff',
                  }}>{c.author[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.15rem' }}>
                      <span className="partido-chat-author" style={{ fontSize: '0.78rem', fontWeight: 900, color: c.author === currentUser ? '#93c5fd' : '#fff' }}>
                        {c.author} {c.author === currentUser ? '(Tú)' : ''}
                      </span>
                      <span className="partido-chat-time" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>{timeAgo(c.ts)}</span>
                    </div>
                    <p className="partido-chat-text" style={{ margin: 0, fontSize: '0.83rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {c.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div className="partido-chat-form" style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="partido-chat-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Escribe un comentario..."
              maxLength={200}
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.6)'
                e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.25)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              className={text.trim() ? 'partido-chat-submit partido-chat-submit-ready' : 'partido-chat-submit'}
              onClick={submit}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                border: 'none',
                color: text.trim() ? '#102a43' : 'rgba(255,255,255,0.45)',
                borderRadius: '0.75rem',
                padding: '0.7rem 1.1rem',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 900,
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                transition: 'all 0.18s',
                boxShadow: text.trim() ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Enviar →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
