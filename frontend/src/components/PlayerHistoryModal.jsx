import { useMemo } from 'react'
import Pill from './Pill.jsx'

const COLORS = ['#00a651','#0066f5','#e11a27','#f39c12','#9b59b6','#34495e','#1abc9c','#d35400']
function avatarColor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}
function calcPts(bL, bV, rL, rV) {
  if (rL === null || rV === null) return null
  if (!bL === undefined || bV === undefined) return null
  if (bL === rL && bV === rV) return 3
  let p = 0
  const bR = bL > bV ? 'W' : bL < bV ? 'L' : 'D'
  const rR = rL > rV ? 'W' : rL < rV ? 'L' : 'D'
  if (bR === rR) p++
  if (bL === rL) p++
  if (bV === rV) p++
  return Math.min(3, p)
}

export default function PlayerHistoryModal({ player, matches, onClose }) {
  const userData = useMemo(() => {
    try { const users = JSON.parse(localStorage.getItem('polla_users') || '[]'); return users.find(u => u.name === player.name) || { bets: {} } } catch { return { bets: {} } }
  }, [player.name])

  const playedMatches = matches.filter(m => m.resLocal !== null && m.resVisitor !== null)

  // Build cumulative data for chart
  const chartData = useMemo(() => {
    let cum = 0
    return playedMatches.map(m => {
      const bet = userData.bets[m.id]
      const pts = bet ? calcPts(bet.local, bet.visitor, m.resLocal, m.resVisitor) : 0
      cum += (pts ?? 0)
      return { match: m, bet, pts: pts ?? 0, cum }
    })
  }, [playedMatches, userData])

  const maxCum = Math.max(...chartData.map(d => d.cum), 1)
  const W = 480, H = 140, PAD = 20

  const points = chartData.map((d, i) => {
    const x = chartData.length <= 1 ? W / 2 : PAD + (i / (chartData.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((d.cum / maxCum) * (H - PAD * 2))
    return { x, y, ...d }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const area = points.length > 0
    ? `M${points[0].x},${H - PAD} ` + points.map(p => `L${p.x},${p.y}`).join(' ') + ` L${points[points.length-1].x},${H-PAD} Z`
    : ''

  const color = avatarColor(player.name)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center',
        background: 'rgba(10,20,40,0.75)', backdropFilter: 'blur(8px)', padding: '1rem'
      }}
    >
      <div style={{
        background: 'var(--color-tarjeta, #fff)', borderRadius: 'var(--card-radius)', width: '100%', maxWidth: '42rem',
        maxHeight: '88vh', overflow: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,0,0,0.06)', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: color,
              display: 'grid', placeItems: 'center', color: 'var(--color-tarjeta, #fff)', fontWeight: 900, fontSize: '1.4rem'
            }}>{player.name[0].toUpperCase()}</div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800 }}>{player.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <Pill small variant="brand">{player.totalPoints} puntos</Pill>
                <Pill small style={{ background: 'var(--color-tarjeta, #fff)', color: '#d97706' }}>🎯 {player.exactScores} exactos</Pill>
                <Pill small style={{ background: 'var(--color-tarjeta, #fff)', color: '#64748b' }}>{player.betsMade} apuestas</Pill>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '2.2rem', height: '2.2rem', borderRadius: '0.6rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#64748b', display: 'grid', placeItems: 'center', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Chart */}
          {chartData.length > 0 ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Evolución de Puntos</h4>
              <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(f => {
                    const y = H - PAD - f * (H - PAD * 2)
                    return <line key={f} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  })}
                  {/* Area */}
                  <path d={area} fill="url(#chartGrad)" />
                  {/* Line */}
                  <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {/* Dots */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
                  ))}
                  {/* Y-axis max label */}
                  <text x={PAD - 4} y={PAD + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{maxCum}</text>
                  <text x={PAD - 4} y={H - PAD + 4} fontSize="9" fill="#94a3b8" textAnchor="end">0</text>
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>No hay partidos jugados aún.</div>
          )}

          {/* Match History Table */}
          {chartData.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Historial de Apuestas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {chartData.map(({ match, bet, pts }) => {
                  const ptColor = pts === 3 ? '#16a34a' : pts > 0 ? '#2563eb' : '#94a3b8'
                  const ptBg = pts === 3 ? '#dcfce7' : pts > 0 ? '#dbeafe' : '#f1f5f9'
                  return (
                    <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{match.local} vs {match.visitante}</span>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Resultado: <strong>{match.resLocal} - {match.resVisitor}</strong></span>
                          {bet ? <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tu apuesta: <strong>{bet.local} - {bet.visitor}</strong></span> : <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>Sin apuesta</span>}
                        </div>
                      </div>
                      <Pill small style={{ background: ptBg, color: ptColor, fontWeight: 900, fontSize: '0.78rem', padding: '0.25rem 0.6rem', flexShrink: 0 }}>{pts === 3 ? '🎯' : ''} +{pts} pt{pts !== 1 ? 's' : ''}</Pill>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
