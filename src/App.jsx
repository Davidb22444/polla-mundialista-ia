import { useState, useEffect, useCallback } from 'react'
import './App.css'
import data from './data/partidos.json'
import Header from './components/Header.jsx'
import Inicio from './pages/Inicio.jsx'
import Admin from './pages/Admin.jsx'
import PartidoCard from './components/PartidoCard.jsx'

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
  getMatches: () => Storage.get('polla_matches', data.partidos),
  saveMatches: (m) => Storage.set('polla_matches', m),
  getCurrentUser: () => Storage.str('polla_current_user', ''),
  setCurrentUser: (n) => Storage.setStr('polla_current_user', n),
  getUserData: (name) => { const users = Storage.get('polla_users', []); return users.find(u => u.name === name) || { name, bets: {} } },
  saveUserData: (ud) => { const users = Storage.get('polla_users', []); const i = users.findIndex(u => u.name === ud.name); if (i >= 0) users[i] = ud; else users.push(ud); Storage.set('polla_users', users) },
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
  if (bL === rL && bV === rV) return 3
  let pts = 0
  const bRes = bL > bV ? 'W' : bL < bV ? 'L' : 'D'
  const rRes = rL > rV ? 'W' : rL < rV ? 'L' : 'D'
  if (bRes === rRes) pts++
  if (bL === rL) pts++
  if (bV === rV) pts++
  return Math.min(3, pts)
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
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
      background: 'rgba(15,23,42,0.95)', color: '#fff',
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

// ─── Standings logic ────────────────────────────────────────────
export function buildStandings(users, matches) {
  return users.map(user => {
    let totalPoints = 0, betsMade = 0, exactScores = 0
    matches.forEach(match => {
      if (match.resLocal !== null && user.bets[match.id]) {
        betsMade++
        const pts = calculateMatchPoints(user.bets[match.id].local, user.bets[match.id].visitor, match.resLocal, match.resVisitor)
        totalPoints += pts
        if (pts === 3) exactScores++
      }
    })
    return { name: user.name, betsMade, exactScores, totalPoints }
  }).sort((a, b) => b.totalPoints - a.totalPoints || b.exactScores - a.exactScores || a.name.localeCompare(b.name))
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

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.875rem', fontWeight: 800, margin: 0 }}>
          Tabla de <span style={{ color: 'var(--gold-500)' }}>Posiciones</span>
        </h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Los mejores pronosticadores del torneo.</p>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {podiumOrder.map((player, idx) => !player ? <div key={idx} /> : (
            <div key={player.name} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', animationDelay: `${idx * 0.1}s` }}>
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: '#fff', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '0 auto 0.5rem' }}>{player.name[0]}</div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: '0 0 0.2rem', color: 'var(--slate-800)' }}>{player.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', margin: 0 }}>{player.totalPoints} pts</p>
              </div>
              <div className={podiumClasses[idx]} style={{ width: '100%', height: podiumHeights[idx], borderRadius: '0.75rem 0.75rem 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>{podiumLabels[idx]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="glass" style={{ borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(248,250,252,0.8)', borderBottom: '1px solid var(--slate-200)' }}>
                {['#', 'Jugador', 'Apuestas', 'Exactos', 'Puntos'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Jugador' || h === '#' ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.875rem' }}>Aún no hay jugadores registrados.</td></tr>
              )}
              {standings.map((player, i) => {
                const isMe = player.name === currentUser
                return (
                  <tr key={player.name} style={{ background: isMe ? 'rgba(16,185,129,0.04)' : 'transparent', borderBottom: '1px solid var(--slate-100)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {i < 3
                        ? <span style={{ fontSize: '1.1rem' }}>{['🥇','🥈','🥉'][i]}</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--slate-100)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>{i + 1}</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>{player.name[0]}</div>
                        <span style={{ fontWeight: 500 }}>{player.name}</span>
                        {isMe && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-600)', background: 'var(--brand-100)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>Tú</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--slate-600)', fontWeight: 500 }}>{player.betsMade}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold-600)' }}>{player.exactScores}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--brand-100)', color: 'var(--brand-700)' }}>{player.totalPoints}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Partidos View ──────────────────────────────────────────────
function Partidos({ currentUser, matches, onMatchesChange }) {
  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate(n => n + 1)

  const handleBet = (matchId, localVal, visitorVal) => {
    const userData = DB.getUserData(currentUser)
    userData.bets[matchId] = { local: localVal, visitor: visitorVal }
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
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.875rem', fontWeight: 800, margin: 0 }}>
            Partidos <span style={{ color: 'var(--brand-600)' }}>en Vivo</span>
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Ingresa tu pronóstico. El Oráculo IA ya hizo el suyo. 🤖</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand-50)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--brand-100)' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--brand-500)', animation: 'pulseGlow 2s infinite' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--brand-700)' }}>Sistema de predicción activo</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {matches.map(match => (
          <PartidoCard
            key={match.id}
            match={match}
            userBet={userData.bets[match.id]}
            onBet={handleBet}
            onClear={handleClear}
          />
        ))}
      </div>
    </div>
  )
}

// ─── App ────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => DB.getCurrentUser())
  const [view, setView] = useState(() => DB.getCurrentUser() ? 'partidos' : 'login')
  const [matches, setMatches] = useState(() => DB.getMatches())
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLogin = (name) => {
    DB.setCurrentUser(name)
    setCurrentUser(name)
    setView('partidos')
    showToast(`¡Bienvenido, ${name}!`, '👋')
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

  return (
    <div className="app-layout">
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
        {view === 'tabla' && currentUser && (
          <Tabla
            currentUser={currentUser}
            matches={matches}
            refreshKey={refreshKey}
          />
        )}
        {view === 'admin' && (
          <Admin
            matches={matches}
            onMatchesChange={handleMatchesChange}
          />
        )}
      </main>

      <Toast />
    </div>
  )
}
