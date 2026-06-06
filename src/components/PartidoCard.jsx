import { useState } from 'react'
import data from '../data/partidos.json'
import { calcularMarcador, calculateMatchPoints } from '../App.jsx'
import OraculoIA from './OraculoIA.jsx'

const equipos = data.equipos

export default function PartidoCard({ match, userBet, onBet, onClear }) {
  const [localVal, setLocalVal] = useState('')
  const [visitorVal, setVisitorVal] = useState('')

  const localTeam   = equipos[match.local]    || { nombre: match.local,    bandera: '🏳️' }
  const visitorTeam = equipos[match.visitante] || { nombre: match.visitante, bandera: '🏳️' }
  const prediction  = calcularMarcador(match.local, match.visitante)
  const hasResult   = match.resLocal !== null && match.resVisitor !== null

  let pointsEarned = 0
  if (hasResult && userBet) {
    pointsEarned = calculateMatchPoints(userBet.local, userBet.visitor, match.resLocal, match.resVisitor)
  }

  const handleBet = () => {
    const lv = parseInt(localVal)
    const vv = parseInt(visitorVal)
    if (isNaN(lv) || isNaN(vv) || lv < 0 || vv < 0) return
    onBet(match.id, lv, vv)
    setLocalVal('')
    setVisitorVal('')
  }

  // ── Styles helpers ─────────────────────────────────────────
  const inputStyle = {
    width: '4rem', height: '3.5rem',
    textAlign: 'center',
    fontSize: '1.5rem', fontWeight: 700,
    background: 'var(--slate-50)',
    border: '2px solid var(--slate-200)',
    borderRadius: '0.75rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    color: 'var(--slate-800)',
  }

  // ── Result section ─────────────────────────────────────────
  let betSection = null

  if (hasResult) {
    const ptsColor = pointsEarned === 3
      ? { bg: 'rgba(16,185,129,0.08)', border: 'var(--brand-200)', text: 'var(--brand-700)' }
      : pointsEarned > 0
        ? { bg: 'rgba(245,158,11,0.08)', border: '#fde68a', text: '#92400e' }
        : { bg: 'var(--slate-50)', border: 'var(--slate-200)', text: 'var(--slate-500)' }
    const ptsIcon  = pointsEarned === 3 ? '🎯' : pointsEarned > 0 ? '✨' : '—'
    const ptsLabel = pointsEarned === 3 ? '¡Marcador Exacto!' : pointsEarned > 0 ? `${pointsEarned} punto${pointsEarned > 1 ? 's' : ''}` : 'Sin puntos'

    betSection = (
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resultado Final</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)' }}>{match.resLocal} - {match.resVisitor}</span>
        </div>
        {userBet ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: ptsColor.bg, border: `1px solid ${ptsColor.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{ptsIcon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: ptsColor.text }}>{ptsLabel}</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: ptsColor.text, opacity: 0.7 }}>Apostaste: {userBet.local}-{userBet.visitor}</span>
          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--slate-400)', padding: '0.5rem 0' }}>No realizaste apuesta</p>
        )}
      </div>
    )
  } else if (userBet) {
    betSection = (
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid var(--brand-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-700)' }}>Apuesta Confirmada</span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-800)' }}>{userBet.local} - {userBet.visitor}</span>
        </div>
        <button
          onClick={() => onClear(match.id)}
          style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--slate-400)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontFamily: 'inherit', padding: '0.25rem', borderRadius: '0.5rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--slate-400)'}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          Modificar pronóstico
        </button>
      </div>
    )
  } else {
    betSection = (
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{localTeam.nombre}</label>
            <input
              type="number" min="0" max="9"
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              placeholder="0"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--slate-200)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <span style={{ color: 'var(--slate-200)', fontSize: '1.5rem', fontWeight: 300, marginTop: '1.2rem' }}>-</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{visitorTeam.nombre}</label>
            <input
              type="number" min="0" max="9"
              value={visitorVal}
              onChange={e => setVisitorVal(e.target.value)}
              placeholder="0"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--slate-200)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>
        <button
          onClick={handleBet}
          className="animate-pulse-glow"
          style={{
            width: '100%', padding: '0.875rem',
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
            color: '#fff', border: 'none', borderRadius: '0.75rem',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            letterSpacing: '0.05em', fontFamily: 'inherit',
            transition: 'opacity 0.2s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          APOSTAR PRONÓSTICO
        </button>
      </div>
    )
  }

  // ── Card ───────────────────────────────────────────────────
  return (
    <div
      className="glass card-3d animate-fade-in-up"
      style={{ borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}
    >
      <OraculoIA golesLocal={prediction.golesLocal} golesVisitante={prediction.golesVisitante} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid var(--brand-100)' }}>{match.grupo}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {match.fecha}
        </span>
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <span className="animate-float" style={{ fontSize: '3rem', animationDelay: '0s' }}>{localTeam.bandera}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)', textAlign: 'center', lineHeight: 1.2 }}>{localTeam.nombre}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-300)', letterSpacing: '0.1em' }}>VS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <span className="animate-float" style={{ fontSize: '3rem', animationDelay: '1.5s' }}>{visitorTeam.bandera}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)', textAlign: 'center', lineHeight: 1.2 }}>{visitorTeam.nombre}</span>
        </div>
      </div>

      {betSection}
    </div>
  )
}
