import { useState } from 'react'
import data from '../data/partidos.json'

export default function Inicio({ onLogin }) {
  const [customName, setCustomName] = useState('')

  const handleCustomLogin = () => {
    const name = customName.trim()
    if (!name) return
    onLogin(name)
    setCustomName('')
  }

  const inputStyle = {
    flex: 1, padding: '0.75rem 1rem',
    background: 'var(--slate-50)',
    border: '1.5px solid var(--slate-200)',
    borderRadius: '0.75rem',
    outline: 'none',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: 'var(--slate-800)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }} />
      <div className="animate-float" style={{ position: 'absolute', top: '20%', left: '15%', width: '24rem', height: '24rem', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
      <div className="animate-float" style={{ position: 'absolute', bottom: '20%', right: '15%', width: '24rem', height: '24rem', background: 'rgba(245,158,11,0.08)', borderRadius: '50%', filter: 'blur(80px)', animationDelay: '1.5s' }} />

      {/* Card */}
      <div className="glass animate-fade-in-up" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '28rem', borderRadius: '1.5rem', boxShadow: '0 32px 64px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '2.5rem' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '1.25rem', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 12px 32px rgba(16,185,129,0.3)' }}>
              <span style={{ fontSize: '2rem' }}>⚽</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--slate-800)' }}>Polla Mundialista</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', margin: 0 }}>Predice, apuesta y gana con la ayuda de nuestra IA 🤖</p>
          </div>

          {/* Quick users */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Jugadores Rápidos
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {data.usuariosPredefinidos.map(user => (
                <button
                  key={user}
                  onClick={() => onLogin(user)}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--slate-50)',
                    border: '1.5px solid var(--slate-200)',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--slate-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-500)'; e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-700)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.background = 'var(--slate-50)'; e.currentTarget.style.color = 'var(--slate-700)' }}
                >
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{user[0]}</div>
                  {user}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--slate-200)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', background: '#fff', padding: '0 0.75rem', borderRadius: '999px' }}>o crea tu perfil</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--slate-200)' }} />
          </div>

          {/* Custom name */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomLogin()}
              placeholder="Tu nombre..."
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--slate-200)'; e.target.style.boxShadow = 'none' }}
            />
            <button
              onClick={handleCustomLogin}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
                color: '#fff', border: 'none', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                transition: 'opacity 0.2s, transform 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>

      <p style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
        © 2026 Polla Mundialista. Hecho con ⚽ y 🤖
      </p>
    </div>
  )
}
