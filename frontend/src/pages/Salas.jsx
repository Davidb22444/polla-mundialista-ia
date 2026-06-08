import { useState } from 'react'
import { DB, showToast, buildStandings, calculateMatchPoints } from '../App.jsx'
import fondoSalas from '../assets/fondo_tabla.jpg'
import TeamFlag from '../components/TeamFlag.jsx'
import data from '../data/partidos.json'

// List of colors for user avatar circles
const avatarColors = [
  '#00a651', '#0066f5', '#e11a27', '#f39c12', '#9b59b6', '#34495e',
  '#1abc9c', '#d35400', '#27ae60', '#2980b9', '#8e44ad', '#c0392b'
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

export default function Salas({ currentUser, matches, theme }) {
  const [rooms, setRooms] = useState(() => DB.getRooms())
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [subTab, setSubTab] = useState('ranking') // 'ranking' | 'pronosticos'

  const refreshRooms = () => {
    const updated = DB.getRooms()
    setRooms(updated)
    if (selectedRoom) {
      const currentSelected = updated.find(r => r.id === selectedRoom.id)
      setSelectedRoom(currentSelected || null)
    }
  }

  const handleCreateRoom = (e) => {
    e.preventDefault()
    const name = newRoomName.trim()
    if (!name) {
      showToast('Por favor escribe un nombre para la sala', '⚠️')
      return
    }
    const created = DB.createRoom(name, currentUser)
    setNewRoomName('')
    refreshRooms()
    setSelectedRoom(created)
    showToast(`¡Sala "${name}" creada!`, '🎉')
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      showToast('Ingresa un código de invitación', '⚠️')
      return
    }
    try {
      const joined = DB.joinRoom(code, currentUser)
      setJoinCode('')
      refreshRooms()
      setSelectedRoom(joined)
      showToast(`Te has unido a "${joined.name}"`, '✅')
    } catch (err) {
      showToast(err.message || 'Código inválido', '❌')
    }
  }

  const handleLeaveRoom = (roomId) => {
    if (window.confirm('¿Seguro que deseas salir de esta sala?')) {
      DB.leaveRoom(roomId, currentUser)
      setSelectedRoom(null)
      refreshRooms()
      showToast('Has salido de la sala', 'ℹ️')
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    showToast('Código copiado al portapapeles', '📋')
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter users that are in the active room
  const users = DB.getUsers()
  const memberNames = selectedRoom ? selectedRoom.members : []
  const roomUsers = users.filter(u => memberNames.includes(u.name))
  const roomStandings = buildStandings(roomUsers, matches)

  const myRooms = rooms.filter(r => r.members.includes(currentUser))

  // Colombia theme palette (used for the UI you requested)
  const col = {
    cardBg: 'linear-gradient(135deg, rgba(0,20,60,0.78) 0%, rgba(0,28,75,0.62) 100%)',
    cardBorder: '1px solid rgba(255,255,255,0.12)',
    cardShadow: '0 20px 45px rgba(0,0,0,0.25)',
    text: 'rgba(255,255,255,0.92)',
    subText: 'rgba(255,255,255,0.70)',
    inputBg: 'rgba(0,20,60,0.55)',
    inputBorder: '1.5px solid rgba(255,255,255,0.12)',
    inputText: 'var(--color-tarjeta, #fff)',
    label: 'rgba(255,255,255,0.72)',
    actionBg: 'rgba(0,102,245,0.92)',
    actionHover: 'rgba(0,102,245,1)',
  }

  const themeIsColombia = theme === 'colombia'

  const normalPanelStyle = {
    background: 'rgba(255,255,255,0.97)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: '1.5rem',
    boxShadow: '0 24px 55px rgba(16,42,67,0.18)',
    backdropFilter: 'blur(16px)'
  }

  const renderTopCards = () => {
    // Shared styles (normal + Colombia)
    const normalCardBg = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)'
    const normalCardBorder = '1px solid rgba(255,255,255,0.92)'
    const normalCardShadow = '0 24px 52px rgba(16,42,67,0.16)'

    const labelColor = themeIsColombia ? col.label : 'var(--slate-500)'
    const titleColor = themeIsColombia ? col.text : 'var(--slate-900)'
    const subTitleColor = themeIsColombia ? col.subText : 'var(--slate-500)'

    const inputBg = themeIsColombia ? col.inputBg : '#f8fafc'
    const inputBorder = themeIsColombia ? col.inputBorder : '1.5px solid var(--slate-200)'
    const inputColor = themeIsColombia ? col.inputText : 'var(--slate-900)'

    const cardStyle = themeIsColombia
      ? { background: col.cardBg, border: col.cardBorder, borderRadius: '1.5rem', padding: '2rem', boxShadow: col.cardShadow, backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }
      : { background: normalCardBg, border: normalCardBorder, borderRadius: '1.5rem', padding: '1.75rem', boxShadow: normalCardShadow, backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '15rem' }

    const getActionBtnStyle = (normalColor) => ({
      width: '100%',
      padding: '0.9rem',
      borderRadius: '0.875rem',
      background: themeIsColombia ? col.actionBg : normalColor,
      color: 'var(--color-tarjeta, #fff)',
      border: 0,
      fontSize: '0.95rem',
      fontWeight: 900,
      cursor: 'pointer',
      fontFamily: 'inherit',
      boxShadow: themeIsColombia ? '0 8px 20px rgba(0,102,245,0.25)' : `0 10px 24px ${normalColor}40`,
      transition: 'transform 0.18s, filter 0.18s, box-shadow 0.18s',
    })

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Crear */}
        <div className="tema-panel-blanco" style={cardStyle}>
          <div>
            {!themeIsColombia && (
              <div style={{ width: '2.75rem', height: '0.28rem', borderRadius: '999px', background: '#00a651', marginBottom: '1.2rem' }} />
            )}
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: titleColor }}>
              Crear Nueva Sala
            </h3>
            <p style={{ color: subTitleColor, fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
              Serás el administrador de esta sala y obtendrás un código para invitar a tus amigos.
            </p>
          </div>

          <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 900, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Nombre de la Sala
              </label>
              <input
                type="text"
                placeholder="Ej: Amigos del Colegio, Oficina 2026..."
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.875rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  color: inputColor,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={getActionBtnStyle('#00a651')}
              onMouseEnter={e => {
                if (themeIsColombia) e.currentTarget.style.background = col.actionHover
                e.currentTarget.style.filter = 'brightness(1.05)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'none'
                e.currentTarget.style.transform = 'none'
                if (themeIsColombia) e.currentTarget.style.background = col.actionBg
              }}
            >
              Crear Sala →
            </button>
          </form>
        </div>

        {/* Unirse */}
        <div className="tema-panel-blanco" style={cardStyle}>
          <div>
            {!themeIsColombia && (
              <div style={{ width: '2.75rem', height: '0.28rem', borderRadius: '999px', background: '#0066f5', marginBottom: '1.2rem' }} />
            )}
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: titleColor }}>
              Unirse a una Sala
            </h3>
            <p style={{ color: subTitleColor, fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
              Pídele el código de 6 caracteres al administrador de la sala para unirte a su grupo.
            </p>
          </div>

          <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 900, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Código de Invitación
              </label>
              <input
                type="text"
                placeholder="Ej: ABCXYZ"
                maxLength={8}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.875rem',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: inputColor,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={getActionBtnStyle('#0066f5')}
              onMouseEnter={e => {
                if (themeIsColombia) e.currentTarget.style.background = col.actionHover
                e.currentTarget.style.filter = 'brightness(1.05)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'none'
                e.currentTarget.style.transform = 'none'
                if (themeIsColombia) e.currentTarget.style.background = col.actionBg
              }}
            >
              Unirse a Sala →
            </button>
          </form>
        </div>
      </div>
    )
  }

  const renderMisSalas = () => {
    const containerStyle = themeIsColombia
      ? {
          background: col.cardBg,
          border: col.cardBorder,
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: col.cardShadow,
          backdropFilter: 'blur(12px)'
        }
      : {
          ...normalPanelStyle,
          padding: '2rem',
        }

    return (
      <div className="tema-panel-blanco" style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, margin: 0, color: themeIsColombia ? col.text : 'var(--color-texto, #0f172a)' }}>
            Mis Salas
          </h3>
          <span style={{
            background: themeIsColombia ? 'rgba(255,255,255,0.08)' : 'rgba(0,102,245,0.08)',
            color: themeIsColombia ? col.text : '#0066f5',
            border: themeIsColombia ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,102,245,0.12)',
            borderRadius: '999px',
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: 900
          }}>
            {myRooms.length} {myRooms.length === 1 ? 'sala' : 'salas'}
          </span>
        </div>

        {myRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: themeIsColombia ? col.text : 'var(--color-texto, #475569)', background: themeIsColombia ? 'transparent' : '#f8fafc', border: themeIsColombia ? 0 : '1px dashed var(--slate-200)', borderRadius: '1.25rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👥</span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: themeIsColombia ? col.text : '#111827' }}>
              No estás unido a ninguna sala todavía.
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: themeIsColombia ? col.subText : '#64748b' }}>
              ¡Crea una sala arriba o únete usando el código de un amigo!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {myRooms.map(room => {
              const isAdmin = room.creator === currentUser
              return (
                <div
                  className="tema-panel-item"
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    background: themeIsColombia ? 'rgba(255,255,255,0.06)' : 'var(--color-tarjeta, #fff)',
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: themeIsColombia ? '0 10px 24px rgba(0,0,0,0.15)' : '0 12px 28px rgba(16,42,67,0.08)',
                    border: themeIsColombia ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '8rem',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!themeIsColombia) {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 18px 36px rgba(16,42,67,0.14)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!themeIsColombia) {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(16,42,67,0.08)'
                    }
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: isAdmin ? 'rgba(243,156,18,0.1)' : 'rgba(0,102,245,0.1)',
                        color: isAdmin ? '#f39c12' : '#0066f5',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        textTransform: 'uppercase'
                      }}>
                        {isAdmin ? 'Administrador' : 'Miembro'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: themeIsColombia ? 'rgba(255,255,255,0.70)' : 'var(--slate-400)', fontWeight: 700 }}>
                        👤 {room.members.length} miembros
                      </span>
                    </div>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: 800, margin: 0, color: themeIsColombia ? 'rgba(255,255,255,0.92)' : 'var(--slate-800)' }}>
                      {room.name}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: themeIsColombia ? 'rgba(255,255,255,0.70)' : 'var(--slate-400)' }}>
                      Código: <strong style={{ color: '#00a651', fontFamily: 'monospace' }}>{room.code}</strong>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#00a651', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Entrar →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: `var(--bg-salas, url(${fondoSalas}))`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: themeIsColombia
          ? 'linear-gradient(180deg, rgba(8,16,35,0.82) 0%, rgba(10,25,50,0.78) 50%, rgba(8,16,35,0.85) 100%)'
          : 'linear-gradient(180deg, rgba(4,12,24,0.72) 0%, rgba(6,18,36,0.62) 48%, rgba(4,12,24,0.76) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '72rem', margin: '0 auto', padding: '6.5rem 1rem 3rem' }}>
        {selectedRoom ? (
          <div className="animate-fade-in">
            <button
              onClick={() => setSelectedRoom(null)}
              style={{
                background: themeIsColombia ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.94)',
                border: themeIsColombia ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15,23,42,0.08)',
                color: themeIsColombia ? 'var(--color-tarjeta, #fff)' : 'var(--slate-700)',
                padding: '0.6rem 1.2rem',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                transition: 'all 0.2s',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = themeIsColombia ? 'rgba(255,255,255,0.2)' : '#fff')}
              onMouseLeave={e => (e.currentTarget.style.background = themeIsColombia ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.94)')}
            >
              ← Volver a mis salas
            </button>

            <div style={{
              background: themeIsColombia ? 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.85) 100%)' : 'rgba(255,255,255,0.97)',
              border: themeIsColombia ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: themeIsColombia ? '0 20px 40px rgba(0,0,0,0.3)' : '0 24px 55px rgba(16,42,67,0.18)',
              backdropFilter: 'blur(16px)',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    background: '#00a651',
                    color: 'var(--color-tarjeta, #fff)',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Sala de amigos
                  </span>
                  {selectedRoom.creator === currentUser && (
                    <span style={{
                      background: 'rgba(243,156,18,0.2)',
                      border: '1px solid rgba(243,156,18,0.3)',
                      color: '#f39c12',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px'
                    }}>
                      Administrador
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, margin: 0, color: themeIsColombia ? 'var(--color-tarjeta, #fff)' : 'var(--slate-900)' }}>
                  {selectedRoom.name}
                </h1>
                <p style={{ color: themeIsColombia ? 'rgba(255,255,255,0.6)' : 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Creado por <strong>{selectedRoom.creator}</strong> · {selectedRoom.members.length} miembros unidos
                </p>
              </div>

              <div style={{
                background: themeIsColombia ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                border: themeIsColombia ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--slate-200)',
                padding: '1rem 1.5rem',
                borderRadius: '1.25rem',
                textAlign: 'center',
                minWidth: '15rem',
              }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: themeIsColombia ? 'rgba(255,255,255,0.5)' : 'var(--slate-500)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.06em'
                }}>
                  Código para Invitar Amigos
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <code style={{
                    fontFamily: 'monospace',
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: '#00a651',
                    letterSpacing: '0.1em'
                  }}>
                    {selectedRoom.code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(selectedRoom.code)}
                    style={{
                      background: copied ? '#00a651' : themeIsColombia ? 'rgba(255,255,255,0.1)' : '#0066f5',
                      border: 0,
                      color: 'var(--color-tarjeta, #fff)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? '¡Listo!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              background: themeIsColombia ? 'rgba(15,23,42,0.3)' : 'rgba(255,255,255,0.94)',
              padding: '0.35rem',
              borderRadius: '0.95rem',
              border: themeIsColombia ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
              marginBottom: '1.5rem',
              maxWidth: 'fit-content',
              boxShadow: themeIsColombia ? 'none' : '0 14px 30px rgba(16,42,67,0.12)'
            }}>
              <button
                onClick={() => setSubTab('ranking')}
                style={{
                  background: subTab === 'ranking' ? (themeIsColombia ? '#fff' : '#0066f5') : 'transparent',
                  color: subTab === 'ranking' ? (themeIsColombia ? '#0f172a' : '#fff') : (themeIsColombia ? 'rgba(255,255,255,0.8)' : 'var(--slate-600)'),
                  border: 0,
                  padding: '0.6rem 1.2rem',
                  borderRadius: '0.7rem',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🏆 Posiciones de la Sala
              </button>
              <button
                onClick={() => setSubTab('pronosticos')}
                style={{
                  background: subTab === 'pronosticos' ? (themeIsColombia ? '#fff' : '#0066f5') : 'transparent',
                  color: subTab === 'pronosticos' ? (themeIsColombia ? '#0f172a' : '#fff') : (themeIsColombia ? 'rgba(255,255,255,0.8)' : 'var(--slate-600)'),
                  border: 0,
                  padding: '0.6rem 1.2rem',
                  borderRadius: '0.7rem',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ⚽ Comparar Apuestas
              </button>
            </div>

            {subTab === 'ranking' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="animate-fade-in">
                <div style={{
                  background: 'rgba(255,255,255,0.96)',
                  borderRadius: '1.5rem',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.8)'
                }}>
                  <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-texto, #0f172a)' }}>
                      Tabla de Clasificación Exclusiva
                    </h3>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      Solo los miembros de esta sala aparecen en esta tabla.
                    </p>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '1rem 1.5rem', fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-500)', textTransform: 'uppercase', textAlign: 'left', width: '4rem' }}>#</th>
                          <th style={{ padding: '1rem 1.5rem', fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-500)', textTransform: 'uppercase', textAlign: 'left' }}>Jugador</th>
                          <th style={{ padding: '1rem 1.5rem', fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-500)', textTransform: 'uppercase', textAlign: 'center' }}>Apuestas</th>
                          <th style={{ padding: '1rem 1.5rem', fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-500)', textTransform: 'uppercase', textAlign: 'center' }}>Marcador Exacto</th>
                          <th style={{ padding: '1rem 1.5rem', fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-500)', textTransform: 'uppercase', textAlign: 'center', width: '6rem' }}>Puntos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomStandings.map((player, idx) => {
                          const isMe = player.name === currentUser
                          const color = getAvatarColor(player.name)
                          return (
                            <tr key={player.name} style={{
                              background: isMe ? 'rgba(0,166,81,0.05)' : 'transparent',
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background 0.2s'
                            }}>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                {idx < 3 ? (
                                  <span style={{ fontSize: '1.25rem' }}>{['🥇', '🥈', '🥉'][idx]}</span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '1.75rem',
                                    height: '1.75rem',
                                    borderRadius: '50%',
                                    background: '#f1f5f9',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: 'var(--slate-600)'
                                  }}>{idx + 1}</span>
                                )}
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{
                                    width: '2.25rem',
                                    height: '2.25rem',
                                    borderRadius: '50%',
                                    background: color,
                                    color: 'var(--color-tarjeta, #fff)',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                  }}>
                                    {player.name[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.95rem' }}>{player.name}</span>
                                    {isMe && <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', fontWeight: 900, color: '#00a651', background: 'rgba(0,166,81,0.1)', padding: '0.15rem 0.45rem', borderRadius: '999px', textTransform: 'uppercase' }}>Tú</span>}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--slate-600)' }}>{player.betsMade}</td>
                              <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 700, color: '#f39c12' }}>{player.exactScores} 🎯</td>
                              <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                <span style={{
                                  background: 'rgba(0,102,245,0.1)',
                                  color: 'var(--color-primario, #0066f5)',
                                  fontWeight: 900,
                                  fontSize: '0.85rem',
                                  padding: '0.3rem 0.8rem',
                                  borderRadius: '999px'
                                }}>
                                  {player.totalPoints} pts
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {subTab === 'pronosticos' && (
              <div style={{ display: 'grid', gap: '1.5rem' }} className="animate-fade-in">
                <div style={{
                  background: themeIsColombia ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.97)',
                  border: themeIsColombia ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.9)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  color: themeIsColombia ? 'var(--color-tarjeta, #fff)' : 'var(--slate-900)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: themeIsColombia ? 'none' : '0 14px 30px rgba(16,42,67,0.12)'
                }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800 }}>Deportividad ante todo</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: themeIsColombia ? 'rgba(255,255,255,0.75)' : 'var(--slate-500)', lineHeight: 1.5 }}>
                    Las apuestas de tus amigos solo se revelarán una vez que el partido haya **comenzado o finalizado** (simulado/finalizado) para evitar copias. ¡Sé el mejor estratega!
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {matches.map(match => {
                    const hasResult = match.resLocal !== null && match.resVisitor !== null
                    const matchBets = roomUsers.map(user => {
                      const bet = user.bets[match.id]
                      return { username: user.name, bet }
                    }).filter(b => b.bet !== undefined)

                    return (
                      <div key={match.id} style={{
                        background: 'var(--color-tarjeta, #fff)',
                        borderRadius: '1.25rem',
                        padding: '1.25rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: 800, marginBottom: '0.75rem' }}>
                            <span>{match.fecha}</span>
                            <span style={{
                              color: hasResult ? '#0066f5' : '#f39c12',
                              background: hasResult ? 'rgba(0,102,245,0.08)' : 'rgba(243,156,18,0.08)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '0.4rem',
                              textTransform: 'uppercase'
                            }}>
                              {hasResult ? 'Finalizado' : 'Pendiente'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.75rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.85rem' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end', fontWeight: 800, fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                              <span>{match.local}</span>
                              <TeamFlag code={data.equipos[match.local]?.code} name={match.local} style={{ width: '1.3rem', height: '1.3rem', borderRadius: '50%' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                              <span>{hasResult ? match.resLocal : '-'}</span>
                              <span style={{ color: 'var(--slate-300)' }}>:</span>
                              <span>{hasResult ? match.resVisitor : '-'}</span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-start', fontWeight: 800, fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                              <TeamFlag code={data.equipos[match.visitante]?.code} name={match.visitante} style={{ width: '1.3rem', height: '1.3rem', borderRadius: '50%' }} />
                              <span>{match.visitante}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-400)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                            Pronósticos del grupo ({matchBets.length})
                          </span>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {matchBets.length === 0 ? (
                              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>Ningún amigo ha apostado aún.</span>
                            ) : (
                              matchBets.map(mb => {
                                const isMe = mb.username === currentUser
                                const showPrediction = hasResult || isMe
                                const color = getAvatarColor(mb.username)

                                let scorePoints = null
                                if (hasResult && mb.bet) {
                                  scorePoints = calculateMatchPoints(
                                    mb.bet.local,
                                    mb.bet.visitor,
                                    match.resLocal,
                                    match.resVisitor
                                  )
                                }

                                return (
                                  <div key={mb.username} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '0.65rem',
                                    background: isMe ? 'rgba(0,166,81,0.04)' : '#f8fafc',
                                    border: isMe ? '1px solid rgba(0,166,81,0.15)' : '1px solid #f1f5f9'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div style={{
                                        width: '1.6rem',
                                        height: '1.6rem',
                                        borderRadius: '50%',
                                        background: color,
                                        color: 'var(--color-tarjeta, #fff)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontWeight: 800,
                                        fontSize: '0.7rem'
                                      }}>
                                        {mb.username[0].toUpperCase()}
                                      </div>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                                        {mb.username} {isMe && '(Tú)'}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 900,
                                        color: showPrediction ? 'var(--slate-800)' : 'var(--slate-400)',
                                        fontFamily: showPrediction ? 'monospace' : 'inherit'
                                      }}>
                                        {showPrediction ? `${mb.bet.local} - ${mb.bet.visitor}` : '🔒 Oculto'}
                                      </span>

                                      {hasResult && scorePoints !== null && (
                                        <span style={{
                                          background: scorePoints === 3 ? '#e8f8f0' : scorePoints > 0 ? '#e3f2fd' : '#ffebee',
                                          color: scorePoints === 3 ? '#2e7d32' : scorePoints > 0 ? '#1565c0' : '#c62828',
                                          fontWeight: 900,
                                          fontSize: '0.68rem',
                                          padding: '0.15rem 0.4rem',
                                          borderRadius: '0.35rem'
                                        }}>
                                          {scorePoints === 3 ? '+3🎯' : `+${scorePoints}`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
              <button
                onClick={() => handleLeaveRoom(selectedRoom.id)}
                style={{
                  background: 'rgba(225,26,39,0.1)',
                  border: '1px solid rgba(225,26,39,0.2)',
                  color: '#e11a27',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e11a27'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(225,26,39,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(225,26,39,0.1)'
                  e.currentTarget.style.color = '#e11a27'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Salir de esta sala
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.25rem', fontWeight: 800, margin: 0, color: 'var(--color-tarjeta, #fff)', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                Salas de <span style={{ color: '#00a651' }}>Juego</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Crea una sala privada para competir exclusivamente con tus amigos o únete a una existente usando un código de invitación.
              </p>
            </div>

            {renderTopCards()}
            {renderMisSalas()}
          </div>
        )}
      </div>
    </div>
  )
}