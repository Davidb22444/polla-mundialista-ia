import { useState } from 'react'
import fondoEliminatorias from '../assets/fondo_grupos.jpg'

export default function Eliminatorias() {
  const [activeStage, setActiveStage] = useState('16avos')

  const stages = [
    { key: '16avos', name: '16avos de Final', description: '32 mejores equipos compitiendo por avanzar' },
    { key: 'octavos', name: 'Octavos de Final', description: '16 mejores clasificados' },
    { key: 'cuartos', name: 'Cuartos de Final', description: 'Los 8 gigantes del torneo' },
    { key: 'semifinal', name: 'Semifinales', description: 'La antesala de la gran gloria' },
    { key: 'final', name: 'Gran Final', description: 'El duelo supremo por la copa mundial' }
  ]

  const activeDescription = stages.find(s => s.key === activeStage)?.description

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: `url(${fondoEliminatorias})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(10,5,24,0.82) 0%, rgba(16,8,36,0.78) 50%, rgba(10,5,24,0.85) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '72rem', margin: '0 auto', padding: '6.5rem 1rem 3rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff', textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}>
            Fase <span style={{ color: '#0066f5' }}>Eliminatoria</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.98rem', marginTop: '0.45rem', maxWidth: '36rem', margin: '0.45rem auto 0' }}>
            Los duelos directos a muerte súbita. Cada partido es a todo o nada.
          </p>
        </div>

        {/* Phase Selector Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.06)',
          padding: '0.5rem',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          marginBottom: '2rem'
        }}>
          {stages.map(stage => {
            const active = activeStage === stage.key
            return (
              <button
                key={stage.key}
                onClick={() => setActiveStage(stage.key)}
                style={{
                  background: active ? '#0066f5' : 'transparent',
                  color: '#fff',
                  border: 0,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.95rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  boxShadow: active ? '0 8px 20px rgba(0,102,245,0.3)' : 'none'
                }}
              >
                {stage.name}
              </button>
            )
          })}
        </div>

        {/* Main Display Area */}
        <div style={{
          background: 'rgba(255,255,255,0.96)',
          borderRadius: '2rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.9)',
          minHeight: '20rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }} className="animate-fade-in">
          
          {/* Locked Icon */}
          <div style={{
            width: '5.5rem',
            height: '5.5rem',
            borderRadius: '50%',
            background: 'rgba(0,102,245,0.08)',
            border: '2px solid rgba(0,102,245,0.18)',
            color: '#0066f5',
            display: 'grid',
            placeItems: 'center',
            fontSize: '2.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 24px rgba(0,102,245,0.06)'
          }}>
            🔒
          </div>

          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 800,
            margin: '0 0 0.5rem',
            color: '#0f172a'
          }}>
            Falta por definirse
          </h3>
          
          <p style={{
            color: '#0066f5',
            fontSize: '0.95rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 1rem'
          }}>
            {stages.find(s => s.key === activeStage)?.name}
          </p>

          <p style={{
            color: 'var(--slate-500)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            maxWidth: '28rem',
            margin: '0 0 2rem'
          }}>
            {activeDescription}. Los partidos de esta fase eliminatoria se programarán automáticamente una vez que finalice la Fase de Grupos del torneo.
          </p>

          {/* Dummy Bracket Cards Visualization for Premium Style */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            opacity: 0.5
          }}>
            {[1, 2].map(n => (
              <div key={n} style={{
                background: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '1rem',
                padding: '1rem',
                width: '16rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>
                  <span>Llave {n}</span>
                  <span>Por definir</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Clasificado Grupo A</span>
                  <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>-</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Clasificado Grupo B</span>
                  <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>-</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
