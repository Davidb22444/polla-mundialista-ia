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
        background: 'rgba(248,250,252,0.94)',
        borderRadius: '1.5rem',
        padding: '1.25rem 1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 12px 34px rgba(15,23,42,0.16)',
        flexWrap: 'wrap',
        border: '1px solid rgba(226,232,240,0.9)',
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
          <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontWeight: 900, fontSize: '1.5rem' }}>{predicted}</p>
        </div>
        <div style={{
          background: '#fff',
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
      background: 'linear-gradient(135deg, rgba(20,30,60,0.97), rgba(40,20,80,0.95))',
      border: '2px solid #f59e0b',
      borderRadius: '1.5rem',
      padding: '1.75rem',
      marginBottom: '2rem',
      boxShadow: '0 0 0 4px rgba(245,158,11,0.12), 0 20px 50px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(16px)',
    }}>
      {/* Glowing header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '1rem', flexShrink: 0,
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          display: 'grid', placeItems: 'center', fontSize: '2rem',
          boxShadow: '0 8px 20px rgba(245,158,11,0.5)'
        }}>🏆</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <p style={{ margin: 0, fontWeight: 900, color: '#fbbf24', fontSize: '1.1rem', fontFamily: 'Syne, sans-serif' }}>
              ¡Pronostica al Campeón del Mundo!
            </p>
            <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.68rem', fontWeight: 900, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
              NUEVO
            </span>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
            Si aciertas al campeón, obtienes un <strong style={{ color: '#fbbf24' }}>bonus de +10 puntos</strong> extra. Confirma antes de que empiece el torneo.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            flex: '1 1 14rem',
            padding: '0.9rem 1.1rem',
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid rgba(245,158,11,0.5)',
            borderRadius: '0.9rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
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
            background: selected
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'rgba(255,255,255,0.1)',
            color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
            border: 'none',
            padding: '0.9rem 2rem',
            borderRadius: '0.9rem',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            boxShadow: selected ? '0 8px 24px rgba(245,158,11,0.45)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Confirmar Campeón →
        </button>
      </div>
    </div>
  )
}
