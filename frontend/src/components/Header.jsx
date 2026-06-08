import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Pill from './Pill.jsx'



const colors = {
  green: '#00a651',
  coral: '#e11a27',
  blue: '#0066f5',
  ink: '#102a43',
}

const icons = {
  partidos: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16M4 12h16M7.5 6.5l9 11M16.5 6.5l-9 11" />
    </svg>
  ),
  grupos: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  tabla: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5H3v2a4 4 0 004 4M19 5h2v2a4 4 0 01-4 4" />
    </svg>
  ),
  salas: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  eliminatorias: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  admin: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.4 15a8 8 0 00.1-1l2-1.5-2-3.5-2.4 1a7 7 0 00-1.7-1L15 6.5h-4L10.6 9a7 7 0 00-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 00.1 2l-2 1.5 2 3.5 2.4-1a7 7 0 001.7 1l.4 2.5h4l.4-2.5a7 7 0 001.7 -1l2.4 1 2-3.5L19.4 15z" />
    </svg>
  ),
}

const navButtonBase = {
  border: '1px solid transparent',
  borderRadius: '999px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export default function Header({ currentUser, view, onNavigate, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = currentUser === 'Proyecto'
    ? [{ key: 'admin', label: 'Admin' }]
    : [
        { key: 'partidos', label: 'Partidos' },
        { key: 'grupos', label: 'Grupos' },
        { key: 'tabla', label: 'Tabla' },
        { key: 'salas', label: 'Salas' },
        { key: 'eliminatorias', label: 'Fase Final' },
      ]


  const userInitial = currentUser?.[0]?.toUpperCase() || '?'

  // Variantes para animaciones
  const headerBarVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 100, damping: 20, delay: 0.1 } 
    }
  }

  const userSectionVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 100, damping: 20, delay: 0.2 } 
    }
  }

  return (
    <>
      <motion.nav
        className="app-header"
        initial={false}
        animate={{
          padding: scrolled ? '0.55rem 1rem 0' : '0.75rem 1rem 0',
          background: scrolled ? 'rgba(244,246,249,0.95)' : 'rgba(255,255,255,0.9)',
          boxShadow: scrolled 
            ? '0 18px 46px rgba(18,48,68,0.12)' 
            : '0 10px 28px rgba(18,48,68,0.06)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 100,
          borderBottom: '1px solid rgba(45,120,163,0.12)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <motion.div
          className="header-bar"
          variants={headerBarVariants}
          initial="hidden"
          animate="visible"
          style={{
            maxWidth: '80rem',
            height: '3.85rem',
            margin: '0 auto',
            padding: '0.55rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(255,255,255,0.76)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 16px 42px rgba(18,48,68,0.1)',
          }}
        >
          {/* Brand / Logo */}
          <motion.button
            onClick={() => onNavigate('partidos')}
            className="header-brand"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(136,218,136,0.16)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...navButtonBase,
              minWidth: 0,
              padding: '0.35rem 0.65rem 0.35rem 0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: colors.ink,
              background: 'transparent',
            }}
            aria-label="Ir a partidos"
          >
            <span
              style={{
                width: '2.55rem',
                height: '2.55rem',
                flex: '0 0 auto',
                borderRadius: '0.9rem',
                background: 'var(--color-primario, #0066f5)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--color-tarjeta, #fff)',
                boxShadow: '0 14px 26px rgba(0, 102, 245, 0.24)',
              }}
            >
              <span style={{ width: '1.1rem', height: '1.1rem', borderRadius: '50%', border: '3px solid #fff', display: 'block' }} />
            </span>
            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', letterSpacing: 0, whiteSpace: 'nowrap' }}>
                Polla Mundialista
              </span>
              <span style={{ marginTop: '0.22rem', color: 'var(--color-primario, #0066f5)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Mundial 2026
              </span>
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <div
            className="desktop-nav"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.32rem',
              borderRadius: '999px',
              background: 'var(--slate-100, #f1f5f9)',
              border: '1px solid var(--slate-200, #e2e8f0)',
            }}
          >
            {navItems.map(item => {
              const active = view === item.key
              return (
                <motion.button
                                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  layout
                  initial={false}
                  className={active ? 'nav-active' : ''}
                  animate={{
                    background: active ? '#fff' : 'transparent',
                    color: active ? colors.blue : 'rgba(18,48,68,0.68)',
                    borderColor: active ? 'rgba(0,102,245,0.25)' : 'transparent',
                    boxShadow: active ? '0 10px 24px rgba(0,102,245,0.15)' : 'none',
                  }}
                  whileHover={{ 
                    y: -2, 
                    backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.6)' 
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    ...navButtonBase,
                    minHeight: '2.45rem',
                    padding: '0.55rem 0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                  }}
                >
                  {icons[item.key]}
                  {item.label}
                </motion.button>
              )
            })}
          </div>

          {/* User Section */}
          <motion.div 
            className="user-section"
            variants={userSectionVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}
          >
            <Pill small style={{ paddingLeft: '0.4rem', background: 'var(--color-tarjeta, #fff)', border: '1px solid rgba(45,120,163,0.13)', boxShadow: '0 10px 24px rgba(18,48,68,0.07)' }}>
              <span
                style={{
                  width: '2rem',
                  height: '2rem',
                  flex: '0 0 auto',
                  borderRadius: '0.75rem',
                  background: colors.coral,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--color-tarjeta, #fff)',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                }}
              >
                {userInitial}
              </span>
              <span style={{ minWidth: 0, maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem', fontWeight: 900, color: colors.ink }}>
                {currentUser}
              </span>
            </Pill>


            {/* Logout button */}
            <motion.button
              onClick={onLogout}
              title="Salir"
              aria-label="Cerrar sesion"
              whileHover={{ 
                y: -2, 
                backgroundColor: colors.coral, 
                color: 'var(--color-tarjeta, #fff)',
                boxShadow: '0 12px 24px rgba(249,97,69,0.24)'
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                ...navButtonBase,
                width: '2.75rem',
                height: '2.75rem',
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(249,97,69,0.1)',
                borderColor: 'rgba(249,97,69,0.18)',
                color: colors.coral,
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H8m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Mobile Nav */}
        <motion.div
          className="mobile-nav"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            maxWidth: '80rem',
            margin: '0.35rem auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '0.45rem',
            padding: '0.25rem',
            borderRadius: '1.1rem 1.1rem 0 0',
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderBottom: 0,
            boxShadow: '0 -4px 24px rgba(18,48,68,0.06)',
          }}
        >
          {navItems.map(item => {
            const active = view === item.key
            return (
              <motion.button
                                key={item.key}
                onClick={() => onNavigate(item.key)}
                layout
                initial={false}
                className={active ? 'nav-active' : ''}
                animate={{
                  color: active ? '#fff' : 'rgba(18,48,68,0.58)',
                  background: active ? colors.blue : 'transparent',
                  boxShadow: active ? '0 12px 24px rgba(0,102,245,0.25)' : 'none',
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  ...navButtonBase,
                  minWidth: 0,
                  minHeight: '2.45rem',
                  padding: '0.45rem 0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.16rem',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                }}
              >
                {icons[item.key]}
                <span>{item.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        <style>{`
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .mobile-nav { display: none !important; }
          }

          @media (max-width: 767px) {
            .app-header { padding: 0.45rem 0.7rem 0 !important; }
            .header-bar { height: 3.45rem !important; border-radius: 1rem !important; }
            .header-brand { padding-right: 0.35rem !important; }
            .header-brand span span:first-child { font-size: 0.88rem !important; }
            .header-brand span span:last-child { display: none !important; }
            .user-pill { padding-right: 0.35rem !important; }
            .user-pill > span:last-child { display: none !important; }
          }

          @media (max-width: 420px) {
            .header-brand > span:first-child { width: 2.35rem !important; height: 2.35rem !important; }
            .header-brand span span:first-child { display: none !important; }
          }
        `}</style>
      </motion.nav>
    </>
  )
}