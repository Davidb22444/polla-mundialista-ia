import React from 'react'

export default function Pill({ children, small, variant = 'white', style = {}, ...props }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: small ? '0.2rem 0.55rem' : '0.35rem 0.9rem',
    borderRadius: '999px',
    fontSize: small ? '0.72rem' : '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    boxShadow: '0 6px 18px rgba(2,6,23,0.06)',
    background: '#fff',
    color: 'var(--slate-800)',
    border: '1px solid rgba(2,6,23,0.04)',
    whiteSpace: 'nowrap',
  }

  if (variant === 'ghost') {
    base.background = 'rgba(255,255,255,0.03)'
    base.color = 'var(--slate-50)'
    base.border = '1px solid rgba(255,255,255,0.06)'
    base.boxShadow = 'none'
  }

  if (variant === 'brand') {
    base.background = 'var(--brand-100)'
    base.color = 'var(--brand-700)'
    base.border = '1px solid transparent'
    base.boxShadow = 'none'
  }

  return (
    <span style={{ ...base, ...style }} {...props}>{children}</span>
  )
}
