import { useState } from 'react';

export default function PartidoCard({ partido }) {
  const [marcadorLocal, setMarcadorLocal] = useState('');
  const [marcadorVisitante, setMarcadorVisitante] = useState('');

  return (
    <div style={styles.card}>
      <div style={styles.teams}>
        <div style={styles.team}>
          <span style={styles.flag}>{partido.equipoLocal.bandera}</span>
          <h3 style={styles.teamName}>{partido.equipoLocal.nombre}</h3>
        </div>
        
        <div style={styles.vs}>VS</div>
        
        <div style={styles.team}>
          <span style={styles.flag}>{partido.equipoVisitante.bandera}</span>
          <h3 style={styles.teamName}>{partido.equipoVisitante.nombre}</h3>
        </div>
      </div>

      <div style={styles.prediction}>
        <label style={styles.label}>Tu pronóstico:</label>
        <div style={styles.inputs}>
          <input
            type="number"
            min="0"
            value={marcadorLocal}
            onChange={(e) => setMarcadorLocal(e.target.value)}
            placeholder="0"
            style={styles.input}
          />
          <span style={styles.dash}>-</span>
          <input
            type="number"
            min="0"
            value={marcadorVisitante}
            onChange={(e) => setMarcadorVisitante(e.target.value)}
            placeholder="0"
            style={styles.input}
          />
        </div>
        <button 
          onClick={() => console.log(`Pronóstico: ${marcadorLocal}-${marcadorVisitante}`)}
          style={styles.button}
        >
          Guardar Pronóstico
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  teams: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  team: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1
  },
  flag: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem'
  },
  teamName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  vs: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#666',
    margin: '0 1rem'
  },
  prediction: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#333'
  },
  inputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  input: {
    width: '60px',
    padding: '0.5rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  dash: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#666'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#16213e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};