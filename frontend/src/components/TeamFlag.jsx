import * as CountryFlags from 'country-flag-icons/react/3x2'

export default function TeamFlag({ code, name, style }) {
  const finalStyle = {
    display: 'inline-block',
    overflow: 'hidden',
    ...style
  }

  // England custom SVG Flag (St George's Cross)
  if (code === 'ENG' || name === 'Inglaterra') {
    return (
      <div style={finalStyle} className="team-flag-svg">
        <svg viewBox="0 0 5 3" style={{ width: '100%', height: '100%', display: 'block' }}>
          <rect width="5" height="3" fill="#fff" />
          <rect x="2" width="1" height="3" fill="#ce1126" />
          <rect y="1" width="5" height="1" fill="#ce1126" />
        </svg>
      </div>
    )
  }

  // Scotland custom SVG Flag (St Andrew's Cross)
  if (name === 'Escocia') {
    return (
      <div style={finalStyle} className="team-flag-svg">
        <svg viewBox="0 0 5 3" style={{ width: '100%', height: '100%', display: 'block' }}>
          <rect width="5" height="3" fill="#0065bf" />
          <path d="M0,0 L5,3 M5,0 L0,3" stroke="#fff" strokeWidth="0.6" />
        </svg>
      </div>
    )
  }

  // Override CG (Congo) to CD (DR Congo) to display the correct flag matching "COD" in the poster
  let flagCode = code
  if (code === 'CG' || name === 'Congo') {
    flagCode = 'CD'
  }

  if (flagCode) {
    const FlagComponent = CountryFlags[flagCode]
    if (FlagComponent) {
      return (
        <div style={finalStyle}>
          <FlagComponent style={{ width: '100%', height: '100%', display: 'block' }} title={name} />
        </div>
      )
    }
  }

  return (
    <div style={{ ...finalStyle, display: 'grid', placeItems: 'center', background: '#e2e8f0', fontSize: '1.2rem' }}>
      🏁
    </div>
  )
}
