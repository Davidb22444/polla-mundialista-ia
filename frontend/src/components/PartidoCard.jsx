import { useState } from 'react'
import TeamFlag from './TeamFlag.jsx'
import data from '../data/partidos.json'
import { calcularMarcador, calculateMatchPoints } from '../App.jsx'
import OraculoIA from './OraculoIA.jsx'

const equipos = data.equipos

const colors = {
  green: '#00a651',
  coral: '#e11a27',
  blue: '#0066f5',
  ink: '#102a43',
}

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

export default function PartidoCard({ match, userBet, onBet, onClear }) {
  const [localVal, setLocalVal] = useState('')
  const [visitorVal, setVisitorVal] = useState('')
  const [betAmount, setBetAmount] = useState('')

  const localTeam = equipos[match.local] || { nombre: match.local, bandera: '' }
  const visitorTeam = equipos[match.visitante] || { nombre: match.visitante, bandera: '' }
  const prediction = calcularMarcador(match.local, match.visitante)
  const hasResult = match.resLocal !== null && match.resVisitor !== null
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

  const buttonBase = {
    border: '1px solid transparent',
    borderRadius: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
  }

  const inputStyle = {
    width: '4.25rem',
    height: '3.65rem',
    textAlign: 'center',
    fontSize: '1.55rem',
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
    <div
      className="partido-card animate-fade-in-up"
      style={{
        borderRadius: 'var(--card-radius)',
        padding: '1rem',
        minHeight: '100%',
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

      <OraculoIA golesLocal={prediction.golesLocal} golesVisitante={prediction.golesVisitante} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardHeader match={match} hasResult={hasResult} />

        <div
          className="match-stage"
          style={{
            marginTop: '1rem',
            padding: '1.3rem 1rem',
            borderRadius: 'var(--card-radius)',
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid rgba(45,120,163,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.24)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', alignItems: 'center', gap: '0.75rem' }}>
            <TeamBlock team={localTeam} align="left" />
            <div
              style={{
                width: '3.25rem',
                height: '3.25rem',
                borderRadius: '1rem',
                display: 'grid',
                placeItems: 'center',
                background: colors.ink,
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 900,
                boxShadow: '0 14px 26px rgba(45,120,163,0.22)',
              }}
            >
              VS
            </div>
            <TeamBlock team={visitorTeam} align="right" />
          </div>
        </div>

        {hasResult ? (
          <FinishedSection pointsEarned={pointsEarned} userBet={userBet} match={match} />
        ) : userBet ? (
          <ConfirmedSection userBet={userBet} matchId={match.id} onClear={onClear} buttonBase={buttonBase} />
        ) : (
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
            buttonBase={buttonBase}
            previewReturns={previewReturns}
            onSubmit={handleBet}
          />
        )}
      </div>

      <style>{`
        .partido-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .partido-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 28px 64px rgba(18,48,68,0.16) !important;
        }

        @media (max-width: 420px) {
          .partido-card {
            padding: 0.8rem !important;
            border-radius: 1.05rem !important;
          }

          .match-stage {
            padding-left: 0.55rem !important;
            padding-right: 0.55rem !important;
          }

          .team-flag {
            width: 3.15rem !important;
            height: 3.15rem !important;
            font-size: 2rem !important;
          }

          .bet-score-row {
            gap: 0.6rem !important;
          }
        }

        .bet-info-tooltip {
          opacity: 0;
          visibility: hidden;
          transform: translateY(6px);
          transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
        }

        .bet-info-wrap:hover .bet-info-tooltip,
        .bet-info-wrap:focus-within .bet-info-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

function CardHeader({ match, hasResult }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', padding: '0.15rem 0.15rem 0' }}>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.38rem 0.65rem',
            borderRadius: '999px',
            background: 'rgba(45,120,163,0.1)',
            border: '1px solid rgba(45,120,163,0.14)',
            color: colors.blue,
            fontSize: '0.72rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ width: '0.46rem', height: '0.46rem', borderRadius: '50%', background: colors.green }} />
          {match.grupo}
        </span>
        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.42rem', color: 'rgba(18,48,68,0.58)', fontSize: '0.78rem', fontWeight: 800 }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{match.fecha}</span>
        </div>
      </div>

      <span
        style={{
          flex: '0 0 auto',
          padding: '0.38rem 0.62rem',
          borderRadius: '999px',
          background: hasResult ? colors.green : 'rgba(225, 26, 39, 0.08)',
          color: hasResult ? '#fff' : colors.coral,
          border: hasResult ? '1px solid transparent' : '1px solid rgba(225, 26, 39, 0.16)',
          fontSize: '0.68rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {hasResult ? 'Finalizado' : 'Abierto'}
      </span>
    </div>
  )
}

function TeamBlock({ team, align }) {
  const isRight = align === 'right'

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', gap: '0.7rem' }}>
      <div
        className="team-flag animate-float"
        style={{
          width: '4.1rem',
          height: '4.1rem',
          borderRadius: 'var(--card-radius)',
          display: 'grid',
          placeItems: 'center',
          background: '#fff',
          border: '1px solid rgba(45,120,163,0.12)',
          boxShadow: '0 14px 30px rgba(18,48,68,0.1)',
          animationDelay: isRight ? '1s' : '0s',
        }}
      >
        <TeamFlag code={team.code} name={team.nombre} style={{ width: '100%', height: '100%', borderRadius: '0.8rem' }} />
      </div>
      <div style={{ minWidth: 0, maxWidth: '100%', textAlign: isRight ? 'right' : 'left' }}>
        <p style={{ margin: 0, color: colors.ink, fontSize: '0.98rem', fontWeight: 900, lineHeight: 1.18, overflowWrap: 'anywhere' }}>
          {team.nombre}
        </p>
      </div>
    </div>
  )
}

function BetForm({ localTeam, visitorTeam, localVal, visitorVal, betAmount, setLocalVal, setVisitorVal, setBetAmount, inputStyle, buttonBase, previewReturns, onSubmit }) {
  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(45,120,163,0.12)' }}>
      <p style={{ margin: '0 0 0.85rem', color: 'rgba(18,48,68,0.62)', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Tu pronostico
      </p>
      <div className="bet-score-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <ScoreInput team={localTeam} value={localVal} onChange={setLocalVal} inputStyle={inputStyle} />
        <span style={{ color: colors.coral, fontSize: '1.6rem', fontWeight: 900, paddingBottom: '0.72rem' }}>-</span>
        <ScoreInput team={visitorTeam} value={visitorVal} onChange={setVisitorVal} inputStyle={inputStyle} />
      </div>

      <div
        style={{
          marginBottom: '0.9rem',
          padding: '1rem',
          borderRadius: '1.5rem',
          background: 'rgba(245,249,252,0.95)',
          border: '1px solid rgba(45,120,163,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.7rem' }}>
          <label htmlFor={`amount-${localTeam.nombre}-${visitorTeam.nombre}`} style={{ color: colors.ink, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Monto
          </label>
          <HoverInfo returns={previewReturns} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`amount-${localTeam.nombre}-${visitorTeam.nombre}`}
            type="number"
            min="1"
            step="1000"
            value={betAmount}
            onChange={e => setBetAmount(e.target.value)}
            placeholder="Ej: 10000"
            style={{
              width: '100%',
              minWidth: 0,
              height: '3rem',
              padding: '0 0.95rem',
              background: '#fff',
              border: '1.5px solid rgba(45,120,163,0.18)',
              borderRadius: '0.9rem',
              outline: 'none',
              color: colors.ink,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 900,
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
            <p style={{ margin: 0, color: 'rgba(18,48,68,0.48)', fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Max gana
            </p>
            <p style={{ margin: '0.1rem 0 0', color: colors.blue, fontSize: '0.95rem', fontWeight: 900 }}>
              {formatMoney(previewReturns.exact)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        style={{
          ...buttonBase,
          width: '100%',
          minHeight: '3.25rem',
          padding: '0.9rem 1rem',
          background: colors.green,
          color: '#fff',
          fontWeight: 900,
          fontSize: '0.9rem',
          letterSpacing: '0.04em',
          boxShadow: '0 16px 30px rgba(0,166,81,0.22)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 20px 36px rgba(0,166,81,0.24)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 16px 30px rgba(0,166,81,0.22)'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1)' }}
      >
        Guardar pronostico
      </button>
    </div>
  )
}

function HoverInfo({ returns }) {
  return (
    <div className="bet-info-wrap" style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        aria-label="Ver descripcion de ganancias"
        style={{
          width: '1.85rem',
          height: '1.85rem',
          borderRadius: '0.65rem',
          border: '1px solid rgba(45,120,163,0.16)',
          background: '#fff',
          color: colors.blue,
          display: 'grid',
          placeItems: 'center',
          cursor: 'help',
          fontFamily: 'inherit',
          fontWeight: 900,
          boxShadow: '0 8px 18px rgba(18,48,68,0.08)',
        }}
      >
        ?
      </button>
      <div
        className="bet-info-tooltip"
        style={{
          position: 'absolute',
          right: 0,
          top: '2.25rem',
          width: '16rem',
          zIndex: 8,
          padding: '0.85rem',
          borderRadius: '1rem',
          background: 'rgba(18,48,68,0.96)',
          color: '#fff',
          boxShadow: '0 18px 36px rgba(18,48,68,0.22)',
          border: '1px solid rgba(255,255,255,0.12)',
          pointerEvents: 'none',
        }}
      >
        <p style={{ margin: '0 0 0.55rem', fontSize: '0.78rem', fontWeight: 900 }}>Ganancia estimada</p>
        <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.78)', fontSize: '0.72rem', lineHeight: 1.45 }}>
          Marcador exacto: ganas {formatMoney(returns.exact)}.
        </p>
        <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.78)', fontSize: '0.72rem', lineHeight: 1.45 }}>
          Resultado parcial: ganas {formatMoney(returns.partial)}.
        </p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.58)', fontSize: '0.7rem', lineHeight: 1.45 }}>
          Si fallas el resultado, no hay ganancia.
        </p>
      </div>
    </div>
  )
}

function ScoreInput({ team, value, onChange, inputStyle }) {
  return (
    <label style={{ minWidth: 0, display: 'grid', justifyItems: 'center', gap: '0.48rem' }}>
      <span style={{ maxWidth: '6rem', color: 'rgba(18,48,68,0.48)', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team.nombre}
      </span>
      <input
        type="number"
        min="0"
        max="9"
        value={value}
        onChange={e => onChange(e.target.value)}
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

function ConfirmedSection({ userBet, matchId, onClear, buttonBase }) {
  const amount = userBet.amount || 0
  const potentialWin = userBet.potentialWin || calculateBetReturns(amount).exact

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(45,120,163,0.12)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem',
          padding: '0.85rem',
          borderRadius: '1rem',
          background: 'rgba(0, 166, 81, 0.08)',
          border: '1px solid rgba(0, 166, 81, 0.16)',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              width: '2rem',
              height: '2rem',
              flex: '0 0 auto',
              borderRadius: '0.75rem',
              background: colors.green,
              display: 'grid',
              placeItems: 'center',
              color: colors.ink,
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, color: colors.ink, fontSize: '0.86rem', fontWeight: 900 }}>Apuesta confirmada</p>
            <p style={{ margin: '0.15rem 0 0', color: 'rgba(18,48,68,0.56)', fontSize: '0.72rem', fontWeight: 800 }}>
              Monto {formatMoney(amount)} | max {formatMoney(potentialWin)}
            </p>
          </div>
        </div>
        <span style={{ flex: '0 0 auto', color: colors.blue, fontSize: '1.18rem', fontWeight: 900 }}>
          {userBet.local} - {userBet.visitor}
        </span>
      </div>

      <button
        onClick={() => onClear(matchId)}
        style={{
          ...buttonBase,
          width: '100%',
          marginTop: '0.75rem',
          minHeight: '2.65rem',
          background: '#fff',
          borderColor: 'rgba(249,97,69,0.16)',
          color: colors.coral,
          fontSize: '0.8rem',
          fontWeight: 900,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(249,97,69,0.1)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Modificar pronostico
      </button>
    </div>
  )
}

function FinishedSection({ pointsEarned, userBet, match }) {
  const amount = userBet?.amount || 0
  const actualReturn = calculateActualReturn(amount, pointsEarned)
  const exact = pointsEarned === 3
  const partial = pointsEarned > 0 && pointsEarned < 3
  const state = exact
    ? { bg: 'rgba(0, 102, 245, 0.08)', border: 'rgba(0, 102, 245, 0.16)', color: colors.blue, label: 'Marcador exacto' }
    : partial
      ? { bg: 'rgba(225, 26, 39, 0.08)', border: 'rgba(225, 26, 39, 0.16)', color: colors.coral, label: `${pointsEarned} punto${pointsEarned > 1 ? 's' : ''}` }
      : { bg: 'rgba(18,48,68,0.05)', border: 'rgba(18,48,68,0.1)', color: 'rgba(18,48,68,0.58)', label: 'Sin puntos' }

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(45,120,163,0.12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ color: 'rgba(18,48,68,0.58)', fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Resultado final
        </span>
        <span style={{ color: colors.ink, fontSize: '1rem', fontWeight: 900 }}>
          {match.resLocal} - {match.resVisitor}
        </span>
      </div>

      {userBet ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            padding: '0.9rem',
            borderRadius: '1rem',
            background: state.bg,
            border: `1px solid ${state.border}`,
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
          <span style={{ flex: '0 0 auto', width: '2.25rem', height: '2.25rem', borderRadius: '0.8rem', display: 'grid', placeItems: 'center', background: '#fff', color: state.color, fontWeight: 900, boxShadow: '0 10px 22px rgba(18,48,68,0.08)' }}>
            {pointsEarned}
          </span>
        </div>
      ) : (
        <div style={{ padding: '0.9rem', borderRadius: '1rem', background: 'rgba(18,48,68,0.04)', border: '1px solid rgba(18,48,68,0.08)', textAlign: 'center', color: 'rgba(18,48,68,0.56)', fontSize: '0.84rem', fontWeight: 800 }}>
          No realizaste apuesta
        </div>
      )}
    </div>
  )
}
