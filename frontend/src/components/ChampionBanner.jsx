import { useState } from 'react'
import { DB, showToast } from '../App.jsx'
import data from '../data/partidos.json'

const teams = Object.keys(data.equipos)
  .filter(t => !t.match(/^[A-Z]\d$/))
  .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))

export default function ChampionBanner({ currentUser }) {
  const [predicted, setPredicted] = useState(() => DB.getPredictedChampion(currentUser))
  const [selected, setSelected] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (predicted) {
    return (
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1.25rem',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backdropFilter: 'blur(8px)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '1.8rem' }}>🏆</span>
        <div>
          <p style={{ margin: 0, fontWeight: 900, fontSize: '0.9rem', color: 'var(--slate-200)' }}>Tu pronóstico de Campeón</p>
          <p style={{ margin: '0.1rem 0 0', color: 'var(--slate-50)', fontWeight: 700, fontSize: '1.1rem' }}>{predicted}</p>
        </div>
        <span style={{
          marginLeft: 'auto',
          background: '#ffffff',
          color: 'var(--slate-800)',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.35rem 0.9rem',
          borderRadius: '999px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 6px 18px rgba(2,6,23,0.06)'
        }}>
          <span style={{ display: 'inline-block', width: '0.54rem', height: '0.54rem', borderRadius: '50%', background: 'rgba(15,23,42,0.08)', border: '1px solid rgba(15,23,42,0.04)' }} />
          BLOQUEADO · +10 pts
        </span>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,166,81,0.2), rgba(0,166,81,0.08))',
        border: '1px solid rgba(0,166,81,0.35)',
        borderRadius: '1.25rem',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontSize: '1.8rem' }}>✅</span>
        <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>¡Campeón guardado! Obtendrás <strong>+10 puntos bonus</strong> si aciertas.</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.85))',
      border: '1px solid rgba(243,156,18,0.4)',
      borderRadius: '1.25rem',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <div>
          <p style={{ margin: 0, fontWeight: 900, color: '#fbbf24', fontSize: '0.95rem' }}>¡Pronóstico del Campeón!</p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Elige el campeón del torneo ahora y obtén un bonus de +10 puntos si aciertas. Esta elección se bloqueará una vez confirmada.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '12rem' }}>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{
              width: '100%',
              padding: '0.78rem 1rem',
              paddingRight: '3rem',
              background: '#fff',
              border: '1px solid rgba(15,23,42,0.06)',
              borderRadius: '0.9rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0f172a',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(2,6,23,0.06)',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              transition: 'box-shadow 0.18s, transform 0.12s',
            }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(2,6,23,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onBlur={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(2,6,23,0.06)'; e.currentTarget.style.transform = 'none'; }}
          >
            <option value="" disabled>Selecciona un equipo...</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(15,23,42,0.6)', fontSize: '0.95rem' }}>▾</span>
        </div>
        <button
          disabled={!selected}
          onClick={() => {
            if (!selected) return
            DB.setPredictedChampion(currentUser, selected)
            setPredicted(selected)
            setConfirmed(true)
            showToast(`¡${selected} guardado como tu campeón!`, '🏆')
          }}
          style={{
            background: selected ? '#f59e0b' : '#e5e7eb',
            color: selected ? '#fff' : '#9ca3af',
            border: 'none',
            padding: '0.78rem 1.6rem',
            borderRadius: '0.95rem',
            fontWeight: 900,
            fontSize: '0.95rem',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease',
            boxShadow: selected ? '0 10px 28px rgba(245,158,11,0.22)' : 'none',
          }}
          onMouseEnter={e => { if (selected) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(245,158,11,0.26)'; e.currentTarget.style.background = '#f59e0b' } }}
          onMouseLeave={e => { if (selected) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(245,158,11,0.22)'; e.currentTarget.style.background = '#f59e0b' } }}
        >
          Confirmar Campeón
        </button>
      </div>
    </div>
  )
}
