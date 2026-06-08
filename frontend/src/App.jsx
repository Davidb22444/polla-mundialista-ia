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
import PartidoChat from './components/PartidoChat.jsx'
import ChampionBanner from './components/ChampionBanner.jsx'
import fondoMundial from './assets/mundial.jpeg'
import fondoTabla from './assets/fondo_tabla.jpg'

// ─── Safe Storage ──────────────────────────────────────────────
const mem = {}
const Storage = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return mem[k] ?? fb } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { mem[k] = v } },
  str: (k, fb) => { try { return localStorage.getItem(k) ?? fb } catch { return mem[k] ?? fb } },
  setStr: (k, v) => { try { localStorage.setItem(k, v) } catch { mem[k] = v } },
}

export const DB = {
  getUsers: () => Storage.get('polla_users', []),
  saveUsers: (u) => Storage.set('polla_users', u),
  getMatches: () => {
    const stored = Storage.get('polla_matches', [])
    return Array.isArray(stored) && stored.length === data.partidos.length ? stored : data.partidos
  },
  saveMatches: (m) => Storage.set('polla_matches', m),
  getCurrentUser: () => Storage.str('polla_current_user', ''),
  setCurrentUser: (n) => Storage.setStr('polla_current_user', n),
  getUserData: (name) => { const users = Storage.get('polla_users', []); return users.find(u => u.name === name) || { name, bets: {} } },
  saveUserData: (ud) => { const users = Storage.get('polla_users', []); const i = users.findIndex(u => u.name === ud.name); if (i >= 0) users[i] = ud; else users.push(ud); Storage.set('polla_users', users) },
  hasSeenGuide: (name) => Storage.get(`polla_guide_seen_${name}`, false),
  markGuideSeen: (name) => Storage.set(`polla_guide_seen_${name}`, true),
  getRooms: () => Storage.get('polla_rooms', []),
  saveRooms: (r) => Storage.set('polla_rooms', r),
  createRoom: (name, creatorName) => {
    const rooms = Storage.get('polla_rooms', [])
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newRoom = {
      id: Date.now().toString(),
      name,
      code,
      creator: creatorName,
      members: [creatorName],
      createdAt: new Date().toISOString()
    }
    rooms.push(newRoom)
    Storage.set('polla_rooms', rooms)
    return newRoom
  },
  joinRoom: (code, userName) => {
    const rooms = Storage.get('polla_rooms', [])
    const room = rooms.find(r => r.code.toUpperCase() === code.trim().toUpperCase())
    if (!room) throw new Error('Código de sala no encontrado')
    if (room.members.includes(userName)) return room
    room.members.push(userName)
    Storage.set('polla_rooms', rooms)
    return room
  },
  leaveRoom: (roomId, userName) => {
    let rooms = Storage.get('polla_rooms', [])
    const roomIndex = rooms.findIndex(r => r.id === roomId)
    if (roomIndex === -1) return
    const room = rooms[roomIndex]
    room.members = room.members.filter(m => m !== userName)
    if (room.members.length === 0) {
      rooms = rooms.filter(r => r.id !== roomId)
    } else {
      if (room.creator === userName) {
        room.creator = room.members[0]
      }
      rooms[roomIndex] = room
    }
    Storage.set('polla_rooms', rooms)
  },
  // Champion prediction
  getTournamentChampion: () => Storage.str('polla_champion', ''),
  setTournamentChampion: (c) => Storage.setStr('polla_champion', c),
  getPredictedChampion: (name) => Storage.str(`polla_pred_champ_${name}`, ''),
  setPredictedChampion: (name, team) => Storage.setStr(`polla_pred_champ_${name}`, team),
}

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
  // Marcador Exacto (5 Puntos)
  if (bL === rL && bV === rV) return 5
  
  const bRes = bL > bV ? 'W' : bL < bV ? 'L' : 'D'
  const rRes = rL > rV ? 'W' : rL < rV ? 'L' : 'D'
  
  // Error Total (0 Puntos): Resultado incorrecto
  if (bRes !== rRes) return 0
  
  // Resultado correcto (ganador/empate acertado)
  const bGoalDiff = Math.abs(bL - bV)
  const rGoalDiff = Math.abs(rL - rV)
  
  // Resultado y Tendencia (3 Puntos): Ganador correcto + diferencia de goles correcta
  if (bGoalDiff === rGoalDiff) return 3
  
  // Acierto Simple (1 Punto): Solo ganador/empate correcto
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
    return () => {
      clearTimeout(tStart)
      clearTimeout(tEnd)
    }
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

// ─── Global Stats ──────────────────────────────────────────────
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
  // For all matches (including unplayed), compute tendency
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
  { id: 'veterano', label: 'Veterano', icon: '🏅', desc: '10+ apuestas', check: (s) => s.betsMade >= 10 },
  { id: 'adivino', label: 'Adivino', icon: '🔮', desc: '3+ marcadores exactos', check: (s) => s.exactScores >= 3 },
  { id: 'hattrick', label: 'Hat-trick', icon: '🎩', desc: 'Racha de 3 aciertos', check: (s) => s.maxStreak >= 3 },
  { id: 'oraculo', label: 'Oráculo', icon: '⚡', desc: '5+ marcadores exactos', check: (s) => s.exactScores >= 5 },
]

// ─── Standings logic ────────────────────────────────────────────
export function buildStandings(users, matches) {
  const tournamentChampion = DB.getTournamentChampion()
  return users.map(user => {
    let totalPoints = 0, betsMade = 0, exactScores = 0, trendencyScores = 0
    let currentStreak = 0, maxStreak = 0, tempStreak = 0
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
    currentStreak = tempStreak
    // Champion bonus
    const predictedChamp = DB.getPredictedChampion(user.name)
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
function Tabla({ currentUser, matches, refreshKey }) {
  const users = DB.getUsers()
  const standings = buildStandings(users, matches)
  const top3 = standings.slice(0, 3)
  const rest = standings.slice(3)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [null, top3[0], top3[1]] : [null, top3[0], null]
  const podiumClasses = ['podium-2', 'podium-1', 'podium-3']
  const podiumHeights = ['8rem', '10rem', '6rem']
  const podiumLabels = ['2°', '1°', '3°']

  const [selectedPlayer, setSelectedPlayer] = useState(null)

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: `var(--bg-tabla, url(${fondoTabla}))`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5,10,20,0.78) 0%, rgba(8,16,32,0.70) 50%, rgba(5,10,20,0.82) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '64rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.875rem', fontWeight: 800, margin: 0 }}>
          Tabla de <span style={{ color: '#e11a27' }}>Posiciones</span>
        </h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Haz clic en un jugador para ver su historial y gráfica de puntos.</p>
      </div>

      {/* Podium */}
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

      {/* Table */}
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
                    style={{ background: isMe ? 'rgba(16,185,129,0.04)' : 'transparent', borderBottom: '1px solid var(--slate-100)', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = isMe ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = isMe ? 'rgba(16,185,129,0.04)' : 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {i < 3
                        ? <span style={{ fontSize: '1.1rem' }}>{['🥇','🥈','🥉'][i]}</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--slate-100)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>{i + 1}</span>}
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
                      {player.currentStreak >= 2
                        ? <span className="streak-badge">🔥 {player.currentStreak}</span>
                        : <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {player.achievements?.map(a => (
                          <span key={a.id} className="badge-chip" title={a.desc}>{a.icon} {a.label}</span>
                        ))}
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

      {/* Player History Modal */}
      {selectedPlayer && (
        <PlayerHistoryModal
          player={selectedPlayer}
          matches={matches}
          onClose={() => setSelectedPlayer(null)}
        />
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

function Partidos({ currentUser, matches, onMatchesChange }) {
  const [, forceUpdate] = useState(0)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const refresh = () => forceUpdate(n => n + 1)
  const dayOptions = [...new Set(matches.map(match => match.dia))].sort()
  const dayMin = dayOptions[0] || ''
  const dayMax = dayOptions[dayOptions.length - 1] || ''
  const groups = [...new Set(matches.map(m => m.grupo).filter(Boolean))].sort()
  const allUsers = DB.getUsers()
  const globalStats = getGlobalStats(allUsers, matches)

  // Reminder: notify if there are unbetted matches today/next 24h
  useEffect(() => {
    const userData = DB.getUserData(currentUser)
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

  const handleBet = (matchId, localVal, visitorVal, amount = 0, potentialWin = 0) => {
    const userData = DB.getUserData(currentUser)
    userData.bets[matchId] = { local: localVal, visitor: visitorVal, amount, potentialWin }
    DB.saveUserData(userData)
    showToast('¡Pronóstico guardado!', '⚽')
    refresh()
  }

  const handleClear = (matchId) => {
    const userData = DB.getUserData(currentUser)
    delete userData.bets[matchId]
    DB.saveUserData(userData)
    showToast('Apuesta eliminada', '🗑️')
    refresh()
  }

  const userData = DB.getUserData(currentUser)

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: `var(--bg-partidos, url(${fondoMundial}))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay semitransparente para legibilidad */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5,15,30,0.72) 0%, rgba(8,20,45,0.65) 50%, rgba(5,15,30,0.78) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '6rem 1rem 3rem',
        }}
      >
      {/* Champion Prediction Banner */}
      <ChampionBanner currentUser={currentUser} />

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.875rem', fontWeight: 800, margin: 0, color: 'var(--color-tarjeta, #fff)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              Partidos <span style={{ color: '#00a651' }}>en Vivo</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Selecciona la fecha y revisa qué partidos de la fase de grupos se juegan ese día. El Oráculo IA ya preparó su pronóstico.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.65rem 1rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#4ade80', animation: 'pulseGlow 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-tarjeta, #fff)' }}>Sistema de predicción activo</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Fecha</span>
          <input
            type="date"
            value={selectedDay}
            min={dayMin}
            max={dayMax}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={{
              border: '1px solid rgba(45,120,163,0.18)',
              background: 'var(--color-tarjeta, #fff)',
              color: 'var(--slate-700)',
              borderRadius: '1rem',
              padding: '0.85rem 1rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 700,
              boxShadow: '0 12px 30px rgba(18,48,68,0.06)',
              transition: 'all 0.18s ease',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Grupo</span>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{
              border: '1px solid rgba(45,120,163,0.18)',
              background: 'var(--color-tarjeta, #fff)',
              color: 'var(--slate-700)',
              borderRadius: '1rem',
              padding: '0.85rem 1rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 700,
              boxShadow: '0 12px 30px rgba(18,48,68,0.06)',
              transition: 'all 0.18s ease',
              outline: 'none',
            }}
          >
            <option value="">Todos los grupos</option>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {(selectedDay || selectedGroup) && (
            <button
              type="button"
              onClick={() => { setSelectedDay(''); setSelectedGroup('') }}
              style={{
                border: '1px solid rgba(0,166,81,0.16)',
                background: '#00a651',
                color: 'var(--color-tarjeta, #fff)',
                borderRadius: '999px',
                padding: '0.55rem 0.95rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.18s ease',
              }}
            >
              Mostrar todos
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
          {selectedDay ? `Mostrando ${filteredMatches.length} partido(s) para ${formatDayLabel(selectedDay)}.` : `Mostrando ${matches.length} partidos de la fase de grupos en el calendario.`}
        </p>
        {selectedDay && (
          <button
            type="button"
            onClick={() => setSelectedDay('')}
            style={{
              border: '1px solid rgba(0,102,245,0.16)',
              background: 'var(--color-primario, #0066f5)',
              color: 'var(--color-tarjeta, #fff)',
              borderRadius: '999px',
              padding: '0.55rem 0.95rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.18s ease',
            }}
          >
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
  const [currentUser, setCurrentUser] = useState(() => DB.getCurrentUser())
  const [view, setView] = useState(() => {
    const user = DB.getCurrentUser()
    return user === 'Proyecto' ? 'admin' : user ? 'partidos' : 'login'
  })
  const [matches, setMatches] = useState(() => DB.getMatches())
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


  const guideSteps = [
    {
      title: '¿Qué es Polla Mundialista?',
      description: 'Una app para pronosticar resultados, competir con tu grupo y sumar puntos según tus aciertos en cada partido.',
      target: 'Panel principal',
    },
    {
      title: 'Haz tus pronósticos',
      description: 'En la sección de Partidos elige los goles de cada equipo antes del comienzo de los encuentros.',
      target: 'Menú Partidos',
    },
    {
      title: 'Sistema de Puntuación',
      description: (
        <div style={{ lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#059669' }}>💚 5 Puntos: Marcador Exacto</p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>Adivinaste el resultado exacto. Ej: dijiste 2-1 y fue 2-1.</p>
          
          <p style={{ margin: '0.5rem 0 0.5rem', fontWeight: 700, color: 'var(--color-primario, #0066f5)' }}>🔵 3 Puntos: Resultado y Tendencia</p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>Ganador correcto + diferencia de goles. Ej: dijiste 1-0 y quedó 2-1.</p>
          
          <p style={{ margin: '0.5rem 0 0.5rem', fontWeight: 700, color: '#f97316' }}>🟠 1 Punto: Acierto Simple</p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>Solo adivinaste al ganador/empate. Ej: dijiste 3-0 y quedó 1-0.</p>
          
          <p style={{ margin: '0.5rem 0 0.5rem', fontWeight: 700, color: '#ef4444' }}>❌ 0 Puntos: Error Total</p>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>No acertaste al ganador. Ej: dijiste Equipo A y ganó Equipo B.</p>
        </div>
      ),
      target: 'Tabla de Puntos',
    },
    {
      title: 'Criterios de Desempate',
      description: (
        <div style={{ lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: '#64748b' }}>
            Si al final dos amigos terminan con los mismos puntos, se evita dividir premios o armar debates usando este orden estricto:
          </p>
          
          <p style={{ margin: '0.5rem 0 0.5rem', fontWeight: 700, color: '#059669' }}>🥇 1º: Mayor cantidad de marcadores exactos</p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>Los de 5 puntos. Quien arriesgó y acertó más resultados clavados merece ganar.</p>
          
          <p style={{ margin: '0.5rem 0 0.5rem', fontWeight: 700, color: 'var(--color-primario, #0066f5)' }}>🥈 2º: Mayor cantidad de resultados de tendencia</p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>Los de 3 puntos. Si persiste la igualdad, gana quien tuvo más aciertos de tendencia.</p>
          
          <p style={{ margin: '0.5rem 0 0.5rem', fontWeight: 700, color: '#f97316' }}>🥉 3º: Sorteo o moneda al aire</p>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-texto, #475569)' }}>Si la igualdad persiste en todo lo anterior, lo cual es rarísimo, que decida la suerte.</p>
        </div>
      ),
      target: 'Tabla de Posiciones',
    },
    {
      title: 'Revisa tu posición',
      description: 'En Tabla puedes ver tu ranking, puntos y cómo te comparas con los demás jugadores.',
      target: 'Menú Tabla',
    },
    {
      title: 'Administra tus apuestas',
      description: 'En Grupos y Partidos puedes ajustar tus pronósticos y seguir la evolución del torneo.',
      target: 'Menú Grupos',
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser && currentUser !== 'Proyecto') {
        setShowGuide(!DB.hasSeenGuide(currentUser))
      } else {
        setShowGuide(false)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [currentUser])

  const handleLogin = (name, isAdmin = false) => {
    DB.setCurrentUser(name)
    setCurrentUser(name)
    setView(isAdmin ? 'admin' : 'partidos')
    if (!isAdmin && !DB.hasSeenGuide(name)) {
      setShowGuide(true)
      setGuideStep(0)
    }
    showToast(`¡Bienvenido, ${name}!`, '👋')
  }

  const handleCloseGuide = () => {
    if (currentUser) DB.markGuideSeen(currentUser)
    setShowGuide(false)
    setGuideStep(0)
  }

  const handleNextGuide = () => {
    setGuideStep(step => Math.min(step + 1, guideSteps.length - 1))
  }

  const handlePrevGuide = () => {
    setGuideStep(step => Math.max(step - 1, 0))
  }

  const handleLogout = () => {
    DB.setCurrentUser('')
    setCurrentUser('')
    setView('login')
  }

  const handleMatchesChange = useCallback((newMatches) => {
    setMatches(newMatches)
    setRefreshKey(k => k + 1)
  }, [])

  const cambiarTema = (tema) => {
    setTemaActual(tema)
  }

  const themeOptions = [
    { key: 'default', label: 'Normal', icon: '◐' },
    { key: 'colombia', label: 'Colombia', icon: '●' },
  ]

  return (
    <div className="app-layout">
      {view !== 'login' && view !== 'admin' && (
        <div
          className="theme-switcher"
          aria-label="Selector de tema"
          style={{
            position: 'fixed',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem',
            borderRadius: '999px',
            background: temaActual === 'colombia' ? 'rgba(0, 20, 60, 0.92)' : 'rgba(255,255,255,0.86)',
            border: temaActual === 'colombia' ? '1px solid rgba(252,209,22,0.28)' : '1px solid rgba(18,48,68,0.12)',
            boxShadow: temaActual === 'colombia' ? '0 12px 30px rgba(0,0,0,0.28)' : '0 12px 30px rgba(18,48,68,0.12)',
            backdropFilter: 'blur(14px)',
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
                style={{
                  minHeight: '2rem',
                  padding: '0.35rem 0.72rem',
                  border: '1px solid transparent',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.38rem',
                  background: active
                    ? option.key === 'colombia' ? '#FCD116' : '#102a43'
                    : 'transparent',
                  color: active
                    ? option.key === 'colombia' ? '#0a1628' : '#ffffff'
                    : temaActual === 'colombia' ? 'rgba(255,255,255,0.76)' : '#486581',
                  fontFamily: 'inherit',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
                  boxShadow: active ? '0 8px 18px rgba(0,0,0,0.16)' : 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <span style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  display: 'inline-grid',
                  placeItems: 'center',
                  background: option.key === 'colombia'
                    ? 'linear-gradient(180deg, #FCD116 0 48%, #003893 48% 74%, #CE1126 74% 100%)'
                    : active ? '#ffffff' : '#d9e2ec',
                  color: 'transparent',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                }}>
                  {option.icon}
                </span>
                Tema {option.label}
              </button>
            )
          })}
        </div>
      )}
      {/* Decoraciones del tema Colombia */}
      <div className="fondo-tema"></div>
      <div className="decoracion-tema decoracion-izquierda"></div>
      <div className="decoracion-tema decoracion-derecha"></div>
      
      {view !== 'login' && (
        <Header
          currentUser={currentUser}
          view={view}
          onNavigate={setView}
          onLogout={handleLogout}
        />
      )}

      <main className="page-content">
        {view === 'login' && <Inicio onLogin={handleLogin} />}
        {view === 'partidos' && currentUser && (
          <Partidos
            currentUser={currentUser}
            matches={matches}
            onMatchesChange={handleMatchesChange}
            key={refreshKey}
          />
        )}
        {view === 'grupos' && currentUser && (
          <Grupos
            currentUser={currentUser}
            matches={matches}
            onMatchesChange={handleMatchesChange}
            key={refreshKey}
          />
        )}
        {view === 'tabla' && currentUser && (
          <Tabla
            currentUser={currentUser}
            matches={matches}
            refreshKey={refreshKey}
          />
        )}
        {view === 'salas' && currentUser && (
          <Salas
            currentUser={currentUser}
            matches={matches}
            theme={temaActual}
            key={refreshKey}
          />
        )}
        {view === 'eliminatorias' && currentUser && (
          <Eliminatorias theme={temaActual} />
        )}
        {view === 'admin' && currentUser === 'Proyecto' && (
          <Admin
            matches={matches}
            onMatchesChange={handleMatchesChange}
          />
        )}
        {view === 'admin' && currentUser !== 'Proyecto' && <Inicio onLogin={handleLogin} />}
      </main>

      {showGuide && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fadeInOverlay 0.3s ease-out forward'
        }}>
          <style>{`
            @keyframes fadeInOverlay {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUpModal {
              from { transform: translateY(30px) scale(0.97); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes stepTransition {
              0% { transform: translateX(15px); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <div style={{
            width: '100%',
            maxWidth: '38rem',
            borderRadius: '1.5rem',
            background: 'var(--color-tarjeta, #fff)',
            overflow: 'hidden',
            boxShadow: '0 30px 90px rgba(15,23,42,0.35)',
            animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              padding: '2rem 2rem 1.5rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'var(--color-tarjeta, #fff)',
              borderBottom: '4px solid',
              borderImage: 'linear-gradient(to right, #00a651, #0066f5, #e11a27) 1',
              position: 'relative'
            }}>
              <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Guía rápida</h2>
              <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, fontSize: '0.95rem' }}>Esta app te ayuda a pronosticar partidos, competir con tu grupo y seguir tu posición en el torneo.</p>
            </div>
            <div style={{ padding: '2rem', background: '#f8fafc' }}>
              <div style={{ display: 'grid', gap: '1.5rem', minHeight: '18rem' }}>
                <div key={guideStep} style={{ display: 'grid', gap: '1.25rem', animation: 'stepTransition 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-texto, #0f172a)' }}>{guideSteps[guideStep].title}</h3>
                    {typeof guideSteps[guideStep].description === 'string' ? (
                      <p style={{ margin: 0, color: 'var(--color-texto, #475569)', lineHeight: 1.75, fontSize: '0.98rem' }}>{guideSteps[guideStep].description}</p>
                    ) : (
                      guideSteps[guideStep].description
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem', borderRadius: '1rem', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                    <span style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'var(--color-tarjeta, #fff)', display: 'grid', placeItems: 'center', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}>🔎</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Señalando</p>
                      <p style={{ margin: '0.15rem 0 0', color: 'var(--color-texto, #0f172a)', fontWeight: 800, fontSize: '0.95rem' }}>{guideSteps[guideStep].target}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {guideSteps.map((_, idx) => {
                    const stepColors = ['#00a651', '#0066f5', '#059669', '#e11a27', '#f97316', '#00a651'];
                    const isActive = idx === guideStep;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: isActive ? '1.5rem' : '0.5rem',
                          height: '0.5rem',
                          borderRadius: '9999px',
                          background: isActive ? stepColors[idx] : '#cbd5e1',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={handlePrevGuide} disabled={guideStep === 0} style={{ flex: 1, padding: '0.95rem 1.1rem', border: '1px solid #cbd5e1', borderRadius: '0.95rem', background: guideStep === 0 ? '#f1f5f9' : '#fff', color: guideStep === 0 ? '#94a3b8' : '#0f172a', fontWeight: 700, cursor: guideStep === 0 ? 'not-allowed' : 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease' }}
                  onMouseEnter={e => { if (guideStep !== 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(15,23,42,0.12)'; e.currentTarget.style.background = '#f8fafc' } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; if (guideStep !== 0) e.currentTarget.style.background = '#fff' }}
                >Anterior</button>
                <button onClick={guideStep === guideSteps.length - 1 ? handleCloseGuide : handleNextGuide} style={{ flex: 1, padding: '0.95rem 1.1rem', border: 0, borderRadius: '0.95rem', background: 'var(--color-primario, #0066f5)', color: 'var(--color-tarjeta, #fff)', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,102,245,0.28)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >{guideStep === guideSteps.length - 1 ? 'Listo, comenzar' : 'Siguiente'}</button>
              </div>
              <button onClick={handleCloseGuide} style={{ marginTop: '0.85rem', width: '100%', padding: '0.85rem', border: 0, borderRadius: '0.95rem', background: 'transparent', color: 'var(--color-texto, #475569)', fontSize: '0.95rem', cursor: 'pointer', transition: 'transform 0.2s ease, color 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.color = '#0f172a' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.color = '#475569' }}
              >Cerrar guía</button>
            </div>
          </div>
        </div>
      )}
      <Toast />
    </div>
  )
}
