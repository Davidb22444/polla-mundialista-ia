import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamFlag from './TeamFlag.jsx'
import data from '../data/partidos.json'
import { calcularMarcador, calculateMatchPoints } from '../App.jsx'
import OraculoIA from './OraculoIA.jsx'
import PartidoChat from './PartidoChat.jsx'

const equipos = data.equipos

const colors = {
  green: '#00a651',
  coral: '#e11a27',
  blue: '#0066f5',
  ink: '#102a43',
}

// ─── Animation variants ─────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
      delay: i * 0.05,
    },
  }),
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.7, x: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 20, delay: 0.12 },
  },
}

// ─── Helpers ────────────────────────────────────────────────────
function calculateBetReturns(amount) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0
  return {
    exact: Math.round(safeAmount * 3),
    partial: Math.round(safeAmount * 1.5),
    missed: 0,
  }
}

function calculateActualReturn(amount, pointsEarned) {
  const returns = calculateBetReturns(amount)
  if (pointsEarned === 3) return returns.exact
  if (pointsEarned > 0) return returns.partial
  return returns.missed
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`
}

// ─── Main Card ──────────────────────────────────────────────────
export default function PartidoCard({ match, userBet, onBet, onClear, index = 0, currentUser, matchStats }) {
  const [localVal, setLocalVal]   = useState('')
  const [visitorVal, setVisitorVal] = useState('')
  const [betAmount, setBetAmount] = useState('')

  const localTeam   = equipos[match.local]     || { nombre: match.local,    bandera: '' }
  const visitorTeam = equipos[match.visitante]  || { nombre: match.visitante, bandera: '' }
  const prediction  = calcularMarcador(match.local, match.visitante)
  const hasResult   = match.resLocal !== null && match.resVisitor !== null
  const amountValue = parseInt(betAmount, 10)
  const previewReturns = calculateBetReturns(Number.isNaN(amountValue) ? 0 : amountValue)

  let pointsEarned = 0
  if (hasResult && userBet) {
    pointsEarned = calculateMatchPoints(userBet.local, userBet.visitor, match.resLocal, match.resVisitor)
  }

  const handleBet = () => {
    const lv = parseInt(localVal, 10)
    const vv = parseInt(visitorVal, 10)
    const amount = parseInt(betAmount, 10)
    if (Number.isNaN(lv) || Number.isNaN(vv) || Number.isNaN(amount) || lv < 0 || vv < 0 || amount <= 0) return
    const potentialWin = calculateBetReturns(amount).exact
    onBet(match.id, lv, vv, amount, potentialWin)
    setLocalVal('')
    setVisitorVal('')
    setBetAmount('')
  }

  const inputStyle = {
    width: '3.1rem',
    height: '3rem',
    textAlign: 'center',
    fontSize: '1.25rem',
    fontWeight: 900,
    background: '#fff',
    border: '1.5px solid rgba(45,120,163,0.18)',
    borderRadius: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
    fontFamily: 'inherit',
    color: colors.ink,
    boxShadow: '0 10px 24px rgba(18,48,68,0.06)',
  }

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-32px' }}
      whileHover={{
        y: -5,
        scale: 1.01,
        boxShadow: '0 28px 56px rgba(18,48,68,0.16)',
        transition: { type: 'spring', stiffness: 300, damping: 22 },
      }}
      style={{
        borderRadius: 'var(--card-radius)',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(45,120,163,0.08)',
        borderBottom: 0,
        boxShadow: '0 16px 40px rgba(18,48,68,0.08)',
        backdropFilter: 'blur(18px)',
      }}
    >
      {/* Oracle badge */}
      <motion.div variants={badgeVariants} initial="hidden" animate="visible">
        <OraculoIA golesLocal={prediction.golesLocal} golesVisitante={prediction.golesVisitante} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardHeader match={match} hasResult={hasResult} />

        {/* Match stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.07 }}
          className="match-stage"
          style={{
            marginTop: '0.65rem',
            padding: '0.8rem 0.75rem',
            borderRadius: 'var(--card-radius)',
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid rgba(45,120,163,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.24)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', alignItems: 'center', gap: '0.55rem' }}>
            <TeamBlock team={localTeam} align="left" />
            <motion.div
              animate={{ rotate: [0, -3, 3, -1.5, 1.5, 0] }}
              transition={{ duration: 2, delay: 0.7, ease: 'easeInOut' }}
              style={{
                width: '2.9rem',
                height: '2.9rem',
                borderRadius: '1rem',
                display: 'grid',
                placeItems: 'center',
                background: colors.ink,
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 900,
                boxShadow: '0 14px 26px rgba(45,120,163,0.22)',
              }}
            >
              VS
            </motion.div>
            <TeamBlock team={visitorTeam} align="right" />
          </div>
        </motion.div>

        {/* Animated section transitions */}
        <AnimatePresence mode="wait">
          {hasResult ? (
            <motion.div key="finished" variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
              <FinishedSection pointsEarned={pointsEarned} userBet={userBet} match={match} />
            </motion.div>
          ) : userBet ? (
            <motion.div key="confirmed" variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
              <ConfirmedSection userBet={userBet} matchId={match.id} onClear={onClear} />
            </motion.div>
          ) : (
            <motion.div key="form" variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
              <BetForm
                localTeam={localTeam}
                visitorTeam={visitorTeam}
                localVal={localVal}
                visitorVal={visitorVal}
                betAmount={betAmount}
                setLocalVal={setLocalVal}
                setVisitorVal={setVisitorVal}
                setBetAmount={setBetAmount}
                inputStyle={inputStyle}
                previewReturns={previewReturns}
                onSubmit={handleBet}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {matchStats && (matchStats.local + matchStats.draw + matchStats.visitor) > 0 && (() => {
        const total = matchStats.local + matchStats.draw + matchStats.visitor;
        return (
          <div style={{
            margin: '1rem -0.5rem -0.5rem',
            background: '#f8fafc',
            borderTop: '1px solid rgba(18,48,68,0.08)',
            padding: '0.65rem 1rem',
          }}>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.68rem', fontWeight: 900, color: 'rgba(18,48,68,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Comunidad · {total} {total === 1 ? 'apuesta' : 'apuestas'}{matchStats.topScore ? ` · Más popular: ${matchStats.topScore}` : ''}
            </p>
            <div style={{ display: 'flex', borderRadius: '999px', overflow: 'hidden', height: '6px', gap: '1px' }}>
              <div style={{ flex: matchStats.local, background: '#00a651', minWidth: matchStats.local > 0 ? '4px' : 0 }} />
              <div style={{ flex: matchStats.draw, background: '#f59e0b', minWidth: matchStats.draw > 0 ? '4px' : 0 }} />
              <div style={{ flex: matchStats.visitor, background: '#e11a27', minWidth: matchStats.visitor > 0 ? '4px' : 0 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.65rem', fontWeight: 800 }}>
              <span style={{ color: '#00a651' }}>Local {total > 0 ? Math.round(matchStats.local / total * 100) : 0}%</span>
              <span style={{ color: '#d97706' }}>Empate {total > 0 ? Math.round(matchStats.draw / total * 100) : 0}%</span>
              <span style={{ color: '#e11a27' }}>Visita {total > 0 ? Math.round(matchStats.visitor / total * 100) : 0}%</span>
            </div>
          </div>
        )
      })()}
      
      <div style={{
        margin: (matchStats && (matchStats.local + matchStats.draw + matchStats.visitor) > 0) ? '0 -0.5rem -0.5rem' : '1rem -0.5rem -0.5rem',
        background: '#f8fafc',
        borderTop: (matchStats && (matchStats.local + matchStats.draw + matchStats.visitor) > 0) ? 'none' : '1px solid rgba(18,48,68,0.08)',
        padding: '0',
        borderRadius: '0 0 var(--card-radius) var(--card-radius)',
        overflow: 'hidden'
      }}>
        <PartidoChat matchId={match.id} currentUser={currentUser} />
      </div>

      <style>{`
        @media (max-width: 420px) {
          .match-stage { padding-left: 0.55rem !important; padding-right: 0.55rem !important; }
          .team-flag   { width: 3.15rem !important; height: 3.15rem !important; font-size: 2rem !important; }
          .bet-score-row { gap: 0.6rem !important; }
        }
        .bet-info-tooltip {
          opacity: 0; visibility: hidden; transform: translateY(6px);
          transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
        }
        .bet-info-wrap:hover .bet-info-tooltip,
        .bet-info-wrap:focus-within .bet-info-tooltip {
          opacity: 1; visibility: visible; transform: translateY(0);
        }
      `}</style>
    </motion.div>
  )
}

// ─── CardHeader ─────────────────────────────────────────────────
function CardHeader({ match, hasResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.04 }}
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', padding: '0.15rem 0.15rem 0' }}
    >
      <div style={{ minWidth: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.38rem 0.65rem', borderRadius: '999px',
          background: 'rgba(45,120,163,0.1)', border: '1px solid rgba(45,120,163,0.14)',
          color: colors.blue, fontSize: '0.72rem', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {/* Pulse dot */}
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
            style={{ width: '0.46rem', height: '0.46rem', borderRadius: '50%', background: colors.green, display: 'inline-block' }}
          />
          {match.grupo}
        </span>
        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.42rem', color: 'rgba(18,48,68,0.58)', fontSize: '0.78rem', fontWeight: 800 }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{match.fecha}</span>
        </div>
      </div>

      <motion.span
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.1 }}
        style={{
          flex: '0 0 auto', padding: '0.38rem 0.62rem', borderRadius: '999px',
          background: hasResult ? colors.green : 'rgba(225, 26, 39, 0.08)',
          color: hasResult ? '#fff' : colors.coral,
          border: hasResult ? '1px solid transparent' : '1px solid rgba(225, 26, 39, 0.16)',
          fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}
      >
        {hasResult ? 'Finalizado' : 'Abierto'}
      </motion.span>
    </motion.div>
  )
}

// ─── TeamBlock ──────────────────────────────────────────────────
function TeamBlock({ team, align }) {
  const isRight = align === 'right'
  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', gap: '0.7rem' }}>
      <motion.div
        initial={{ opacity: 0, x: isRight ? 16 : -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.1 }}
        whileHover={{ scale: 1.08, rotate: isRight ? 3 : -3 }}
        className="team-flag"
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: 'var(--card-radius)',
          display: 'grid',
          placeItems: 'center',
          background: '#fff',
          border: '1px solid rgba(45,120,163,0.12)',
          boxShadow: '0 14px 30px rgba(18,48,68,0.1)',
          cursor: 'default',
        }}
      >
        <TeamFlag code={team.code} name={team.nombre} style={{ width: '100%', height: '100%', borderRadius: '0.8rem' }} />
      </motion.div>
      <div style={{ minWidth: 0, maxWidth: '100%', textAlign: isRight ? 'right' : 'left' }}>
        <p style={{ margin: 0, color: colors.ink, fontSize: '0.98rem', fontWeight: 900, lineHeight: 1.18, overflowWrap: 'anywhere' }}>
          {team.nombre}
        </p>
      </div>
    </div>
  )
}

// ─── BetForm ────────────────────────────────────────────────────
function BetForm({ localTeam, visitorTeam, localVal, visitorVal, betAmount, setLocalVal, setVisitorVal, setBetAmount, inputStyle, previewReturns, onSubmit }) {
  const buttonBase = {
    border: '1px solid transparent',
    borderRadius: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(45,120,163,0.12)' }}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        style={{ margin: '0 0 0.65rem', color: 'rgba(18,48,68,0.62)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Tu pronostico
      </motion.p>

      <div className="bet-score-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <ScoreInput team={localTeam} value={localVal} onChange={setLocalVal} inputStyle={inputStyle} />
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
          style={{ color: colors.coral, fontSize: '1.6rem', fontWeight: 900, paddingBottom: '0.72rem' }}
        >
          -
        </motion.span>
        <ScoreInput team={visitorTeam} value={visitorVal} onChange={setVisitorVal} inputStyle={inputStyle} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        style={{
          marginBottom: '0.65rem', padding: '0.75rem', borderRadius: '1.2rem',
          background: 'rgba(245,249,252,0.95)', border: '1px solid rgba(45,120,163,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', marginBottom: '0.55rem' }}>
          <label style={{ color: colors.ink, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Monto
          </label>
          <HoverInfo returns={previewReturns} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: '0.65rem' }}>
          <input
            type="number" min="1" step="1000"
            value={betAmount} onChange={e => setBetAmount(e.target.value)}
            placeholder="Ej: 10000"
            style={{
              width: '100%', minWidth: 0, height: '2.5rem', padding: '0 0.75rem',
              background: '#fff', border: '1.5px solid rgba(45,120,163,0.18)',
              borderRadius: '0.85rem', outline: 'none', color: colors.ink,
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 900,
              boxShadow: '0 10px 24px rgba(18,48,68,0.06)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = colors.blue
              e.target.style.boxShadow = '0 0 0 4px rgba(45,120,163,0.12), 0 10px 24px rgba(18,48,68,0.06)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(45,120,163,0.18)'
              e.target.style.boxShadow = '0 10px 24px rgba(18,48,68,0.06)'
            }}
          />
          <div style={{ minWidth: '6.8rem', textAlign: 'right' }}>
            <p style={{ margin: 0, color: 'rgba(18,48,68,0.48)', fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max gana</p>
            <motion.p
              key={previewReturns.exact}
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              style={{ margin: '0.1rem 0 0', color: colors.blue, fontSize: '0.95rem', fontWeight: 900 }}
            >
              {formatMoney(previewReturns.exact)}
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.button
        onClick={onSubmit}
        whileHover={{ scale: 1.02, y: -2, boxShadow: '0 20px 36px rgba(0,166,81,0.28)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        style={{
          ...buttonBase,
          width: '100%', minHeight: '2.6rem', padding: '0.65rem 0.85rem',
          background: colors.green, color: '#fff',
          fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.04em',
          boxShadow: '0 16px 30px rgba(0,166,81,0.22)',
        }}
      >
        Guardar pronostico
      </motion.button>
    </div>
  )
}

// ─── HoverInfo ──────────────────────────────────────────────────
function HoverInfo({ returns }) {
  return (
    <div className="bet-info-wrap" style={{ position: 'relative', display: 'inline-flex' }}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Ver descripcion de ganancias"
        style={{
          width: '1.85rem', height: '1.85rem', borderRadius: '0.65rem',
          border: '1px solid rgba(45,120,163,0.16)', background: '#fff',
          color: colors.blue, display: 'grid', placeItems: 'center',
          cursor: 'help', fontFamily: 'inherit', fontWeight: 900,
          boxShadow: '0 8px 18px rgba(18,48,68,0.08)',
        }}
      >?</motion.button>
      <div
        className="bet-info-tooltip"
        style={{
          position: 'absolute', right: 0, top: '2.25rem', width: '16rem', zIndex: 8,
          padding: '0.85rem', borderRadius: '1rem',
          background: 'rgba(18,48,68,0.96)', color: '#fff',
          boxShadow: '0 18px 36px rgba(18,48,68,0.22)',
          border: '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none',
        }}
      >
        <p style={{ margin: '0 0 0.55rem', fontSize: '0.78rem', fontWeight: 900 }}>Ganancia estimada</p>
        <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.78)', fontSize: '0.72rem', lineHeight: 1.45 }}>Marcador exacto: ganas {formatMoney(returns.exact)}.</p>
        <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.78)', fontSize: '0.72rem', lineHeight: 1.45 }}>Resultado parcial: ganas {formatMoney(returns.partial)}.</p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.58)', fontSize: '0.7rem', lineHeight: 1.45 }}>Si fallas el resultado, no hay ganancia.</p>
      </div>
    </div>
  )
}

// ─── ScoreInput ─────────────────────────────────────────────────
function ScoreInput({ team, value, onChange, inputStyle }) {
  return (
    <label style={{ minWidth: 0, display: 'grid', justifyItems: 'center', gap: '0.48rem' }}>
      <span style={{ maxWidth: '6rem', color: 'rgba(18,48,68,0.48)', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team.nombre}
      </span>
      <input
        type="number" min="0" max="9"
        value={value} onChange={e => onChange(e.target.value)}
        placeholder="0"
        style={inputStyle}
        onFocus={e => {
          e.target.style.borderColor = colors.blue
          e.target.style.boxShadow = '0 0 0 4px rgba(45,120,163,0.12), 0 10px 24px rgba(18,48,68,0.06)'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(45,120,163,0.18)'
          e.target.style.boxShadow = '0 10px 24px rgba(18,48,68,0.06)'
          e.target.style.transform = 'translateY(0)'
        }}
      />
    </label>
  )
}

// ─── ConfirmedSection ───────────────────────────────────────────
function ConfirmedSection({ userBet, matchId, onClear }) {
  const amount = userBet.amount || 0
  const potentialWin = userBet.potentialWin || calculateBetReturns(amount).exact

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(45,120,163,0.12)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem',
          padding: '0.85rem', borderRadius: '1rem',
          background: 'rgba(0, 166, 81, 0.08)', border: '1px solid rgba(0, 166, 81, 0.16)',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.08 }}
            style={{
              width: '2rem', height: '2rem', flex: '0 0 auto',
              borderRadius: '0.75rem', background: colors.green,
              display: 'grid', placeItems: 'center', color: colors.ink,
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </motion.span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, color: colors.ink, fontSize: '0.86rem', fontWeight: 900 }}>Apuesta confirmada</p>
            <p style={{ margin: '0.15rem 0 0', color: 'rgba(18,48,68,0.56)', fontSize: '0.72rem', fontWeight: 800 }}>
              Monto {formatMoney(amount)} | max {formatMoney(potentialWin)}
            </p>
          </div>
        </div>
        <motion.span
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          style={{ flex: '0 0 auto', color: colors.blue, fontSize: '1.18rem', fontWeight: 900 }}
        >
          {userBet.local} - {userBet.visitor}
        </motion.span>
      </motion.div>

      <motion.button
        onClick={() => onClear(matchId)}
        whileHover={{ scale: 1.02, y: -1, background: 'rgba(249,97,69,0.08)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        style={{
          width: '100%', marginTop: '0.75rem', minHeight: '2.65rem',
          background: '#fff', border: '1px solid rgba(249,97,69,0.16)',
          color: colors.coral, fontSize: '0.8rem', fontWeight: 900,
          borderRadius: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Modificar pronostico
      </motion.button>
    </div>
  )
}

// ─── FinishedSection ────────────────────────────────────────────
function FinishedSection({ pointsEarned, userBet, match }) {
  const amount = userBet?.amount || 0
  const actualReturn = calculateActualReturn(amount, pointsEarned)
  const exact   = pointsEarned === 3
  const partial = pointsEarned > 0 && pointsEarned < 3
  const state = exact
    ? { bg: 'rgba(0, 102, 245, 0.08)', border: 'rgba(0, 102, 245, 0.16)', color: colors.blue,  label: 'Marcador exacto', emoji: '🎯' }
    : partial
      ? { bg: 'rgba(225, 26, 39, 0.08)', border: 'rgba(225, 26, 39, 0.16)', color: colors.coral, label: `${pointsEarned} punto${pointsEarned > 1 ? 's' : ''}`, emoji: '✨' }
      : { bg: 'rgba(18,48,68,0.05)',      border: 'rgba(18,48,68,0.1)',       color: 'rgba(18,48,68,0.58)', label: 'Sin puntos', emoji: '—' }

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(45,120,163,0.12)' }}>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}
      >
        <span style={{ color: 'rgba(18,48,68,0.58)', fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Resultado final
        </span>
        <motion.span
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.08 }}
          style={{ color: colors.ink, fontSize: '1rem', fontWeight: 900 }}
        >
          {match.resLocal} - {match.resVisitor}
        </motion.span>
      </motion.div>

      {userBet ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.06 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem',
            padding: '0.9rem', borderRadius: '1rem',
            background: state.bg, border: `1px solid ${state.border}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, color: state.color, fontSize: '0.9rem', fontWeight: 900 }}>{state.label}</p>
            <p style={{ margin: '0.18rem 0 0', color: 'rgba(18,48,68,0.52)', fontSize: '0.74rem', fontWeight: 800 }}>
              Apostaste {userBet.local} - {userBet.visitor}
            </p>
            <p style={{ margin: '0.18rem 0 0', color: 'rgba(18,48,68,0.52)', fontSize: '0.74rem', fontWeight: 800 }}>
              Monto {formatMoney(amount)} | gana {formatMoney(actualReturn)}
            </p>
          </div>
          <motion.span
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.14 }}
            style={{
              flex: '0 0 auto', width: '2.25rem', height: '2.25rem', borderRadius: '0.8rem',
              display: 'grid', placeItems: 'center', background: '#fff',
              color: state.color, fontWeight: 900, boxShadow: '0 10px 22px rgba(18,48,68,0.08)',
              fontSize: exact ? '1.1rem' : '0.95rem',
            }}
          >
            {exact ? state.emoji : pointsEarned}
          </motion.span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: '0.9rem', borderRadius: '1rem', background: 'rgba(18,48,68,0.04)', border: '1px solid rgba(18,48,68,0.08)', textAlign: 'center', color: 'rgba(18,48,68,0.56)', fontSize: '0.84rem', fontWeight: 800 }}
        >
          No realizaste apuesta
        </motion.div>
      )}
    </div>
  )
}