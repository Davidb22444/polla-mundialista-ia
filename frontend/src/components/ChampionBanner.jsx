import { useState } from 'react'
import { showToast } from '../App.jsx'
import data from '../data/partidos.json'

const teams = Object.keys(data.equipos).filter(t => !t.match(/^[A-Z]\d+$/))

export default function ChampionBanner({ currentUser, theme }) {
  const [predicted, setPredicted] = useState('')
  const [selected, setSelected] = useState('')

  // Colombia theme palette
  const col = {
    cardBg: 'linear-gradient(135deg, rgba(0,20,60,0.78) 0%, rgba(0,28,75,0.62) 100%)',
    cardBorder: '1px solid rgba(255,255,255,0.12)',
    cardShadow: '0 20px 45px rgba(0,0,0,0.25)',
    text: 'rgba(255,255,255,0.92)',
    subText: 'rgba(255,255,255,0.70)',
    inputBg: 'rgba(0,20,60,0.55)',
    inputBorder: '1.5px solid rgba(255,255,255,0.12)',
    inputText: '#ffffff',
    badgeBg: 'rgba(0,102,245,0.92)',
    badgeText: '#ffffff',
    buttonBg: 'rgba(0,102,245,0.92)',
    buttonHover: 'rgba(0,102,245,1)',
    buttonShadow: '0 8px 20px rgba(0,102,245,0.25)',
    accentBar: 'linear-gradient(90deg, #dca311 0%, #b91c28 50%, #0c3b88 100%)',
    trophyBg: 'linear-gradient(135deg, rgba(220, 163, 17, 0.2) 0%, rgba(220, 163, 17, 0.1) 100%)',
    trophyBorder: '1px solid rgba(220, 163, 17, 0.3)',
  }

  // Normal theme palette
  const normal = {
    cardBg: 'var(--color-tarjeta, #ffffff)',
    cardBorder: '1px solid rgba(0,102,245,0.15)',
    cardShadow: '0 16px 40px rgba(18,48,68,0.08), 0 0 0 4px rgba(0,102,245,0.05)',
    text: 'var(--color-texto, #0f172a)',
    subText: '#627d98',
    inputBg: '#f8fafc',
    inputBorder: '1.5px solid rgba(18,48,68,0.12)',
    inputText: '#102a43',
    badgeBg: '#f59e0b',
    badgeText: 'var(--color-tarjeta, #fff)',
    buttonBg: '#0066f5',
    buttonHover: '#0052c7',
    buttonShadow: '0 8px 24px rgba(0,102,245,0.35)',
    accentBar: 'radial-gradient(ellipse at right, rgba(245,158,11,0.08) 0%, transparent 70%)',
    trophyBg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    trophyBorder: '1px solid #fde68a',
  }

  const themeIsColombia = theme === 'colombia'
  const colors = themeIsColombia ? col : normal

  // SVG arrow encoded correctly as base64 to avoid repeat issues
  const arrowSvg = themeIsColombia
    ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23ffffff' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"
    : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23102a43' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"

  // Vista cuando ya hizo la predicción
  if (predicted) {
    return (
      <div style={{
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '1.5rem',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: colors.cardShadow,
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {themeIsColombia && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '3px',
            background: colors.accentBar
          }} />
        )}

        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
          background: colors.trophyBg,
          display: 'grid', placeItems: 'center', fontSize: '2rem',
          border: colors.trophyBorder,
          flexShrink: 0
        }}>
          🏆
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{
            margin: 0, fontWeight: 900, fontSize: '0.75rem',
            color: colors.subText, textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Tu pronóstico de campeón Mundial 2026
          </p>
          <p style={{
            margin: '0.2rem 0 0', color: colors.text,
            fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Syne, sans-serif'
          }}>
            {predicted}
          </p>
        </div>

        <div style={{
          background: themeIsColombia ? 'rgba(255,255,255,0.06)' : '#f8fafc',
          border: themeIsColombia ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
          borderRadius: '1rem', padding: '0.6rem 1rem', textAlign: 'center', minWidth: '120px'
        }}>
          <p style={{ margin: 0, color: colors.subText, fontSize: '0.75rem', fontWeight: 900 }}>
            Bonus si aciertas
          </p>
          <p style={{
            margin: 0, color: themeIsColombia ? '#dca311' : '#d97706',
            fontSize: '1.75rem', fontWeight: 900, lineHeight: 1
          }}>
            +10 pts
          </p>
        </div>

        <span style={{
          background: themeIsColombia ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
          color: colors.subText, fontSize: '0.72rem', fontWeight: 900,
          padding: '0.4rem 1rem', borderRadius: '999px', letterSpacing: '0.06em',
          border: themeIsColombia ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
        }}>
           Bloqueado
        </span>
      </div>
    )
  }

  // Vista para seleccionar campeón
  return (
    <div style={{
      background: colors.cardBg,
      border: colors.cardBorder,
      borderRadius: '1.5rem',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: colors.cardShadow,
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {themeIsColombia && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px', background: colors.accentBar
        }} />
      )}

      {!themeIsColombia && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '250px', height: '100%',
          background: colors.accentBar, pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        marginBottom: '1.5rem', position: 'relative', zIndex: 1
      }}>
        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
          flexShrink: 0, background: colors.trophyBg,
          display: 'grid', placeItems: 'center', fontSize: '2rem',
          boxShadow: themeIsColombia ? 'none' : '0 8px 16px rgba(245,158,11,0.15)',
          border: colors.trophyBorder,
        }}>
          🏆
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.25rem', flexWrap: 'wrap'
          }}>
            <p style={{
              margin: 0, fontWeight: 900, color: colors.text,
              fontSize: '1.25rem', fontFamily: 'Syne, sans-serif'
            }}>
              ¡Pronostica al Campeón del Mundo!
            </p>
            <span style={{
              background: colors.badgeBg, color: colors.badgeText,
              fontSize: '0.68rem', fontWeight: 900,
              padding: '0.2rem 0.6rem', borderRadius: '999px',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              NUEVO
            </span>
          </div>
          <p style={{ margin: 0, color: colors.subText, fontSize: '0.85rem', lineHeight: 1.5 }}>
            Si aciertas al campeón, obtienes un{' '}
            <strong style={{ color: themeIsColombia ? '#dca311' : '#d97706' }}>
              bonus de +10 puntos
            </strong>{' '}
            extra. Confirma antes de que empiece el torneo.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        position: 'relative', zIndex: 1, alignItems: 'stretch'
      }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            flex: '1 1 14rem',
            padding: '0.9rem 2.5rem 0.9rem 1.1rem',
            background: `${colors.inputBg} ${arrowSvg} no-repeat right 1rem center`,
            backgroundSize: '12px 8px',
            border: colors.inputBorder,
            borderRadius: '0.875rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: colors.inputText,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = themeIsColombia
              ? 'rgba(0,102,245,0.8)' : '#0066f5'
            e.target.style.boxShadow = themeIsColombia
              ? '0 0 0 3px rgba(0,102,245,0.2)' : '0 0 0 3px rgba(0,102,245,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = themeIsColombia
              ? 'rgba(255,255,255,0.12)' : 'rgba(18,48,68,0.12)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <option value="" style={{
            background: themeIsColombia ? '#00143c' : '#f8fafc',
            color: themeIsColombia ? '#ffffff' : '#102a43'
          }}>
            🌍 Selecciona un equipo...
          </option>
          {teams.map(t => (
            <option key={t} value={t} style={{
              background: themeIsColombia ? '#00143c' : '#ffffff',
              color: themeIsColombia ? '#ffffff' : '#102a43'
            }}>
              {t}
            </option>
          ))}
        </select>

        <button
          disabled={!selected}
          onClick={() => {
            if (!selected) return
            setPredicted(selected)
            showToast(`🏆 ¡${selected} guardado como tu campeón!`, '')
          }}
          style={{
            background: selected ? colors.buttonBg : (themeIsColombia ? 'rgba(255,255,255,0.08)' : '#f1f5f9'),
            color: selected ? '#ffffff' : (themeIsColombia ? 'rgba(255,255,255,0.4)' : '#94a3b8'),
            border: 'none',
            padding: '0.9rem 2rem',
            borderRadius: '0.875rem',
            fontWeight: 900,
            fontSize: '0.95rem',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            boxShadow: selected ? colors.buttonShadow : 'none',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (selected) {
              e.currentTarget.style.background = colors.buttonHover
              e.currentTarget.style.filter = 'brightness(1.05)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={e => {
            if (selected) {
              e.currentTarget.style.background = colors.buttonBg
              e.currentTarget.style.filter = 'none'
              e.currentTarget.style.transform = 'none'
            }
          }}
        >
          Confirmar Campeón →
        </button>
      </div>
    </div>
  )
}