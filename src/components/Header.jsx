import { useState, useEffect } from 'react'

export default function Header({ currentUser, view, onNavigate, onLogout }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { key: 'partidos', label: 'Partidos', emoji: '⚽' },
    { key: 'tabla',    label: 'Tabla',    emoji: '🏆' },
    { key: 'admin',    label: 'Admin',    emoji: '⚙️' },
  ]

  const btnBase = {
    padding: '0.375rem 1rem',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 100,
      background: scrolled ? 'rgba(15,23,42,0.97)' : 'rgba(15,23,42,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* Main bar */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

        {/* Logo */}
        <div
          onClick={() => onNavigate('partidos')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }}>
            <span style={{ fontSize: '1.1rem' }}>⚽</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            Polla<span style={{ color: 'var(--brand-400)' }}>Mundialista</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', padding: '0.25rem' }}
          className="desktop-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                ...btnBase,
                background: view === item.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: view === item.key ? '#fff' : 'rgba(255,255,255,0.6)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.375rem 0.875rem 0.375rem 0.375rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-400), var(--brand-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
              {currentUser?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{currentUser}</span>
          </div>
          <button
            onClick={onLogout}
            title="Salir"
            style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.98)' }}
        className="mobile-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
              fontSize: '0.7rem', fontWeight: 500,
              color: view === item.key ? 'var(--brand-400)' : 'rgba(255,255,255,0.4)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.375rem 1rem', borderRadius: '0.5rem',
              transition: 'color 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav  { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
