import { useState } from 'react'
import { DB, showToast } from '../App.jsx'
import data from '../data/partidos.json'

const teams = Object.keys(data.equipos).filter(t => !t.match(/^[A-Z]\d+$/))

export default function ChampionBanner({ currentUser }) {
  const [predicted, setPredicted] = useState(() => DB.getPredictedChampion(currentUser))
  const [selected, setSelected] = useState('')

  if (predicted) {
    return (
      <div style={{
        background: 'var(--color-tarjeta, #ffffff)',
        borderRadius: '1.5rem',
        padding: '1.25rem 1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 16px 40px rgba(18,48,68,0.08)',
        flexWrap: 'wrap',
        border: '1px solid rgba(18,48,68,0.08)',
      }}>
        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
          background: '#fff7ed', display: 'grid', placeItems: 'center', fontSize: '2rem',
          border: '1px solid #fed7aa',
        }}>🏆</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 900, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tu pronóstico de campeón Mundial 2026
          </p>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--color-texto, #0f172a)', fontWeight: 900, fontSize: '1.5rem' }}>{predicted}</p>
        </div>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '1rem',
          padding: '0.6rem 1rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 900 }}>Bonus si aciertas</p>
          <p style={{ margin: 0, color: '#d97706', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>+10 pts</p>
        </div>
        <span style={{
          background: '#f1f5f9',
          color: '#64748b',
          fontSize: '0.72rem',
          fontWeight: 900,
          padding: '0.4rem 1rem',
          borderRadius: '999px',
          letterSpacing: '0.06em',
          border: '1px solid #e2e8f0',
        }}>🔒 Bloqueado</span>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--color-tarjeta, #ffffff)',
      border: '1px solid rgba(0,102,245,0.15)',
      borderRadius: '1.5rem',
      padding: '1.75rem',
      marginBottom: '2rem',
      boxShadow: '0 16px 40px rgba(18,48,68,0.08), 0 0 0 4px rgba(0,102,245,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '250px', height: '100%',
        background: 'radial-gradient(ellipse at right, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '1rem', flexShrink: 0,
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          display: 'grid', placeItems: 'center', fontSize: '2rem',
          boxShadow: '0 8px 16px rgba(245,158,11,0.15)',
          border: '1px solid #fde68a',
        }}>🏆</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <p style={{ margin: 0, fontWeight: 900, color: '#102a43', fontSize: '1.1rem', fontFamily: 'Syne, sans-serif' }}>
              ¡Pronostica al Campeón del Mundo!
            </p>
            <span style={{ background: '#f59e0b', color: 'var(--color-tarjeta, #fff)', fontSize: '0.68rem', fontWeight: 900, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
              NUEVO
            </span>
          </div>
          <p style={{ margin: 0, color: '#627d98', fontSize: '0.85rem' }}>
            Si aciertas al campeón, obtienes un <strong style={{ color: '#d97706' }}>bonus de +10 puntos</strong> extra. Confirma antes de que empiece el torneo.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            flex: '1 1 14rem',
            padding: '0.9rem 1.1rem',
            background: '#f8fafc',
            border: '1.5px solid rgba(18,48,68,0.12)',
            borderRadius: '0.9rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#102a43',
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#0066f5'
            e.target.style.boxShadow = '0 0 0 3px rgba(0,102,245,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(18,48,68,0.12)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <option value="">🌍 Selecciona un equipo...</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          disabled={!selected}
          onClick={() => {
            if (!selected) return
            DB.setPredictedChampion(currentUser, selected)
            setPredicted(selected)
            showToast(`🏆 ¡${selected} guardado como tu campeón!`, '🏆')
          }}
          style={{
            background: selected ? '#0066f5' : '#f1f5f9',
            color: selected ? '#fff' : '#94a3b8',
            border: 'none',
            padding: '0.9rem 2rem',
            borderRadius: '0.9rem',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            boxShadow: selected ? '0 8px 24px rgba(0,102,245,0.35)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Confirmar Campeón →
        </button>
      </div>
    </div>
  )
}
