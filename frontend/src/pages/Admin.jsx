import { useState, useEffect, useRef } from 'react'
import { DB, calculateMatchPoints, buildStandings, showToast } from '../App.jsx'
import data from '../data/partidos.json'
import TeamFlag from '../components/TeamFlag.jsx'
import fondoAdmin from '../assets/fondo_admin.png'
import fondoAdminGlobal from '../assets/fondo_admin_global.webp'

const equipos = data.equipos

// ─── Chart (vanilla Chart.js) ───────────────────────────────────
function PointsChart({ users, matches }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const standings = buildStandings(users, matches)
    const labels = standings.map(s => s.name)
    const values = standings.map(s => s.totalPoints)

    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip }) => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['Sin datos'],
          datasets: [{
            label: 'Puntos',
            data: values.length ? values : [0],
            backgroundColor: 'rgba(16,185,129,0.6)',
            borderColor: 'rgba(16,185,129,1)',
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
            x: { grid: { display: false } }
          }
        }
      })
    })

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [users, matches])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

// ─── Match result row ────────────────────────────────────────────
function MatchRow({ match, users, onPublish }) {
  const [localVal, setLocalVal] = useState(match.resLocal !== null ? String(match.resLocal) : '')
  const [visitorVal, setVisitorVal] = useState(match.resVisitor !== null ? String(match.resVisitor) : '')

  const localTeam   = equipos[match.local]    || { nombre: match.local,    bandera: '🏳️' }
  const visitorTeam = equipos[match.visitante] || { nombre: match.visitante, bandera: '🏳️' }
  const hasResult   = match.resLocal !== null && match.resVisitor !== null

  const handlePublish = () => {
    const lv = parseInt(localVal), vv = parseInt(visitorVal)
    if (isNaN(lv) || isNaN(vv) || lv < 0 || vv < 0) {
      showToast('Ingresa resultados válidos', '⚠️')
      return
    }
    onPublish(match.id, lv, vv)
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'var(--color-tarjeta, #fff)', border: '1.5px solid var(--slate-200)',
    borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 700,
    textAlign: 'center', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div className="glass animate-fade-in-up" style={{ borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      {/* Teams header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <TeamBadge team={localTeam} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-300)' }}>VS</span>
          <TeamBadge team={visitorTeam} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '0.2rem 0.625rem', borderRadius: '0.5rem', border: '1px solid var(--brand-100)' }}>{match.grupo}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{match.fecha}</span>
          {hasResult
            ? <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-tarjeta, #fff)', background: 'var(--brand-500)', padding: '0.2rem 0.625rem', borderRadius: '0.5rem' }}>FINALIZADO</span>
            : <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '0.2rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>PENDIENTE</span>}
        </div>
      </div>

      {/* Result inputs */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--slate-100)', marginBottom: hasResult ? '1.25rem' : 0 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Goles {localTeam.nombre}</label>
          <input type="number" min="0" max="9" value={localVal} onChange={e => setLocalVal(e.target.value)} style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--slate-200)'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <div style={{ fontSize: '1.25rem', color: 'var(--slate-300)', fontWeight: 300, paddingBottom: '0.75rem' }}>-</div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Goles {visitorTeam.nombre}</label>
          <input type="number" min="0" max="9" value={visitorVal} onChange={e => setVisitorVal(e.target.value)} style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--slate-200)'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <button
          onClick={handlePublish}
          style={{ padding: '0.75rem 1.25rem', background: 'var(--color-primario, #0066f5)', color: 'var(--color-tarjeta, #fff)', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(15,23,42,0.2)', transition: 'background 0.2s, transform 0.1s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0052c7'}
          onMouseLeave={e => e.currentTarget.style.background = '#0066f5'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {hasResult ? 'Actualizar' : 'Publicar'}
        </button>
      </div>

      {/* Breakdown */}
      {hasResult && (
        <div>
          <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Desglose de Puntos
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
            {users.filter(u => u.bets[match.id]).map(user => {
              const bet = user.bets[match.id]
              const pts = calculateMatchPoints(bet.local, bet.visitor, match.resLocal, match.resVisitor)
              const style = pts === 3
                ? { bg: 'rgba(16,185,129,0.06)', border: 'var(--brand-200)', text: 'var(--brand-700)' }
                : pts > 0
                  ? { bg: 'rgba(245,158,11,0.06)', border: '#fde68a', text: '#92400e' }
                  : { bg: 'var(--slate-50)', border: 'var(--slate-200)', text: 'var(--slate-500)' }
              const icon = pts === 3 ? '🎯' : pts > 0 ? '✨' : '—'
              return (
                <div key={user.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${style.border}`, background: style.bg }}>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: style.text }}>{user.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7, color: style.text }}>{bet.local}-{bet.visitor}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: style.text }}>{icon} {pts} pts</span>
                  </div>
                </div>
              )
            })}
            {users.filter(u => u.bets[match.id]).length === 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', gridColumn: '1/-1' }}>Aún no hay apuestas para este partido.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TeamBadge({ team }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'var(--slate-50)', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--slate-100)' }}>
      <TeamFlag code={team.code} name={team.nombre} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-700)' }}>{team.nombre}</span>
    </div>
  )
}

// ─── Admin Page ──────────────────────────────────────────────────
export default function Admin({ matches, onMatchesChange }) {
  const users = DB.getUsers()

  const handlePublish = (matchId, lv, vv) => {
    const updated = matches.map(m => m.id === matchId ? { ...m, resLocal: lv, resVisitor: vv } : m)
    DB.saveMatches(updated)
    onMatchesChange(updated)
    showToast('Resultado publicado y puntos asignados', '🏆')
  }

  const handleReset = () => {
    if (confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) {
      try { localStorage.clear() } catch {}
      window.location.reload()
    }
  }

  const finishedCount = matches.filter(m => m.resLocal !== null).length
  const totalBets = users.reduce((sum, u) => sum + Object.keys(u.bets).length, 0)

  // ── Admin panel ──────────────────────────────────────────────
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: `url(${fondoAdminGlobal})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay para mantener la legibilidad de las tarjetas blancas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '64rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      {/* Header Banner */}
      <div style={{
        position: 'relative',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        marginBottom: '2rem',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
        backgroundImage: `url(${fondoAdmin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        minHeight: '26rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.2) 40%, rgba(15,23,42,0.95) 100%)',
          zIndex: 1
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--color-tarjeta, #fff)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Panel de <span style={{ color: '#00a651' }}>Control</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', marginTop: '0.35rem', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Gestiona resultados y monitorea el torneo.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleReset} style={{ padding: '0.6rem 1.1rem', background: 'rgba(220,38,38,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-tarjeta, #fff)', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform 0.2s', backdropFilter: 'blur(4px)' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>Resetear App</button>
            <button onClick={() => { localStorage.removeItem('polla-current-user'); window.location.reload(); }} style={{ padding: '0.6rem 1.1rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-tarjeta, #fff)', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(8px)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>Cerrar sesión</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '👥', label: 'Jugadores',   value: users.length,                      color: '#3b82f6' },
          { icon: '⚽', label: 'Finalizados', value: `${finishedCount}/${matches.length}`, color: 'var(--brand-500)' },
          { icon: '🎯', label: 'Apuestas',    value: totalBets,                          color: 'var(--gold-500)' },
        ].map(stat => (
          <div key={stat.label} className="glass animate-fade-in-up" style={{ borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--slate-800)' }}>{stat.value}</p>
            </div>
          </div>
        ))}
        <div className="glass animate-fade-in-up" style={{ borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', gridColumn: 'span 1' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Distribución de Puntos</p>
          <div style={{ height: '8rem' }}>
            <PointsChart users={users} matches={matches} />
          </div>
        </div>
      </div>

      {/* Match rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {matches.map(match => (
          <MatchRow key={match.id} match={match} users={users} onPublish={handlePublish} />
        ))}
      </div>
    </div>
    </div>
  )
}
