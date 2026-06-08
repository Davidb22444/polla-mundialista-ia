import fs from 'fs';

let content = fs.readFileSync('C:\\polla-mundialista-ia\\frontend\\src\\App.jsx', 'utf-8');

const imports = `import { useState, useEffect, useCallback, useLayoutEffect } from 'react'
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
import { AuthApi } from './api/auth.js'
import { MatchesApi } from './api/matches.js'
import { PredictionsApi } from './api/predictions.js'
import { RoomsApi } from './api/rooms.js'
import { ProfilesApi } from './api/profiles.js'
`;

content = content.replace(/^import.*?fondo_tabla\.jpg'\r?\n/ms, imports);

content = content.replace(/\/\/ ─── Safe Storage ───.*?\/\/ ─── Oracle ───/ms, "// ─── Oracle ───\n");

content = content.replace("const tournamentChampion = DB.getTournamentChampion()", "const tournamentChampion = ''");
content = content.replace("const predictedChamp = DB.getPredictedChampion(user.name)", "const predictedChamp = ''");

const appStartIdx = content.indexOf("export default function App() {");

const newApp = `export default function App() {
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

  const fetchData = async () => {
    try {
      const [fetchedMatches, fetchedPredictions, fetchedRooms] = await Promise.all([
        MatchesApi.getMatches(),
        PredictionsApi.getPredictions(),
        RoomsApi.getRooms()
      ]);
      
      const mappedMatches = fetchedMatches.map(m => ({
        id: m.id,
        dia: m.fecha ? m.fecha.split('T')[0] : '',
        fecha: m.fecha ? m.fecha.split('T')[0] : '',
        grupo: m.equipo_local?.nombre ? 'Grupo ' + String.fromCharCode(65 + Math.floor(Math.random() * 8)) : '',
        local: m.equipo_local?.nombre,
        visitante: m.equipo_visitante?.nombre,
        resLocal: m.estado === 'FINALIZADO' ? m.goles_local : null,
        resVisitor: m.estado === 'FINALIZADO' ? m.goles_visitante : null,
      }))
      
      const usersMap = {};
      fetchedPredictions.forEach(p => {
        const username = p.profiles?.nombre || 'Unknown';
        if (!usersMap[username]) {
          usersMap[username] = { name: username, bets: {} };
        }
        usersMap[username].bets[p.match_id] = {
          local: p.pred_goles_local,
          visitor: p.pred_goles_visitante,
          amount: 0,
          potentialWin: 0
        };
      });
      
      setMatches(mappedMatches)
      setUsers(Object.values(usersMap))
      setRooms(fetchedRooms)
    } catch(err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = AuthApi.onAuthStateChange((event, session) => {
      setCurrentSession(session)
      if (session?.user) {
        setCurrentUser(session.user.user_metadata?.username || session.user.email)
        setView(session.user.user_metadata?.username === 'Proyecto' ? 'admin' : 'partidos')
        fetchData()
      } else {
        setCurrentUser(null)
        setView('login')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useLayoutEffect(() => {
    if (view === 'login' || view === 'admin') {
      document.documentElement.setAttribute('data-theme', 'default')
    } else {
      document.documentElement.setAttribute('data-theme', temaActual)
    }
    localStorage.setItem('tema-polla', temaActual)
  }, [temaActual, view])

  const guideSteps = [
    { title: '¿Qué es Polla Mundialista?', description: 'Una app para pronosticar resultados, competir con tu grupo y sumar puntos según tus aciertos en cada partido.', target: 'Panel principal' },
    { title: 'Haz tus pronósticos', description: 'En la sección de Partidos elige los goles de cada equipo antes del comienzo de los encuentros.', target: 'Menú Partidos' },
    { title: 'Sistema de Puntuación', description: 'Gana puntos.', target: 'Tabla de Puntos' },
    { title: 'Criterios de Desempate', description: 'En caso de empate...', target: 'Tabla de Posiciones' },
    { title: 'Revisa tu posición', description: 'En Tabla puedes ver tu ranking.', target: 'Menú Tabla' },
    { title: 'Administra tus apuestas', description: 'En Grupos y Partidos.', target: 'Menú Grupos' },
  ]

  const handleLogin = (name, isAdmin = false) => {
    // handled by auth
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
    await AuthApi.signOut()
  }

  const handleMatchesChange = useCallback(() => {
    fetchData()
    setRefreshKey(k => k + 1)
  }, [])

  const cambiarTema = (tema) => {
    setTemaActual(tema)
  }

  const themeOptions = [
    { key: 'default', label: 'Normal', icon: '◐' },
    { key: 'colombia', label: 'Colombia', icon: '●' },
  ]
`;

content = content.substring(0, appStartIdx) + newApp + content.substring(content.indexOf("  return (", appStartIdx));

content = content.replace("const users = DB.getUsers()", "const users = []");
content = content.replace("const allUsers = DB.getUsers()", "");
content = content.replace("const globalStats = getGlobalStats(allUsers, matches)", "const globalStats = getGlobalStats(users, matches)");
content = content.replace("const userData = DB.getUserData(currentUser)", "const userData = users.find(u => u.name === currentUser) || { bets: {} }");
content = content.replace("DB.saveUserData(userData)", "/* API sync handled */");

content = content.replace("function Partidos({ currentUser, matches, onMatchesChange }) {", "function Partidos({ currentUser, matches, users, onMatchesChange, currentSession }) {");
content = content.replace("const handleBet = (matchId, localVal, visitorVal, amount = 0, potentialWin = 0) => {", "const handleBet = async (matchId, localVal, visitorVal, amount = 0, potentialWin = 0) => {\\n    await PredictionsApi.createOrUpdatePrediction({ user_id: currentSession.user.id, match_id: matchId, pred_goles_local: localVal, pred_goles_visitante: visitorVal });\\n    onMatchesChange();\\n    showToast('¡Pronóstico guardado!', '⚽');\\n  }");
content = content.replace("const handleClear = (matchId) => {", "const handleClear = async (matchId) => {\\n    /* Implement delete if needed */\\n  }");

content = content.replace("function Tabla({ currentUser, matches, refreshKey }) {", "function Tabla({ currentUser, matches, users, refreshKey }) {");

let appReturnIdx = content.indexOf("  return (", appStartIdx);
let appReturn = content.substring(appReturnIdx);

appReturn = appReturn.replace("onMatchesChange={handleMatchesChange}", "onMatchesChange={handleMatchesChange}\\n            users={users}\\n            currentSession={currentSession}");
appReturn = appReturn.replace("matches={matches}\\n            refreshKey={refreshKey}", "matches={matches}\\n            users={users}\\n            refreshKey={refreshKey}");
appReturn = appReturn.replace("theme={temaActual}\\n            key={refreshKey}", "theme={temaActual}\\n            users={users}\\n            rooms={rooms}\\n            onRoomsChange={fetchData}\\n            currentSession={currentSession}\\n            key={refreshKey}");

content = content.substring(0, appReturnIdx) + appReturn;

fs.writeFileSync('C:\\polla-mundialista-ia\\frontend\\src\\App.jsx', content);
console.log('done');
