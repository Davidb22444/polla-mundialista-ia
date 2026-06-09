import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Pill from './Pill.jsx'

const colors = {
  green: '#00a651',
  coral: '#e11a27',
  blue: '#0066f5',
  ink: '#102a43',
  colombiaYellow: '#FCD116',
  colombiaYellowText: '#0a1628',
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.4 15a8 8 0 00.1-1l2-1.5-2-3.5-2.4 1a7 7 0 00-1.7-1L15 6.5h-4L10.6 9a7 7 0 00-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 00.1 2l-2 1.5 2 3.5 2.4-1a7 7 0 001.7 1l.4 2.5h4l.4-2.5a7 7 0 001.7-1l2.4 1 2-3.5L19.4 15z" />
    </svg>
  ),
}

const navButtonBase = {
  border: '1px solid transparent',
  borderRadius: '999px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export default function Header({ currentUser, view, onNavigate, onLogout, theme, themeSwitcher }) {
  const [scrolled, setScrolled] = useState(false)
  const themeIsColombia = theme === 'colombia'

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

  // Colores del botón activo según el tema
  const activeBg = themeIsColombia ? colors.colombiaYellow : '#fff'
  const activeColor = themeIsColombia ? colors.colombiaYellowText : colors.blue
  const activeBorderColor = themeIsColombia ? 'rgba(252,209,22,0.5)' : 'rgba(0,102,245,0.25)'
  const activeBoxShadow = themeIsColombia ? '0 6px 20px rgba(252,209,22,0.45)' : '0 10px 24px rgba(0,102,245,0.15)'

  // Colores del botón inactivo según el tema
  const inactiveColor = themeIsColombia ? 'rgba(255,255,255,0.8)' : 'rgba(18,48,68,0.68)'
  const inactiveHoverBg = themeIsColombia ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'

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
          background: themeIsColombia
            ? (scrolled ? 'rgba(0,10,30,0.92)' : 'rgba(0,10,30,0.82)')
            : (scrolled ? 'rgba(244,246,249,0.95)' : 'rgba(255,255,255,0.9)'),
          boxShadow: themeIsColombia
            ? (scrolled ? '0 18px 46px rgba(0,0,0,0.5)' : '0 10px 28px rgba(0,0,0,0.3)')
            : (scrolled ? '0 18px 46px rgba(18,48,68,0.12)' : '0 10px 28px rgba(18,48,68,0.06)'),
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 100,
          borderBottom: themeIsColombia
            ? '1px solid rgba(252,209,22,0.3)'
            : '1px solid rgba(45,120,163,0.12)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <motion.div
          className="header-bar"
          variants={headerBarVariants}
          initial="hidden"
          animate="visible"
          style={{
  width: '100%',
  maxWidth: '80rem',

  minHeight: '3.85rem',

  margin: '0 auto',

  padding: '0.55rem clamp(0.75rem, 2vw, 1rem)',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  gap: 'clamp(0.35rem, 1.5vw, 1rem)',

  borderRadius: '1.25rem',

  background: themeIsColombia
    ? 'rgba(0,20,60,0.92)'
    : 'rgba(255,255,255,0.76)',

  border: themeIsColombia
    ? '1px solid rgba(252,209,22,0.25)'
    : '1px solid rgba(255,255,255,0.9)',

  boxShadow: themeIsColombia
    ? '0 16px 42px rgba(0,0,0,0.5)'
    : '0 16px 42px rgba(18,48,68,0.1)',
}}
        >
          {/* Brand / Logo */}
          <motion.button
            onClick={() => onNavigate('partidos')}
            className="header-brand"
            whileHover={{ scale: 1.02, backgroundColor: themeIsColombia ? 'rgba(252,209,22,0.1)' : 'rgba(136,218,136,0.16)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...navButtonBase,
              position: 'relative',
              minWidth: 0,
              flex: '0 0 9.45rem',
              maxWidth: '9.45rem',
              boxSizing: 'border-box',
              overflow: 'hidden',
              padding: '0.42rem 2.32rem 0.42rem 0.72rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color: themeIsColombia ? '#fff' : colors.ink,
              background: 'transparent',
            }}
            aria-label="Ir a partidos"
          >
            <span
              className="header-brand-copy"
              style={{
                minWidth: 0,
                width: '100%',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                textAlign: 'left',
                lineHeight: 1,
                overflow: 'hidden',
              }}
            >
              <span
                className="header-brand-title"
                style={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: '100%',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 0.96,
                  textAlign: 'left',
                }}
              >
                <span className="header-brand-line">Polla</span>
                <span className="header-brand-line">Mundialista</span>
              </span>
            </span>

            <span
              className="header-brand-ball"
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '0.52rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.68rem',
                height: '1.68rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                fontSize: '1.18rem',
                lineHeight: 1,
                background: themeIsColombia ? 'rgba(252,209,22,0.16)' : 'rgba(0,102,245,0.08)',
                boxShadow: themeIsColombia
                  ? 'inset 0 0 0 1px rgba(252,209,22,0.22)'
                  : 'inset 0 0 0 1px rgba(0,102,245,0.10)',
              }}
            >
              ⚽
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <div
            className="desktop-nav"
            style={{
              display: 'none',
              flex: '1 1 auto',
              minWidth: 0,
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.32rem',
              borderRadius: '999px',
              background: themeIsColombia ? 'rgba(0,20,60,0.7)' : 'var(--slate-100, #f1f5f9)',
              border: themeIsColombia ? '1px solid rgba(252,209,22,0.25)' : '1px solid var(--slate-200, #e2e8f0)',
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
                    background: active ? activeBg : 'transparent',
                    color: active ? activeColor : inactiveColor,
                    borderColor: active ? activeBorderColor : 'transparent',
                    boxShadow: active ? activeBoxShadow : 'none',
                  }}
                  whileHover={{
                    y: -2,
                    backgroundColor: active ? activeBg : inactiveHoverBg,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    ...navButtonBase,
                    minWidth: 0,
                    minHeight: '2.45rem',
                    padding: '0.55rem 0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {icons[item.key]}
                  {item.label}
                </motion.button>
              )
            })}
          </div>

          <div
            className="header-actions"
            style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0, flex: '0 0 auto' }}
          >
            {themeSwitcher}

            {/* User Section */}
            <motion.div
              className="user-section"
              variants={userSectionVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}
            >
              <Pill className="user-pill" small style={{ paddingLeft: '0.4rem', background: themeIsColombia ? 'rgba(0,20,60,0.88)' : 'var(--color-tarjeta, #fff)', border: themeIsColombia ? '1px solid rgba(252,209,22,0.28)' : '1px solid rgba(45,120,163,0.13)', boxShadow: themeIsColombia ? '0 10px 24px rgba(0,0,0,0.3)' : '0 10px 24px rgba(18,48,68,0.07)' }}>
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
                  fontSize: '1.18rem',
                }}
              >
                {userInitial}
              </span>
              <span style={{ minWidth: 0, maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem', fontWeight: 900, color: themeIsColombia ? '#fff' : colors.ink }}>
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
                background: themeIsColombia ? 'rgba(255,255,255,0.1)' : 'rgba(249,97,69,0.1)',
                borderColor: themeIsColombia ? 'rgba(255,255,255,0.15)' : 'rgba(249,97,69,0.18)',
                color: themeIsColombia ? '#fff' : colors.coral,
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H8m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              </motion.button>
            </motion.div>
          </div>
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
            background: themeIsColombia ? 'rgba(0,20,60,0.97)' : 'rgba(255,255,255,0.82)',
            border: themeIsColombia ? '1px solid rgba(252,209,22,0.2)' : '1px solid rgba(255,255,255,0.9)',
            borderBottom: 0,
            boxShadow: themeIsColombia ? '0 -4px 24px rgba(0,0,0,0.3)' : '0 -4px 24px rgba(18,48,68,0.06)',
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
                  color: active ? (themeIsColombia ? colors.colombiaYellowText : '#fff') : (themeIsColombia ? 'rgba(255,255,255,0.65)' : 'rgba(18,48,68,0.58)'),
                  background: active ? (themeIsColombia ? colors.colombiaYellow : colors.blue) : 'transparent',
                  boxShadow: active ? (themeIsColombia ? '0 12px 24px rgba(252,209,22,0.35)' : '0 12px 24px rgba(0,102,245,0.25)') : 'none',
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
          .header-bar, .header-actions, .user-section { min-width: 0; }

          .header-brand {
            min-width: 0 !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .header-brand-copy {
            min-width: 0 !important;
            overflow: hidden !important;
          }

          .header-brand-title {
            min-width: 0 !important;
            overflow: hidden !important;
            font-family: inherit !important;
          }

          .header-brand-line {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: clip !important;
            white-space: nowrap !important;
          }

          .header-brand-ball {
            flex-shrink: 0 !important;
            pointer-events: none !important;
          }

          .desktop-nav {
            min-width: 0 !important;
            overflow: hidden;
          }

          .desktop-nav button {
            min-width: 0 !important;
            white-space: nowrap !important;
          }

          .header-actions {
            flex-shrink: 0;
          }

          .theme-switcher {
            flex-shrink: 0;
          }

          .theme-switcher button {
            white-space: nowrap;
          }

          @media (min-width: 1024px) {
            .desktop-nav { display: flex !important; }
            .mobile-nav { display: none !important; }
          }

          @media (max-width: 1320px) {
            .header-brand {
              flex-basis: 9.05rem !important;
              max-width: 9.05rem !important;
              padding: 0.42rem 2.12rem 0.42rem 0.64rem !important;
            }

            .header-brand-title {
              font-size: 0.86rem !important;
              letter-spacing: -0.01em !important;
            }

            .header-brand-ball {
              right: 0.5rem !important;
              width: 1.48rem !important;
              height: 1.48rem !important;
              font-size: 1.04rem !important;
            }

            .theme-switcher-label {
              display: none !important;
            }

            .theme-switcher {
              padding: 0.22rem !important;
            }

            .theme-switcher button {
              min-width: 2.05rem !important;
              padding: 0.38rem !important;
              justify-content: center !important;
            }

            .desktop-nav button {
              padding: 0.52rem 0.58rem !important;
              font-size: 0.8rem !important;
            }
          }

          @media (max-width: 1200px) {
            .header-brand {
              flex-basis: 8.6rem !important;
              max-width: 8.6rem !important;
              padding: 0.42rem 2rem 0.42rem 0.56rem !important;
            }

            .header-brand-title {
              font-size: 0.96rem !important;
              letter-spacing: -0.015em !important;
            }

            .desktop-nav button {
              padding: 0.48rem 0.48rem !important;
              font-size: 0.88rem !important;
              gap: 0.32rem !important;
            }
          }

          @media (max-width: 1100px) {
            .header-brand {
              flex-basis: 8.2rem !important;
              max-width: 8.2rem !important;
              padding: 0.42rem 1.88rem 0.42rem 0.48rem !important;
            }

            .header-brand-title {
              font-size: 0.78rem !important;
              letter-spacing: -0.02em !important;
            }

            .header-brand-ball {
              right: 0.42rem !important;
              width: 1.36rem !important;
              height: 1.36rem !important;
              font-size: 0.96rem !important;
            }
          }

          @media (min-width: 640px) and (max-width: 1023px) {
            .mobile-nav { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
          }

          @media (max-width: 1023px) {
            .app-header { padding: 0.45rem 0.7rem 0 !important; }

            .header-bar {
              min-height: 3.45rem !important;
              height: auto !important;
              border-radius: 1rem !important;
            }

            .header-brand {
              flex-basis: 8.45rem !important;
              max-width: 8.45rem !important;
              padding: 0.42rem 1.88rem 0.42rem 0.52rem !important;
            }

            .header-brand-title {
              font-size: 0.96rem !important;
              letter-spacing: -0.015em !important;
            }

            .header-actions { gap: 0.35rem !important; }
            .theme-switcher { min-height: 2.35rem !important; }
            .theme-switcher button { min-height: 1.95rem !important; }
          }

          @media (max-width: 820px) {
            .header-brand {
              flex-basis: 7.95rem !important;
              max-width: 7.95rem !important;
              padding: 0.42rem 1.74rem 0.42rem 0.44rem !important;
            }

            .header-brand-title {
              font-size: 0.88rem !important;
              letter-spacing: -0.02em !important;
            }

            .header-brand-ball {
              right: 0.38rem !important;
              width: 1.24rem !important;
              height: 1.24rem !important;
              font-size: 0.88rem !important;
            }

            .user-pill { padding-right: 0.35rem !important; }
            .user-pill > span:last-child { display: none !important; }
          }

          @media (max-width: 620px) {
            .header-brand {
              flex-basis: 7.35rem !important;
              max-width: 7.35rem !important;
              padding: 0.42rem 1.54rem 0.42rem 0.36rem !important;
            }

            .header-brand-title {
              font-size: 0.96rem !important;
              letter-spacing: -0.025em !important;
            }

            .header-brand-ball {
              width: 1.14rem !important;
              height: 1.14rem !important;
              font-size: 0.8rem !important;
            }

            .theme-switcher button {
              min-width: 1.85rem !important;
              padding: 0.32rem !important;
            }
          }

          @media (max-width: 480px) {
            .header-brand {
              flex-basis: 6.8rem !important;
              max-width: 6.8rem !important;
              padding: 0.42rem 1.34rem 0.42rem 0.3rem !important;
            }

            .header-brand-title {
              font-size: 0.64rem !important;
              letter-spacing: -0.03em !important;
            }

            .header-brand-ball {
              right: 0.3rem !important;
              width: 1rem !important;
              height: 1rem !important;
              font-size: 0.7rem !important;
            }
          }

          @media (max-width: 420px) {
            .header-brand {
              flex-basis: 6.05rem !important;
              max-width: 6.05rem !important;
              padding: 0.42rem 0.28rem !important;
            }

            .header-brand-title {
              font-size: 0.58rem !important;
              letter-spacing: -0.035em !important;
            }

            .header-brand-ball {
              display: none !important;
            }
          }
        `}</style>
      </motion.nav>
    </>
  )
}