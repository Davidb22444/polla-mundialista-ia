import { useState } from 'react'
import { DB, showToast, calcularMarcador } from '../App.jsx'
import data from '../data/partidos.json'
import TeamFlag from '../components/TeamFlag.jsx'
import fondoGrupos from '../assets/fondo_grupos.jpg'

// Mapping from team names to their 3-letter codes
export const code3Map = {
  "México": "MEX",
  "Sudáfrica": "RSA",
  "Corea del Sur": "KOR",
  "Chequia": "CZE",
  "Canadá": "CAN",
  "Bosnia y Herzegovina": "BIH",
  "Qatar": "QAT",
  "Suiza": "SUI",
  "Brasil": "BRA",
  "Marruecos": "MAR",
  "Haití": "HAI",
  "Escocia": "SCO",
  "Estados Unidos": "USA",
  "Paraguay": "PAR",
  "Australia": "AUS",
  "Turquía": "TUR",
  "Alemania": "GER",
  "Curazao": "CUW",
  "Costa de Marfil": "CIV",
  "Ecuador": "ECU",
  "Países Bajos": "NED",
  "Japón": "JPN",
  "Suecia": "SWE",
  "Túnez": "TUN",
  "Bélgica": "BEL",
  "Egipto": "EGY",
  "Irán": "IRN",
  "Nueva Zelanda": "NZL",
  "España": "ESP",
  "Cabo Verde": "CPV",
  "Arabia Saudita": "SAU",
  "Uruguay": "URU",
  "Francia": "FRA",
  "Senegal": "SEN",
  "Irak": "IRQ",
  "Noruega": "NOR",
  "Argentina": "ARG",
  "Argelia": "ALG",
  "Austria": "AUT",
  "Jordania": "JOR",
  "Portugal": "POR",
  "Congo": "COD",
  "Uzbekistán": "UZB",
  "Colombia": "COL",
  "Inglaterra": "ENG",
  "Croacia": "CRO",
  "Ghana": "GHA",
  "Panamá": "PAN"
}

export function getTeamCode3(name) {
  return code3Map[name] || name?.substring(0, 3).toUpperCase()
}

// Teams that have a yellow star in the reference poster image
const starredTeams = new Set(["Curazao", "Cabo Verde", "Uzbekistán", "Jordania"])

// Group visual styling configuration to match the reference poster
const groupConfigs = {
  "Grupo A": { letter: "A", color: "#E2231A", foldColor: "#0066D4" }, // Red, Blue fold
  "Grupo B": { letter: "B", color: "#0066D4", foldColor: "#0B7F3C" }, // Blue, Green fold
  "Grupo C": { letter: "C", color: "#0B7F3C", foldColor: "#EF5A24" }, // Green, Orange fold
  "Grupo D": { letter: "D", color: "#EF5A24", foldColor: "#7F3FBF" }, // Orange, Purple fold
  "Grupo E": { letter: "E", color: "#7F3FBF", foldColor: "#D81B60" }, // Purple, Pink fold
  "Grupo F": { letter: "F", color: "#D81B60", foldColor: "#00A896" }, // Pink, Teal fold
  "Grupo G": { letter: "G", color: "#00A896", foldColor: "#F39C12" }, // Teal, Yellow fold
  "Grupo H": { letter: "H", color: "#F39C12", foldColor: "#3F51B5" }, // Yellow, Indigo fold
  "Grupo I": { letter: "I", color: "#3F51B5", foldColor: "#0B7F3C" }, // Indigo, Green fold
  "Grupo J": { letter: "J", color: "#009688", foldColor: "#E2231A" }, // Emerald, Red fold
  "Grupo K": { letter: "K", color: "#E64A19", foldColor: "#5D4037" }, // Red-Orange, Brown fold
  "Grupo L": { letter: "L", color: "#5D4037", foldColor: "#0066D4" }  // Brown, Blue fold
}

export function getGroupStandings(groupName, matches, userBets) {
  const groupMatches = matches.filter(m => m.grupo === groupName)
  const teamNames = new Set()
  groupMatches.forEach(m => {
    teamNames.add(m.local)
    teamNames.add(m.visitante)
  })

  const standings = {}
  teamNames.forEach(name => {
    standings[name] = {
      name,
      pts: 0,
      gf: 0,
      gc: 0,
      gd: 0,
      pj: 0,
      code: data.equipos[name]?.code || null
    }
  })

  groupMatches.forEach(match => {
    let localScore = null
    let visitorScore = null

    const prediction = userBets[match.id]
    if (prediction && prediction.local !== undefined && prediction.visitor !== undefined) {
      localScore = parseInt(prediction.local, 10)
      visitorScore = parseInt(prediction.visitor, 10)
    } else if (match.resLocal !== null && match.resVisitor !== null) {
      localScore = match.resLocal
      visitorScore = match.resVisitor
    }

    if (localScore !== null && visitorScore !== null && !isNaN(localScore) && !isNaN(visitorScore)) {
      const tLocal = standings[match.local]
      const tVisitor = standings[match.visitante]

      if (tLocal && tVisitor) {
        tLocal.pj += 1
        tVisitor.pj += 1

        tLocal.gf += localScore
        tLocal.gc += visitorScore
        tVisitor.gf += visitorScore
        tVisitor.gc += localScore

        if (localScore > visitorScore) {
          tLocal.pts += 3
        } else if (localScore < visitorScore) {
          tVisitor.pts += 3
        } else {
          tLocal.pts += 1
          tVisitor.pts += 1
        }
      }
    }
  })

  Object.values(standings).forEach(t => {
    t.gd = t.gf - t.gc
  })

  return Object.values(standings).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    const rankA = data.equipos[a.name]?.ranking || 100
    const rankB = data.equipos[b.name]?.ranking || 100
    return rankA - rankB
  })
}

export default function Grupos({ currentUser, matches, onMatchesChange }) {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [, forceUpdate] = useState(0)

  const refresh = () => forceUpdate(n => n + 1)
  const userData = DB.getUserData(currentUser)
  const userBets = userData.bets || {}

  // List of group names
  const groupNames = Object.keys(groupConfigs)

  const handleOpenGroup = (groupName) => {
    setSelectedGroup(groupName)
  }

  const handleCloseGroup = () => {
    setSelectedGroup(null)
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: `url(${fondoGrupos})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(4,12,24,0.75) 0%, rgba(6,18,36,0.68) 50%, rgba(4,12,24,0.80) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '80rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.25rem', fontWeight: 800, margin: 0, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          Fase de <span style={{ color: '#00a651' }}>Grupos</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Selecciona un grupo para registrar tus pronósticos de sus partidos y ver cómo cambia la tabla de posiciones en tiempo real.
        </p>
      </div>

      {/* Grid of groups */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}>
        {groupNames.map(groupName => {
          const config = groupConfigs[groupName]
          const standings = getGroupStandings(groupName, matches, userBets)

          return (
            <div
              key={groupName}
              onClick={() => handleOpenGroup(groupName)}
              className="group-card"
              style={{
                background: config.color,
                color: '#fff',
                borderRadius: '1.25rem',
                padding: '1.25rem 1.25rem 1.75rem',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
                minHeight: '14.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '0.5rem',
                marginBottom: '0.85rem'
              }}>
                <h3 style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  letterSpacing: '0.04em',
                  margin: 0
                }}>
                  GRUPO {config.letter}
                </h3>
              </div>

              {/* Team list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                flex: 1
              }}>
                {standings.map((team, idx) => {
                  const isStarred = starredTeams.has(team.name)
                  const code3 = getTeamCode3(team.name)
                  const isQualifier = idx < 2 // Top 2 qualify directly

                  return (
                    <div
                      key={team.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.55rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        {/* Circle Flag */}
                        <TeamFlag
                          code={team.code}
                          name={team.name}
                          style={{
                            width: '1.6rem',
                            height: '1.6rem',
                            borderRadius: '50%',
                            border: '1.5px solid rgba(255,255,255,0.4)',
                            flexShrink: 0
                          }}
                        />
                        {/* Code */}
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase'
                        }}>
                          {code3}
                        </span>
                        {/* Star */}
                        {isStarred && (
                          <span style={{ color: '#FFD633', fontSize: '0.9rem', lineHeight: 1 }} title="Destacado">★</span>
                        )}
                      </div>

                      {/* Stats badge (Pts / Goal diff) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {isQualifier && (
                          <span style={{
                            width: '0.45rem',
                            height: '0.45rem',
                            borderRadius: '50%',
                            background: '#4CAF50',
                            boxShadow: '0 0 8px rgba(76,175,80,0.6)'
                          }} title="Zona de clasificación" />
                        )}
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: 'rgba(255,255,255,0.15)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '0.4rem',
                          whiteSpace: 'nowrap'
                        }}>
                          {team.pts} pts ({team.gd >= 0 ? `+${team.gd}` : team.gd})
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Folder cut decoration */}
              <div
                className="group-card-fold"
                style={{
                  background: config.foldColor
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Match Predictor Modal */}
      {selectedGroup && (
        <GroupModal
          groupName={selectedGroup}
          currentUser={currentUser}
          matches={matches}
          userBets={userBets}
          onSave={refresh}
          onClose={handleCloseGroup}
        />
      )}
      </div>
    </div>
  )
}

function GroupModal({ groupName, currentUser, matches, userBets, onSave, onClose }) {
  const groupMatches = matches.filter(m => m.grupo === groupName)
  const config = groupConfigs[groupName]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(16, 42, 67, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '1rem'
    }} onClick={onClose}>
      <div
        style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '2rem',
          maxWidth: '44rem',
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 30px 60px rgba(16, 42, 67, 0.22)',
          border: '1px solid rgba(255,255,255,0.9)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--slate-200)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{
              background: config.color,
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 900,
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              GRUPO {config.letter}
            </span>
            <h3 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '1.35rem',
              fontWeight: 800,
              margin: '0.45rem 0 0',
              color: 'var(--slate-900)'
            }}>
              Pronósticos del Grupo
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--slate-100)',
              border: 0,
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              cursor: 'pointer',
              color: 'var(--slate-600)',
              fontWeight: 'bold',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.1rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--slate-100)'}
          >
            ✕
          </button>
        </div>

        {/* Match Form List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {groupMatches.map(match => (
            <ModalMatchCard
              key={match.id}
              match={match}
              currentUser={currentUser}
              userBet={userBets[match.id]}
              onSave={onSave}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ModalMatchCard({ match, currentUser, userBet, onSave }) {
  const [localScore, setLocalScore] = useState(userBet?.local !== undefined ? String(userBet.local) : '')
  const [visitorScore, setVisitorScore] = useState(userBet?.visitor !== undefined ? String(userBet.visitor) : '')
  const [betAmount, setBetAmount] = useState(userBet?.amount !== undefined ? String(userBet.amount) : '')

  const localTeam = data.equipos[match.local] || { nombre: match.local, code: null }
  const visitorTeam = data.equipos[match.visitante] || { nombre: match.visitante, code: null }

  const prediction = calcularMarcador(match.local, match.visitante)
  const isSaved = userBet !== undefined
  const hasResult = match.resLocal !== null && match.resVisitor !== null

  const handleSave = () => {
    const ls = parseInt(localScore, 10)
    const vs = parseInt(visitorScore, 10)
    const amount = parseInt(betAmount, 10)

    if (isNaN(ls) || isNaN(vs) || ls < 0 || vs < 0) {
      showToast('Ingresa marcadores válidos', '⚠️')
      return
    }

    const finalAmount = isNaN(amount) || amount < 0 ? 0 : amount
    const potentialWin = Math.round(finalAmount * 3)

    const userData = DB.getUserData(currentUser)
    userData.bets[match.id] = {
      local: ls,
      visitor: vs,
      amount: finalAmount,
      potentialWin
    }
    DB.saveUserData(userData)
    showToast('¡Pronóstico guardado!', '⚽')
    onSave()
  }

  const handleClear = () => {
    const userData = DB.getUserData(currentUser)
    delete userData.bets[match.id]
    DB.saveUserData(userData)
    setLocalScore('')
    setVisitorScore('')
    setBetAmount('')
    showToast('Apuesta eliminada', '🗑️')
    onSave()
  }

  return (
    <div style={{
      background: 'var(--slate-50)',
      border: '1px solid var(--slate-200)',
      borderRadius: '1.25rem',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Date / Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--slate-500)',
        marginBottom: '0.65rem'
      }}>
        <span>{match.fecha}</span>
        <span style={{
          color: hasResult ? 'var(--brand-500)' : isSaved ? '#4CAF50' : 'var(--slate-400)',
          background: hasResult ? 'rgba(0,102,245,0.08)' : isSaved ? 'rgba(76,175,80,0.08)' : 'rgba(0,0,0,0.04)',
          padding: '0.15rem 0.45rem',
          borderRadius: '0.4rem',
          fontSize: '0.68rem',
          textTransform: 'uppercase'
        }}>
          {hasResult ? `Resultado: ${match.resLocal}-${match.resVisitor}` : isSaved ? 'Guardado' : 'Pendiente'}
        </span>
      </div>

      {/* Oracle Prediction */}
      <div style={{
        position: 'absolute',
        top: '0.65rem',
        right: '6.5rem',
        fontSize: '0.68rem',
        background: '#fff',
        border: '1px solid var(--slate-200)',
        borderRadius: '999px',
        padding: '0.15rem 0.55rem',
        fontWeight: 800,
        color: 'var(--brand-600)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <span>💡 Oráculo: {prediction.golesLocal}-{prediction.golesVisitante}</span>
      </div>

      {/* Score input grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) auto minmax(0, 1.2fr)',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        {/* Local Team */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', justifyContent: 'flex-end', minWidth: 0 }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--slate-800)',
            textAlign: 'right',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {match.local}
          </span>
          <TeamFlag code={localTeam.code} name={match.local} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0 }} />
        </div>

        {/* Input center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <input
            type="number"
            min="0"
            max="9"
            disabled={hasResult}
            value={localScore}
            onChange={e => setLocalScore(e.target.value)}
            placeholder="0"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              fontWeight: 900,
              background: '#fff',
              border: '1.5px solid var(--slate-200)',
              borderRadius: '0.65rem',
              outline: 'none',
              color: 'var(--slate-900)'
            }}
          />
          <span style={{ fontWeight: 'bold', color: 'var(--slate-400)' }}>-</span>
          <input
            type="number"
            min="0"
            max="9"
            disabled={hasResult}
            value={visitorScore}
            onChange={e => setVisitorScore(e.target.value)}
            placeholder="0"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              fontWeight: 900,
              background: '#fff',
              border: '1.5px solid var(--slate-200)',
              borderRadius: '0.65rem',
              outline: 'none',
              color: 'var(--slate-900)'
            }}
          />
        </div>

        {/* Visitor Team */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', justifyContent: 'flex-start', minWidth: 0 }}>
          <TeamFlag code={visitorTeam.code} name={match.visitante} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--slate-800)',
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {match.visitante}
          </span>
        </div>
      </div>

      {/* Bet Amount and Action buttons */}
      {!hasResult && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          marginTop: '0.85rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--slate-200)'
        }}>
          {/* Bet input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Apuesta:</span>
            <input
              type="number"
              placeholder="Monto $"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              style={{
                background: '#fff',
                border: '1px solid var(--slate-200)',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            {isSaved && (
              <button
                onClick={handleClear}
                style={{
                  background: '#fff',
                  border: '1px solid rgba(239,83,80,0.4)',
                  color: '#ef5350',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
            )}
            <button
              onClick={handleSave}
              style={{
                background: 'var(--brand-500)',
                border: 0,
                color: '#fff',
                padding: '0.35rem 0.85rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,102,245,0.2)'
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
