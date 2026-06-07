const colors = {
  green: '#00a651',
  coral: '#e11a27',
  blue: '#0066f5',
  ink: '#102a43',
}

export default function OraculoIA({ golesLocal, golesVisitante }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '0.8rem',
        right: '0.8rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.42rem',
        background: 'rgba(255,255,255,0.9)',
        color: colors.blue,
        padding: '0.42rem 0.68rem',
        borderRadius: '999px',
        boxShadow: '0 12px 24px rgba(18,48,68,0.12)',
        border: '1px solid rgba(45,120,163,0.14)',
        zIndex: 3,
        fontSize: '0.74rem',
        fontWeight: 900,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(14px)',
      }}
    >
      <span
        style={{
          width: '1.35rem',
          height: '1.35rem',
          borderRadius: '0.5rem',
          display: 'grid',
          placeItems: 'center',
          background: colors.blue,
          color: '#fff',
        }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v3m0 12v3M4.2 6.2l2.1 2.1m11.4 7.4l2.1 2.1M3 12h3m12 0h3M4.2 17.8l2.1-2.1m11.4-7.4l2.1-2.1" />
        </svg>
      </span>
      <span>IA: {golesLocal} - {golesVisitante}</span>
    </div>
  )
}
