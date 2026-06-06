/**
 * OraculoIA — badge that shows the AI-predicted score for a match.
 * Props:
 *   golesLocal    {number}
 *   golesVisitante {number}
 */
export default function OraculoIA({ golesLocal, golesVisitante }) {
  return (
    <div style={{
      position: 'absolute',
      top: '-0.75rem',
      right: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      background: '#0f172a',
      color: '#fff',
      padding: '0.375rem 0.75rem',
      borderRadius: '999px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.12)',
      zIndex: 10,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '0.8rem' }}>🤖</span>
      <span>IA: {golesLocal} – {golesVisitante}</span>
    </div>
  )
}
