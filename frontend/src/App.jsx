import { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import Pill from './components/Pill.jsx'
import './App.css'
import data from './data/partidos.json'
import Header from './components/Header.jsx'
import Inicio from './pages/Inicio.jsx'
import Admin from './pages/Admin.jsx'
import Grupos from './pages/Grupos.jsx'
import Salas from './pages/Salas.jsx'
import Eliminatorias from './pages/Eliminatorias.jsx'
import PartidoCard from './components/PartidoCard.jsx'
import PlayerHistoryModal from './components/PlayerHistoryModal.jsx'
import ChampionBanner from './components/ChampionBanner.jsx'
import fondoMundial from './assets/mundial.jpeg'
import fondoTabla from './assets/fondo_tabla.jpg'
import { AuthApi } from './api/auth.js'
import { MatchesApi } from './api/matches.js'
import { PredictionsApi } from './api/predictions.js'
import { RoomsApi } from './api/rooms.js'

// ─── Oracle ────────────────────────────────────────────────────
export function calcularMarcador(localName, visitorName) {
  const equipos = data.equipos
  const local = equipos[localName] || { ranking: 10, ataque: 70, defensa: 70 }
  const visitor = equipos[visitorName] || { ranking: 10, ataque: 70, defensa: 70 }
  const lA = local.ataque * 0.55, lR = Math.max(0, (21 - local.ranking)) * 2.5 * 0.25, lD = Math.max(0, (100 - visitor.defensa)) * 0.20
  const vA = visitor.ataque * 0.55, vR = Math.max(0, (21 - visitor.ranking)) * 2.5 * 0.25, vD = Math.max(0, (100 - local.defensa)) * 0.20
  return {
    golesLocal: Math.min(5, Math.max(0, Math.round(((lA + lR + lD) / 35) * 1.1))),
    golesVisitante: Math.min(5, Math.max(0, Math.round((vA + vR + vD) / 35))),
  }
}

// ─── Points ────────────────────────────────────────────────────
export function calculateMatchPoints(bL, bV, rL, rV) {
  if (rL === null || rV === null) return 0
  if (bL === rL && bV === rV) return 5
  const bRes = bL > bV ? 'W' : bL < bV ? 'L' : 'D'
  const rRes = rL > rV ? 'W' : rL < rV ? 'L' : 'D'
  if (bRes !== rRes) return 0
  const bGoalDiff = Math.abs(bL - bV)
  const rGoalDiff = Math.abs(rL - rV)
  if (bGoalDiff === rGoalDiff) return 3
  return 1
}

// ─── Toast ─────────────────────────────────────────────────────
let _setToast = null
export function showToast(msg, icon = '✅') {
  if (_setToast) _setToast({ msg, icon, key: Date.now() })
}

function Toast() {
  const [toast, setToast] = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { _setToast = setToast }, [])
  useEffect(() => {
    if (!toast) return
    const tStart = setTimeout(() => setVisible(true), 0)
    const tEnd = setTimeout(() => setVisible(false), 3000)
    return () => { clearTimeout(tStart); clearTimeout(tEnd) }
  }, [toast])
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
      background: 'rgba(15,23,42,0.95)', color: 'var(--color-tarjeta, #fff)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      transform: visible ? 'translateY(0)' : 'translateY(5rem)',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <span style={{ fontSize: '1.25rem' }}>{toast?.icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast?.msg}</span>
    </div>
  )
}

// ── Global Stats ──────────────────────────────────────────────
export function getGlobalStats(users, matches) {
  const playedMatches = matches.filter(m => m.resLocal !== null && m.resVisitor !== null)
  const stats = {}
  playedMatches.forEach(match => {
    const votes = { local: 0, draw: 0, visitor: 0, scores: {} }
    users.forEach(user => {
      const bet = user.bets[match.id]
      if (!bet) return
      if (bet.local > bet.visitor) votes.local++
      else if (bet.local === bet.visitor) votes.draw++
      else votes.visitor++
      const key = `${bet.local}-${bet.visitor}`
      votes.scores[key] = (votes.scores[key] || 0) + 1
    })
    const topScore = Object.entries(votes.scores).sort((a, b) => b[1] - a[1])[0]
    stats[match.id] = { ...votes, topScore: topScore ? topScore[0] : null }
  })
  matches.forEach(match => {
    if (stats[match.id]) return
    const votes = { local: 0, draw: 0, visitor: 0, scores: {} }
    users.forEach(user => {
      const bet = user.bets[match.id]
      if (!bet) return
      if (bet.local > bet.visitor) votes.local++
      else if (bet.local === bet.visitor) votes.draw++
      else votes.visitor++
      const key = `${bet.local}-${bet.visitor}`
      votes.scores[key] = (votes.scores[key] || 0) + 1
    })
    const topScore = Object.entries(votes.scores).sort((a, b) => b[1] - a[1])[0]
    stats[match.id] = { ...votes, topScore: topScore ? topScore[0] : null }
  })
  return stats
}

const ACHIEVEMENTS = [
  { id: 'iniciado', label: 'Iniciado', icon: '🎯', desc: 'Primera apuesta', check: (s) => s.betsMade >= 1 },
  { id: 'veterano', label: 'Veterano', icon: '', desc: '10+ apuestas', check: (s) => s.betsMade >= 10 },
  { id: 'adivino', label: 'Adivino', icon: '🔮', desc: '3+ marcadores exactos', check: (s) => s.exactScores >= 3 },
  { id: 'hattrick', label: 'Hat-trick', icon: '🎩', desc: 'Racha de 3 aciertos', check: (s) => s.maxStreak >= 3 },
  { id: 'oraculo', label: 'Oráculo', icon: '⚡', desc: '5+ marcadores exactos', check: (s) => s.exactScores >= 5 },
]

// ─── Standings logic ───────────────────────────────────────────
export function buildStandings(users, matches) {
  const tournamentChampion = ''
  return users.map(user => {
    let totalPoints = 0, betsMade = 0, exactScores = 0, trendencyScores = 0
    let maxStreak = 0, tempStreak = 0
    const playedMatches = matches.filter(m => m.resLocal !== null && m.resVisitor !== null)
    playedMatches.forEach(match => {
      const bet = user.bets[match.id]
      if (!bet) { tempStreak = 0; return }
      betsMade++
      const pts = calculateMatchPoints(bet.local, bet.visitor, match.resLocal, match.resVisitor)
      totalPoints += pts
      if (pts === 5) exactScores++
      if (pts === 3) trendencyScores++
      if (pts > 0) {
        tempStreak++
        if (tempStreak > maxStreak) maxStreak = tempStreak
      } else {
        tempStreak = 0
      }
    })
    const currentStreak = tempStreak
    const predictedChamp = ''
    const champBonus = tournamentChampion && predictedChamp === tournamentChampion ? 10 : 0
    totalPoints += champBonus
    const stats = { betsMade, exactScores, totalPoints, currentStreak, maxStreak, predictedChamp, champBonus }
    const achievements = ACHIEVEMENTS.filter(a => a.check(stats))
    return { name: user.name, betsMade, exactScores, trendencyScores, totalPoints, currentStreak, maxStreak, predictedChamp, champBonus, achievements }
  }).sort((a, b) =>
    b.totalPoints - a.totalPoints ||
    b.exactScores - a.exactScores ||
    b.trendencyScores - a.trendencyScores ||
    a.name.localeCompare(b.name)
  )
}

// ─── Tabla de Posiciones ────────────────────────────────────────
function Tabla({ currentUser, matches, users, refreshKey: _refreshKey }) {
  const standings = buildStandings(users, matches)
  const top3 = standings.slice(0, 3)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [null, top3[0], top3[1]] : [null, top3[0], null]
  const podiumClasses = ['podium-2', 'podium-1', 'podium-3']
  const podiumHeights = ['8rem', '10rem', '6rem']
  const podiumLabels = ['2°', '1°', '3°']
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      backgroundImage: `var(--bg-tabla, url(${fondoTabla}))`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,10,20,0.78) 0%, rgba(8,16,32,0.70) 50%, rgba(5,10,20,0.82) 100%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '64rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.875rem', fontWeight: 800, margin: 0 }}>
            Tabla de <span style={{ color: 'var(--slate-500)' }}>Posiciones</span>
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Haz clic en un jugador para ver su historial y gráfica de puntos.</p>
        </div>
        {top3.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {podiumOrder.map((player, idx) => !player ? <div key={idx} /> : (
              <div key={player.name} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', animationDelay: `${idx * 0.1}s` }}>
                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--color-tarjeta, #fff)', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '0 auto 0.5rem' }}>{player.name[0]}</div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: '0 0 0.2rem', color: 'var(--slate-800)' }}>{player.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', margin: 0 }}>{player.totalPoints} pts</p>
                  {player.currentStreak >= 2 && <span className="streak-badge" style={{ marginTop: '0.25rem' }}>🔥 {player.currentStreak} seguidos</span>}
                </div>
                <div className={podiumClasses[idx]} style={{ width: '100%', height: podiumHeights[idx], borderRadius: '0.75rem 0.75rem 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>{podiumLabels[idx]}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass standings-table-card" style={{ borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="standings-table-head" style={{ background: 'rgba(248,250,252,0.8)', borderBottom: '1px solid var(--slate-200)' }}>
                  {['#', 'Jugador', 'Racha', 'Logros', 'Exactos', 'Puntos'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Jugador' || h === '#' ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.875rem' }}>Aún no hay jugadores registrados.</td></tr>
                )}
                {standings.map((player, i) => {
                  const isMe = player.name === currentUser
                  return (
                    <tr
                      key={player.name}
                      onClick={() => setSelectedPlayer(player)}
                      className={isMe ? 'standings-row standings-row-me' : 'standings-row'}
                      style={{ background: isMe ? 'rgba(16,185,129, 0.04)' : 'transparent', borderBottom: '1px solid var(--slate-100)', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = isMe ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = isMe ? 'rgba(16,185,129,0.04)' : 'transparent'}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {i < 3 ? <span style={{ fontSize: '1.1rem' }}>{['','🥈','🥉'][i]}</span> : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--slate-100)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>{i + 1}</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', flexShrink: 0 }}>{player.name[0]}</div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{player.name}</span>
                              {isMe && <Pill small variant="brand">Tú</Pill>}
                            </div>
                            {player.champBonus > 0 && <span style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 700 }}>🏆 +{player.champBonus} bonus campeón</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {player.currentStreak >= 2 ? <span className="streak-badge">🔥 {player.currentStreak}</span> : <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {player.achievements?.map(a => <span key={a.id} className="badge-chip" title={a.desc}>{a.icon} {a.label}</span>)}
                          {(!player.achievements || player.achievements.length === 0) && <span style={{ color: 'var(--slate-300)', fontSize: '0.75rem' }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold-600)' }}>{player.exactScores} 🎯</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <Pill small variant="brand">{player.totalPoints} pts</Pill>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPlayer && (
        <PlayerHistoryModal player={selectedPlayer} matches={matches} users={users} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  )
}

// ─── Partidos View ──────────────────────────────────────────────
function formatDayLabel(isoDate) {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  const label = date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function Partidos({ currentUser, matches, users, onMatchesChange, currentSession, theme }) {
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const dayOptions = [...new Set(matches.map(match => match.dia))].sort()
  const dayMin = dayOptions[0] || ''
  const dayMax = dayOptions[dayOptions.length - 1] || ''
  const groups = [...new Set(matches.map(m => m.grupo).filter(Boolean))].sort()
  const globalStats = getGlobalStats(users, matches)

  useEffect(() => {
    const userData = users.find(u => u.name === currentUser) || { bets: {} }
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0]
    const needsBet = matches.find(m => {
      if (m.resLocal !== null) return false
      if (m.dia !== todayStr && m.dia !== tomorrow) return false
      return !userData.bets[m.id]
    })
    if (needsBet) {
      setTimeout(() => showToast(`⏰ ¡Recuerda apostar! ${needsBet.local} vs ${needsBet.visitante} se juega pronto`, '⏰'), 800)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let filteredMatches = matches
  if (selectedDay) filteredMatches = filteredMatches.filter(m => m.dia === selectedDay)
  if (selectedGroup) filteredMatches = filteredMatches.filter(m => m.grupo === selectedGroup)

  const handleBet = async (matchId, localVal, visitorVal) => {
    await PredictionsApi.createOrUpdatePrediction({ user_id: currentSession?.user?.id, match_id: matchId, pred_goles_local: localVal, pred_goles_visitante: visitorVal })
    onMatchesChange()
    showToast('¡Pronóstico guardado!', '⚽')
  }

  const handleClear = async (matchId) => {
    await PredictionsApi.deletePrediction(currentSession?.user?.id, matchId)
    onMatchesChange()
    showToast('Apuesta eliminada', '️')
  }

  const userData = users.find(u => u.name === currentUser) || { bets: {} }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundImage: `var(--bg-partidos, url(${fondoMundial}))`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,15,30,0.72) 0%, rgba(8,20,45,0.65) 50%, rgba(5,15,30,0.78) 100%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '80rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
        <ChampionBanner currentUser={currentUser} theme={theme} />
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.875rem', fontWeight: 800, margin: 0, color: 'var(--color-tarjeta, #fff)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                Partidos <span style={{ color: '#00a651' }}>en Vivo</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Selecciona la fecha y revisa qué partidos de la fase de grupos se juegan ese día.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.65rem 1rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#4ade80', animation: 'pulseGlow 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-tarjeta, #fff)' }}>Sistema de predicción activo</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Fecha</span>
            <input type="date" value={selectedDay} min={dayMin} max={dayMax} onChange={(e) => setSelectedDay(e.target.value)} style={{ border: '1px solid rgba(45,120,163,0.18)', background: 'var(--color-tarjeta, #fff)', color: 'var(--slate-700)', borderRadius: '1rem', padding: '0.85rem 1rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Grupo</span>
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} style={{ border: '1px solid rgba(45,120,163,0.18)', background: 'var(--color-tarjeta, #fff)', color: 'var(--slate-700)', borderRadius: '1rem', padding: '0.85rem 1rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}>
              <option value="">Todos los grupos</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {(selectedDay || selectedGroup) && (
              <button type="button" onClick={() => { setSelectedDay(''); setSelectedGroup('') }} style={{ border: '1px solid rgba(0,166,81,0.16)', background: '#00a651', color: 'var(--color-tarjeta, #fff)', borderRadius: '999px', padding: '0.55rem 0.95rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                Mostrar todos
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
            {selectedDay ? `Mostrando ${filteredMatches.length} partido(s) para ${formatDayLabel(selectedDay)}.` : `Mostrando ${matches.length} partidos de la fase de grupos.`}
          </p>
          {selectedDay && (
            <button type="button" onClick={() => setSelectedDay('')} style={{ border: '1px solid rgba(0,102,245,0.16)', background: 'var(--color-primario, #0066f5)', color: 'var(--color-tarjeta, #fff)', borderRadius: '999px', padding: '0.55rem 0.95rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
              Ver todo el calendario
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '0.75rem' }}>
          {filteredMatches.map((match, i) => (
            <PartidoCard
              key={match.id}
              index={i}
              match={match}
              userBet={userData.bets[match.id]}
              onBet={handleBet}
              onClear={handleClear}
              currentUser={currentUser}
              matchStats={globalStats[match.id]}
            />
          ))}
          {filteredMatches.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '1.25rem', background: 'rgba(248,250,252,0.9)', textAlign: 'center', color: 'var(--slate-500)' }}>
              No hay partidos programados para esta fecha o grupo.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── App ────────────────────────────────────────────────────────
export default function App() {
  const [currentSession, setCurrentSession] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [view, setView] = useState('login')
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [showGuide, setShowGuide] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const [temaActual, setTemaActual] = useState(() => localStorage.getItem('tema-polla') || 'default')

  useLayoutEffect(() => {
    if (view === 'login' || view === 'admin') {
      document.documentElement.setAttribute('data-theme', 'default')
    } else {
      document.documentElement.setAttribute('data-theme', temaActual)
    }
    localStorage.setItem('tema-polla', temaActual)
  }, [temaActual, view])

  const fetchData = async () => {
    try {
      const [fetchedMatches, fetchedPredictions] = await Promise.all([
        MatchesApi.getMatches(),
        PredictionsApi.getPredictions()
      ])
      const fetchedRooms = await RoomsApi.getRooms().catch((err) => {
        console.error(err)
        return []
      })
      const mappedMatches = fetchedMatches.map(m => ({
        id: m.id,
        dia: m.fecha ? m.fecha.split('T')[0] : '',
        fecha: m.fecha ? m.fecha.split('T')[0] : '',
        grupo: m.grupo || '',
        local: m.equipo_local?.nombre || m.local || '',
        visitante: m.equipo_visitante?.nombre || m.visitante || '',
        resLocal: m.estado === 'FINALIZADO' ? m.goles_local : null,
        resVisitor: m.estado === 'FINALIZADO' ? m.goles_visitante : null,
      }))
      const usersMap = {}
      fetchedPredictions.forEach(p => {
        const username = p.profiles?.nombre || 'Unknown'
        if (!usersMap[username]) usersMap[username] = { name: username, bets: {} }
        usersMap[username].bets[p.match_id] = { local: p.pred_goles_local, visitor: p.pred_goles_visitante }
      })
      setMatches(mappedMatches)
      setUsers(Object.values(usersMap))
      setRooms(fetchedRooms)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    const { data: { subscription } } = AuthApi.onAuthStateChange((event, session) => {
      setCurrentSession(session)
      if (session?.user) {
        const name = session.user.user_metadata?.username || session.user.email
        setCurrentUser(name)
        setView(name === 'Proyecto' ? 'admin' : 'partidos')
        fetchData()
        // Show guide if it's their first time logging in this device
        const hasSeenGuide = localStorage.getItem('hasSeenGuide_' + name)
        if (!hasSeenGuide && name !== 'Proyecto') {
          setShowGuide(true)
          localStorage.setItem('hasSeenGuide_' + name, 'true')
        }
      } else {
        setCurrentUser(null)
        setView('login')
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const guideSteps = [
    { title: '¿Qué es Polla Mundialista?', description: 'Una app para pronosticar resultados, competir con tu grupo y sumar puntos según tus aciertos en cada partido.', target: 'Panel principal' },
    { title: 'Haz tus pronósticos', description: 'En la sección de Partidos elige los goles de cada equipo antes del comienzo de los encuentros.', target: 'Menú Partidos' },
    { title: 'Sistema de Puntuación', description: '5 pts: marcador exacto · 3 pts: resultado + tendencia · 1 pt: solo ganador · 0 pts: error total.', target: 'Tabla de Puntos' },
    { title: 'Criterios de Desempate', description: 'Desempate por: marcadores exactos → tendencia → sorteo.', target: 'Tabla de Posiciones' },
    { title: 'Revisa tu posición', description: 'En Tabla puedes ver tu ranking, puntos y cómo te comparas con los demás.', target: 'Menú Tabla' },
    { title: 'Administra tus apuestas', description: 'En Grupos y Partidos puedes ajustar tus pronósticos y seguir la evolución del torneo.', target: 'Menú Grupos' },
  ]

  const handleLogin = (name, isReservedAdmin = false) => {
    if (!isReservedAdmin) {
      // Regular users are handled by onAuthStateChange after Supabase login.
      return
    }

    setCurrentSession(null)
    setCurrentUser(name)
    setView('admin')
    fetchData()
  }

  const handleCloseGuide = () => {
    setShowGuide(false)
    setGuideStep(0)
  }

  const handleNextGuide = () => {
    setGuideStep(step => Math.min(step + 1, guideSteps.length - 1))
  }

  const handlePrevGuide = () => {
    setGuideStep(step => Math.max(step - 1, 0))
  }

  const handleLogout = async () => {
    if (!currentSession && currentUser === 'Proyecto') {
      setCurrentUser(null)
      setView('login')
      return
    }

    await AuthApi.signOut()
  }

  const handleMatchesChange = useCallback(() => {
    fetchData()
    setRefreshKey(k => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cambiarTema = (tema) => {
    setTemaActual(tema)
  }

  const themeOptions = [
    { key: 'default', label: 'Normal', icon: '◐' },
    { key: 'colombia', label: 'Colombia', icon: '●' },
  ]

  const themeSwitcher = view !== 'login' && view !== 'admin' ? (
    <div
      className="theme-switcher"
      aria-label="Selector de tema"
      style={{
        position: 'relative',
        zIndex: 1,
        flex: '0 0 auto',

        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',

        minHeight: '2.65rem',
        padding: '0.25rem',

        borderRadius: '999px',

        background:
          temaActual === 'colombia'
            ? 'rgba(0, 20, 60, 0.92)'
            : 'rgba(255,255,255,0.86)',

        border:
          temaActual === 'colombia'
            ? '1px solid rgba(252,209,22,0.28)'
            : '1px solid rgba(18,48,68,0.12)',

        boxShadow:
          temaActual === 'colombia'
            ? '0 10px 24px rgba(0,0,0,0.24)'
            : '0 10px 24px rgba(18,48,68,0.1)',

        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {themeOptions.map(option => {
        const active = temaActual === option.key
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => cambiarTema(option.key)}
            aria-pressed={active}
            title={`Tema ${option.label}`}
            style={{
              minHeight: '2rem', padding: '0.35rem 0.72rem',
              border: '1px solid transparent', borderRadius: '999px',
              display: 'inline-flex', alignItems: 'center', gap: '0.38rem',
              background: active ? (option.key === 'colombia' ? '#FCD116' : '#102a43') : 'transparent',
              color: active ? (option.key === 'colombia' ? '#0a1628' : '#ffffff') : (temaActual === 'colombia' ? 'rgba(255,255,255,0.76)' : '#486581'),
              fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease',
              boxShadow: active ? '0 8px 18px rgba(0,0,0,0.16)' : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span style={{
              width: '0.75rem', height: '0.75rem', borderRadius: '50%',
              flex: '0 0 auto',
              display: 'inline-grid', placeItems: 'center',
              background: option.key === 'colombia'
                ? 'linear-gradient(180deg, #FCD116 0 48%, #003893 48% 74%, #CE1126 74% 100%)'
                : active ? '#ffffff' : '#d9e2ec',
              color: 'transparent',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            }}>
              {option.icon}
            </span>
            <span className="theme-switcher-label">Tema {option.label}</span>
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div className="app-layout">
      {/* Decoraciones del tema Colombia */}
      <div className="fondo-tema"></div>
      <div className="decoracion-tema decoracion-izquierda"></div>
      <div className="decoracion-tema decoracion-derecha"></div>
      {view !== 'login' && (
        <Header currentUser={currentUser} view={view} onNavigate={setView} onLogout={handleLogout} theme={temaActual} themeSwitcher={themeSwitcher} />
      )}

      <main className="page-content">
        {view === 'login' && <Inicio onLogin={handleLogin} />}
        {view === 'partidos' && currentUser && (
          <Partidos
            currentUser={currentUser}
            matches={matches}
            users={users}
            onMatchesChange={handleMatchesChange}
            currentSession={currentSession}
            theme={temaActual}
            key={refreshKey}
          />
        )}
        {view === 'grupos' && currentUser && (
          <Grupos
            currentUser={currentUser}
            matches={matches}
            users={users}
            onMatchesChange={handleMatchesChange}
            theme={temaActual}
            key={refreshKey}
          />
        )}
        {view === 'tabla' && currentUser && (
          <Tabla
            currentUser={currentUser}
            matches={matches}
            users={users}
            refreshKey={refreshKey}
          />
        )}
        {view === 'salas' && currentUser && (
          <Salas
            currentUser={currentUser}
            currentSession={currentSession}
            matches={matches}
            theme={temaActual}
            users={users}
            rooms={rooms}
            onRoomsChange={handleMatchesChange}
            key={refreshKey}
          />
        )}
        {view === 'eliminatorias' && currentUser && (
          <Eliminatorias theme={temaActual} />
        )}
        {view === 'admin' && currentUser === 'Proyecto' && (
          <Admin matches={matches} users={users} onMatchesChange={handleMatchesChange} />
        )}
        {view === 'admin' && currentUser !== 'Proyecto' && <Inicio onLogin={handleLogin} />}
      </main>

      {showGuide && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '100%', maxWidth: '38rem', borderRadius: '1.5rem', background: 'var(--color-tarjeta, #fff)', overflow: 'hidden', boxShadow: '0 30px 90px rgba(15,23,42,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ padding: '2rem 2rem 1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'var(--color-tarjeta, #fff)', borderBottom: '4px solid', borderImage: 'linear-gradient(to right, #00a651, #0066f5, #e11a27) 1' }}>
              <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Guía rápida</h2>
              <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, fontSize: '0.95rem' }}>Esta app te ayuda a pronosticar partidos, competir con tu grupo y seguir tu posición en el torneo.</p>
            </div>
            <div style={{ padding: '2rem', background: '#f8fafc' }}>
              <div style={{ display: 'grid', gap: '1.5rem', minHeight: '10rem' }}>
                <div key={guideStep}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-texto, #0f172a)' }}>{guideSteps[guideStep].title}</h3>
                  <p style={{ margin: 0, color: 'var(--color-texto, #475569)', lineHeight: 1.75, fontSize: '0.98rem' }}>{guideSteps[guideStep].description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {guideSteps.map((_, idx) => (
                    <div key={idx} style={{ width: idx === guideStep ? '1.5rem' : '0.5rem', height: '0.5rem', borderRadius: '9999px', background: idx === guideStep ? '#0066f5' : '#cbd5e1', transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={handlePrevGuide} disabled={guideStep === 0} style={{ flex: 1, padding: '0.95rem', border: '1px solid #cbd5e1', borderRadius: '0.95rem', background: guideStep === 0 ? '#f1f5f9' : '#fff', color: guideStep === 0 ? '#94a3b8' : '#0f172a', fontWeight: 700, cursor: guideStep === 0 ? 'not-allowed' : 'pointer' }}>Anterior</button>
                <button onClick={guideStep === guideSteps.length - 1 ? handleCloseGuide : handleNextGuide} style={{ flex: 1, padding: '0.95rem', border: 0, borderRadius: '0.95rem', background: 'var(--color-primario, #0066f5)', color: 'var(--color-tarjeta, #fff)', fontWeight: 700, cursor: 'pointer' }}>
                  {guideStep === guideSteps.length - 1 ? 'Listo, comenzar' : 'Siguiente'}
                </button>
              </div>
              <button onClick={handleCloseGuide} style={{ marginTop: '0.85rem', width: '100%', padding: '0.85rem', border: 0, borderRadius: '0.95rem', background: 'transparent', color: 'var(--color-texto, #475569)', fontSize: '0.95rem', cursor: 'pointer' }}>Cerrar guía</button>
            </div>
          </div>
        </div>
      )}
      <Toast />
    </div>
  )
}
