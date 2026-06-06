import { useState } from 'react'
import data from '../data/partidos.json'

const colors = {
  green: '#88da88',
  coral: '#f96145',
  blue: '#2d78a3',
  ink: '#123044',
  paper: '#fbfffb',
}

export default function Inicio({ onLogin }) {
  const [customName, setCustomName] = useState('')

  const handleCustomLogin = () => {
    const name = customName.trim()
    if (!name) return
    onLogin(name)
    setCustomName('')
  }

  const players = data.usuariosPredefinidos || []
  const firstMatch = data.partidos?.[0]
  const localTeam = firstMatch ? data.equipos[firstMatch.local] : null
  const visitorTeam = firstMatch ? data.equipos[firstMatch.visitante] : null

  const inputStyle = {
    width: '100%',
    padding: '0.95rem 1rem',
    background: '#fff',
    border: '1.5px solid rgba(45,120,163,0.2)',
    borderRadius: '0.9rem',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: colors.ink,
    boxShadow: '0 10px 24px rgba(18,48,68,0.06)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const buttonBase = {
    border: 0,
    borderRadius: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease',
  }

  return (
    <div
      className="inicio-shell"
      style={{
        minHeight: '100vh',
        marginTop: '-72px',
        padding: '7rem 1rem 2rem',
        position: 'relative',
        overflow: 'hidden',
        background:
          `linear-gradient(135deg, rgba(136,218,136,0.28) 0%, rgba(255,255,255,0.96) 34%, rgba(45,120,163,0.16) 100%)`,
      }}
    >
      <div
        className="inicio-layout"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(45,120,163,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(45,120,163,0.08) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.58), transparent 78%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '34rem',
          height: '34rem',
          right: '-14rem',
          top: '-13rem',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.green} 0%, rgba(136,218,136,0) 68%)`,
          opacity: 0.72,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '25rem',
          height: '25rem',
          left: '-11rem',
          bottom: '-9rem',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(249,97,69,0.55) 0%, rgba(249,97,69,0) 70%)`,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '68rem',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(22rem, 0.82fr)',
          gap: '1.25rem',
          alignItems: 'stretch',
        }}
      >
        <section
          className="inicio-hero animate-fade-in-up"
          style={{
            minHeight: '34rem',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            position: 'relative',
            padding: '2rem',
            color: '#fff',
            background:
              `linear-gradient(145deg, rgba(18,48,68,0.96), rgba(45,120,163,0.9)), linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
            boxShadow: '0 28px 70px rgba(18,48,68,0.28)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                `linear-gradient(120deg, rgba(136,218,136,0.22), transparent 34%), linear-gradient(320deg, rgba(249,97,69,0.3), transparent 42%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '2rem',
              bottom: '2rem',
              width: '14rem',
              height: '14rem',
              border: '1.5rem solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '5rem',
              bottom: '5rem',
              width: '8rem',
              height: '8rem',
              border: '1px solid rgba(255,255,255,0.24)',
              borderRadius: '50%',
            }}
          />

          <div className="inicio-hero-content" style={{ position: 'relative', maxWidth: '34rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                alignSelf: 'flex-start',
                padding: '0.45rem 0.7rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.13)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '0.55rem', height: '0.55rem', borderRadius: '50%', background: colors.green, boxShadow: `0 0 0 5px rgba(136,218,136,0.18)` }} />
              Mundial 2026
            </div>

              <div className="inicio-title-block" style={{ marginTop: '3.25rem' }}>
              <h1
                style={{
                  fontFamily: 'Syne, sans-serif',
                  // Ajustado para que no se salga del “box” en pantallas pequeñas
                  fontSize: 'clamp(2.05rem, 5vw, 4.35rem)',
                  lineHeight: 0.92,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: 0,
                  whiteSpace: 'normal',
                }}
              >
                Polla Mundialista
              </h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', margin: '1.35rem 0 0', maxWidth: '31rem' }}>
                Pronostica marcadores, compite con tu grupo y deja que la IA te de una pista antes de cada partido.
              </p>
            </div>

            <div
              className="inicio-stats"
              style={{
                marginTop: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '0.75rem',
                maxWidth: '31rem',
              }}
            >
              {[
                ['Jugadores', players.length || 0],
                ['Partidos', data.partidos?.length || 0],
                ['Puntos', '3 max'],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '0.9rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.68)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <strong style={{ display: 'block', fontSize: '1.35rem' }}>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="inicio-login glass animate-fade-in-up"
          style={{
            borderRadius: '1.5rem',
            padding: '1.35rem',
            border: '1px solid rgba(255,255,255,0.84)',
            boxShadow: '0 28px 70px rgba(18,48,68,0.16)',
            background: 'rgba(255,255,255,0.84)',
          }}
        >
          <div style={{ padding: '0.8rem 0.8rem 1rem' }}>
            <div
              style={{
                width: '3.25rem',
                height: '3.25rem',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, ${colors.green}, ${colors.blue})`,
                boxShadow: '0 16px 30px rgba(45,120,163,0.24)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '1.1rem',
              }}
            >
              <span style={{ width: '1.45rem', height: '1.45rem', borderRadius: '50%', border: '4px solid #fff', display: 'block' }} />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', lineHeight: 1.05, fontWeight: 800, color: colors.ink, margin: 0 }}>
              Entra a jugar
            </h2>
            <p style={{ color: 'rgba(18,48,68,0.66)', lineHeight: 1.55, margin: '0.65rem 0 0', fontSize: '0.95rem' }}>
              Elige un jugador rapido o crea tu perfil para empezar tus pronosticos.
            </p>
          </div>

          {firstMatch && (
            <div
              style={{
                margin: '0.6rem 0.8rem 1.2rem',
                padding: '0.85rem',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, rgba(136,218,136,0.2), rgba(45,120,163,0.1))`,
                border: '1px solid rgba(45,120,163,0.14)',
              }}
            >
              <p style={{ margin: '0 0 0.55rem', color: colors.blue, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Primer duelo
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', justifyContent: 'space-between' }}>
                <TeamPill team={localTeam} fallback={firstMatch.local} />
                <span style={{ color: colors.coral, fontWeight: 900, fontSize: '0.78rem' }}>VS</span>
                <TeamPill team={visitorTeam} fallback={firstMatch.visitante} />
              </div>
            </div>
          )}

          <div style={{ padding: '0 0.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: colors.blue, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.7rem' }}>
              Jugadores rapidos
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem' }}>
              {players.map((user, index) => (
                <button
                  key={user}
                  onClick={() => onLogin(user)}
                  style={{
                    ...buttonBase,
                    minHeight: '3.35rem',
                    padding: '0.7rem',
                    background: '#fff',
                    color: colors.ink,
                    border: '1px solid rgba(45,120,163,0.13)',
                    boxShadow: '0 10px 24px rgba(18,48,68,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '0.65rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 16px 30px rgba(45,120,163,0.16)'
                    e.currentTarget.style.borderColor = colors.blue
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(18,48,68,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(45,120,163,0.13)'
                  }}
                >
                  <span
                    style={{
                      width: '2rem',
                      height: '2rem',
                      flex: '0 0 auto',
                      borderRadius: '0.7rem',
                      display: 'grid',
                      placeItems: 'center',
                      color: index % 3 === 1 ? '#fff' : colors.ink,
                      background: index % 3 === 0 ? colors.green : index % 3 === 1 ? colors.coral : 'rgba(45,120,163,0.18)',
                    }}
                  >
                    {user[0]}
                  </span>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '0.75rem', margin: '1.35rem 0.8rem' }}>
            <div style={{ height: 1, background: 'rgba(45,120,163,0.14)' }} />
            <span style={{ color: 'rgba(18,48,68,0.48)', fontSize: '0.76rem', fontWeight: 700 }}>o crea tu perfil</span>
            <div style={{ height: 1, background: 'rgba(45,120,163,0.14)' }} />
          </div>

          <div style={{ padding: '0 0.8rem 0.8rem', display: 'grid', gap: '0.7rem' }}>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomLogin()}
              placeholder="Tu nombre"
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = colors.blue
                e.target.style.boxShadow = '0 0 0 4px rgba(45,120,163,0.12), 0 10px 24px rgba(18,48,68,0.06)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(45,120,163,0.2)'
                e.target.style.boxShadow = '0 10px 24px rgba(18,48,68,0.06)'
              }}
            />
            <button
              onClick={handleCustomLogin}
              style={{
                ...buttonBase,
                minHeight: '3.25rem',
                padding: '0.9rem 1.1rem',
                background: `linear-gradient(135deg, ${colors.coral}, ${colors.blue})`,
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.95rem',
                boxShadow: '0 16px 30px rgba(249,97,69,0.24)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 20px 36px rgba(249,97,69,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 16px 30px rgba(249,97,69,0.24)'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)' }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1)' }}
            >
              Entrar
            </button>
          </div>
        </section>
      </div>

      <p style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'rgba(18,48,68,0.42)', fontSize: '0.78rem', margin: '1.35rem 0 0', fontWeight: 700 }}>
        2026 Polla Mundialista
      </p>

      <style>{`
        @media (max-width: 860px) {
          .inicio-shell {
            padding-top: 6rem !important;
          }

          .inicio-layout {
            grid-template-columns: 1fr !important;
          }

          .inicio-hero {
            min-height: 29rem !important;
          }
        }

        @media (max-width: 520px) {
          .inicio-shell {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }

          /* Título: evitar que se salga del hero en móvil */
          .inicio-hero .inicio-title-block h1 {
            font-size: 2.25rem !important;
            line-height: 0.95 !important;
          }

          .inicio-hero,
          .inicio-login {
            border-radius: 1.1rem !important;
          }

          .inicio-hero {
            padding: 1.25rem !important;
          }

          .inicio-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function TeamPill({ team, fallback }) {
  return (
    <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', color: colors.ink, fontWeight: 900 }}>
      <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{team?.bandera || ''}</span>
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.86rem' }}>
        {team?.nombre || fallback}
      </span>
    </div>
  )
}
