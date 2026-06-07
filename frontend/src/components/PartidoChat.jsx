import { useState, useRef, useEffect } from 'react'

const COLORS = ['#00a651','#0066f5','#e11a27','#f39c12','#9b59b6','#34495e','#1abc9c','#d35400']
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
  try { const all = JSON.parse(localStorage.getItem('polla_comments') || '{}'); all[matchId] = [...(all[matchId] || []), comment]; localStorage.setItem('polla_comments', JSON.stringify(all)) } catch {}
}

export default function PartidoChat({ matchId, currentUser }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState(() => getComments(matchId))
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => { if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [open, comments])

  const submit = () => {
    const t = text.trim()
    if (!t || !currentUser) return
    const c = { id: Date.now().toString(), author: currentUser, text: t, ts: new Date().toISOString() }
    saveComment(matchId, c)
    setComments(getComments(matchId))
    setText('')
  }

  return (
    <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0', color: 'rgba(255,255,255,0.6)',
          fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit', transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {comments.length > 0 ? `${comments.length} comentario${comments.length !== 1 ? 's' : ''}` : 'Comentar'}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5 }}>{open ? '▲' : '▼'}</span>
      </button>

      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '22rem' : '0',
        transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div
          ref={listRef}
          style={{ maxHeight: '14rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem', paddingRight: '0.25rem' }}
        >
          {comments.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: '0.5rem 0', textAlign: 'center', fontStyle: 'italic' }}>Sé el primero en comentar...</p>
          ) : comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '1.65rem', height: '1.65rem', borderRadius: '50%', flex: '0 0 auto',
                background: avatarColor(c.author), display: 'grid', placeItems: 'center',
                fontSize: '0.65rem', fontWeight: 800, color: '#fff'
              }}>{c.author[0].toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{c.author}</span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{timeAgo(c.ts)}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.45, wordBreak: 'break-word' }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Escribe un comentario..."
            maxLength={200}
            style={{
              flex: 1, padding: '0.6rem 0.85rem',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.6rem', color: '#fff', fontSize: '0.82rem',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={submit}
            style={{
              background: '#00a651', border: 'none', color: '#fff',
              borderRadius: '0.6rem', padding: '0.6rem 0.9rem',
              cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem',
              fontFamily: 'inherit', transition: 'all 0.18s'
            }}
          >Enviar</button>
        </div>
      </div>
    </div>
  )
}
