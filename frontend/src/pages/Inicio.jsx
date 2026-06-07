import { useState, useEffect } from 'react'
import data from '../data/partidos.json'
import TeamFlag from '../components/TeamFlag.jsx'
import { DB } from '../App.jsx'
import fondoInicio from '../assets/fondo_inicio.png'

function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

const inputStyle = {
  width: '100%', padding: '0.85rem 1rem',
  background: 'var(--slate-50)',
  border: '1.5px solid var(--slate-200)',
  borderRadius: '0.875rem', fontSize: '0.95rem',
  fontFamily: 'inherit', color: 'var(--slate-900)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

function primaryBtn(color) {
  return {
    width: '100%', padding: '0.9rem', borderRadius: '0.875rem',
    background: color, color: '#fff', border: 0,
    fontSize: '0.95rem', fontWeight: 900, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: `0 8px 20px ${color}44`,
    transition: 'transform 0.18s, opacity 0.18s',
  }
}

function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Inicio({ onLogin }) {
  const [mode, setMode] = useState('welcome')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

  const triggerError = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const resetForm = () => {
    setError('')
    setName('')
    setPassword('')
    setConfirmPassword('')
    setShowPass(false)
  }

  const handleLogin = () => {
    const trimmed = name.trim()
    if (!trimmed) { triggerError('Escribe tu nombre'); return }
    if (!password) { triggerError('Escribe tu contraseña'); return }

    if (trimmed.toLowerCase() === 'proyecto') {
      if (password !== '123') {
        triggerError('Contraseña incorrecta')
        return
      }
      onLogin('Proyecto', true)
      return
    }

    const users = DB.getUsers()
    const user = users.find(u => u.name.toLowerCase() === trimmed.toLowerCase())
    if (!user) { triggerError('Usuario no encontrado. ¿Ya tienes cuenta?'); return }

    if (!user.passwordHash) {
      const updated = users.map(u =>
        u.name.toLowerCase() === trimmed.toLowerCase()
          ? { ...u, passwordHash: hashPassword(password) } : u
      )
      DB.saveUsers(updated)
      onLogin(user.name)
      return
    }
    if (user.passwordHash !== hashPassword(password)) {
      triggerError('Contraseña incorrecta')
      return
    }
    onLogin(user.name)
  }

  const handleRegister = () => {
    const trimmed = name.trim()
    if (!trimmed) { triggerError('Escribe un nombre'); return }
    if (trimmed.toLowerCase() === 'proyecto') { triggerError('Ese nombre está reservado'); return }
    if (trimmed.length < 2) { triggerError('Mínimo 2 caracteres'); return }
    if (!password) { triggerError('Crea una contraseña'); return }
    if (password.length < 4) { triggerError('Mínimo 4 caracteres'); return }
    if (password !== confirmPassword) { triggerError('Las contraseñas no coinciden'); return }

    const users = DB.getUsers()
    const exists = users.find(u => u.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) { triggerError('Ese nombre ya está en uso'); return }

    const newUser = { name: trimmed, bets: {}, passwordHash: hashPassword(password) }
    DB.saveUsers([...users, newUser])
    onLogin(trimmed)
  }

  const firstMatch = data.partidos?.[0]
  const localTeam = firstMatch ? data.equipos[firstMatch.local] : null
  const visitorTeam = firstMatch ? data.equipos[firstMatch.visitante] : null
  const goToMode = (m) => { resetForm(); setMode(m) }

  return (
    <div style={{
      minHeight: '100vh',
      marginTop: '-72px',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `url(${fondoInicio})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '3rem',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(4,10,30,0.90) 0%, rgba(0,28,75,0.74) 55%, rgba(4,10,30,0.88) 100%)',
        zIndex: 0,
      }} />
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '36rem', height: '36rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-8rem', left: '-8rem', width: '28rem', height: '28rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.035)', zIndex: 0 }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '76rem',
        margin: '0 auto',
        padding: '5rem 1.5rem 3rem',
        display: 'grid',
        gridTemplateColumns: mode === 'welcome' ? '1fr' : 'minmax(0,1.25fr) minmax(0,0.75fr)',
        gap: mode === 'welcome' ? '2.5rem' : '6.25rem',
        alignItems: 'center',
      }}>

        {/* ── HERO ── */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.45rem 1rem', borderRadius: '999px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#fff', marginBottom: '2rem',
          }}>
            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 4px rgba(74,222,128,0.2)' }} />
            FIFA World Cup 2026
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', margin: '0 0 1.25rem',
            fontSize: 'clamp(2.4rem, 5.5vw, 4.8rem)',
            fontWeight: 900, lineHeight: 0.92, color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            Polla<br />
            <span style={{ color: '#00a651' }}>Mundialista</span>
            <br />
            <span style={{ fontSize: '0.52em', fontWeight: 400, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
              Mundial 2026
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '1rem',
            lineHeight: 1.75, maxWidth: '32rem', margin: '0 0 2rem',
          }}>
            Pronostica marcadores, compite con tu grupo y deja que la IA te de una pista antes de cada partido.
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
            {[
              { v: data.partidos?.length || 0, l: 'Partidos' },
              { v: '12', l: 'Grupos' },
              { v: '3 pts', l: 'Máximo' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{l}</div>
              </div>
            ))}
          </div>

          {firstMatch && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.85rem',
              padding: '0.7rem 1.2rem', borderRadius: '0.875rem',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)', marginBottom: '2.25rem',
            }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 900, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Primer duelo</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TeamFlag code={localTeam?.code} name={firstMatch.local} style={{ width: '1.3rem', height: '1.3rem', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>{firstMatch.local}</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e11a27' }}>vs</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TeamFlag code={visitorTeam?.code} name={firstMatch.visitante} style={{ width: '1.3rem', height: '1.3rem', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>{firstMatch.visitante}</span>
              </div>
            </div>
          )}

          {mode === 'welcome' && (
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button onClick={() => goToMode('login')} style={{
                padding: '0.875rem 2rem', borderRadius: '999px',
                background: '#0066f5', color: '#fff', border: 0,
                fontSize: '0.9rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 8px 24px rgba(0,102,245,0.35)',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,102,245,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,102,245,0.35)' }}
              >
                Iniciar sesión
              </button>
              <button onClick={() => goToMode('register')} style={{
                padding: '0.875rem 2rem', borderRadius: '999px',
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.22)',
                fontSize: '0.9rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'transform 0.18s, background 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              >
                Crear cuenta
              </button>
            </div>
          )}
        </div>

        {/* ── FORM PANEL ── */}
        {mode !== 'welcome' && (
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(32px)',
            transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            justifySelf: 'end',
            maxWidth: '42rem',
          }}>
            <div
              className={shake ? 'animate-shake' : ''}
              style={{
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(24px)',
                borderRadius: '1.75rem',
                padding: '2rem',
                boxShadow: '0 32px 72px rgba(0,0,0,0.32)',
                border: '1px solid rgba(255,255,255,0.85)',
              }}
            >
              <button onClick={() => goToMode('welcome')} style={{
                background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--slate-400)', fontSize: '0.78rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                marginBottom: '1.5rem', padding: 0,
                transition: 'color 0.18s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--slate-700)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--slate-400)'}
              >
                ← Volver
              </button>

              {mode === 'login' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.3rem', color: 'var(--slate-900)' }}>
                      Bienvenido de vuelta
                    </h2>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
                      Ingresa tus datos para continuar.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <FormField label="Nombre de usuario">
                      <input type="text" value={name} autoFocus
                        onChange={e => { setName(e.target.value); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="Tu nombre" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0066f5'}
                        onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                      />
                    </FormField>
                    <FormField label="Contraseña">
                      <div style={{ position: 'relative' }}>
                        <input type={showPass ? 'text' : 'password'} value={password}
                          onChange={e => { setPassword(e.target.value); setError('') }}
                          onKeyDown={e => e.key === 'Enter' && handleLogin()}
                          placeholder="••••••••" style={{ ...inputStyle, paddingRight: '3rem' }}
                          onFocus={e => e.target.style.borderColor = '#0066f5'}
                          onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--slate-400)', fontSize: '0.95rem', lineHeight: 1 }}>
                          {showPass ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </FormField>
                    {error && <p style={{ color: '#e11a27', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>{error}</p>}
                    <button onClick={handleLogin} style={primaryBtn('#00a651')}>Entrar →</button>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)', margin: '0.25rem 0 0' }}>
                      ¿No tienes cuenta?{' '}
                      <button onClick={() => goToMode('register')} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#0066f5', fontWeight: 800, fontSize: '0.78rem', fontFamily: 'inherit', padding: 0 }}>
                        Créala aquí
                      </button>
                    </p>
                  </div>
                </>
              )}

              {mode === 'register' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.3rem', color: 'var(--slate-900)' }}>
                      Crea tu cuenta
                    </h2>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
                      Un nombre y contraseña, y listo.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <FormField label="Nombre de usuario">
                      <input type="text" value={name} autoFocus
                        onChange={e => { setName(e.target.value); setError('') }}
                        placeholder="¿Cómo te llamas?" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0066f5'}
                        onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                      />
                    </FormField>
                    <FormField label="Contraseña">
                      <div style={{ position: 'relative' }}>
                        <input type={showPass ? 'text' : 'password'} value={password}
                          onChange={e => { setPassword(e.target.value); setError('') }}
                          placeholder="Mínimo 4 caracteres" style={{ ...inputStyle, paddingRight: '3rem' }}
                          onFocus={e => e.target.style.borderColor = '#0066f5'}
                          onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--slate-400)', fontSize: '0.95rem', lineHeight: 1 }}>
                          {showPass ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </FormField>
                    <FormField label="Confirmar contraseña">
                      <input type={showPass ? 'text' : 'password'} value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleRegister()}
                        placeholder="Repite la contraseña" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0066f5'}
                        onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                      />
                    </FormField>
                    {error && <p style={{ color: '#e11a27', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>{error}</p>}
                    <button onClick={handleRegister} style={primaryBtn('#e11a27')}>Crear cuenta →</button>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)', margin: '0.25rem 0 0' }}>
                      ¿Ya tienes cuenta?{' '}
                      <button onClick={() => goToMode('login')} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#0066f5', fontWeight: 800, fontSize: '0.78rem', fontFamily: 'inherit', padding: 0 }}>
                        Inicia sesión
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <p style={{
        position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', fontWeight: 600,
        zIndex: 1, whiteSpace: 'nowrap', letterSpacing: '0.06em',
      }}>
        2026 · Polla Mundialista IA
      </p>
    </div>
  )
}