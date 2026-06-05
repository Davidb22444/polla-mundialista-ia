import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Trophy } from 'lucide-react';

// Datos de ejemplo (después vendrán de un archivo JSON)
const equiposData = [
  { id: 1, nombre: 'Argentina', ataque: 88, defensa: 85, ranking: 1, bandera: '🇦' },
  { id: 2, nombre: 'Francia', ataque: 90, defensa: 82, ranking: 2, bandera: '🇫🇷' },
  { id: 3, nombre: 'Brasil', ataque: 87, defensa: 80, ranking: 3, bandera: '🇧🇷' },
  { id: 4, nombre: 'España', ataque: 85, defensa: 83, ranking: 4, bandera: '🇸' },
  { id: 5, nombre: 'Inglaterra', ataque: 84, defensa: 81, ranking: 5, bandera: '🏴󠁧' },
  { id: 6, nombre: 'Alemania', ataque: 83, defensa: 82, ranking: 6, bandera: '🇩' }
];

export default function OraculoIA() {
  const [equipoLocal, setEquipoLocal] = useState('');
  const [equipoVisitante, setEquipoVisitante] = useState('');
  const [resultado, setResultado] = useState(null);

  const consultarOraculo = () => {
    if (!equipoLocal || !equipoVisitante) return;

    const local = equiposData.find(e => e.nombre === equipoLocal);
    const visitante = equiposData.find(e => e.nombre === equipoVisitante);

    if (!local || !visitante) return;

    // Algoritmo simple de predicción
    const poderLocal = (local.ataque * 0.6 + local.defensa * 0.4) - (visitante.defensa * 0.3);
    const poderVisitante = (visitante.ataque * 0.6 + visitante.defensa * 0.4) - (local.defensa * 0.3);

    const probabilidadLocal = Math.round((poderLocal / (poderLocal + poderVisitante)) * 100);
    const probabilidadVisitante = 100 - probabilidadLocal;

    // Sugerir marcador basado en la diferencia
    const diferencia = Math.abs(probabilidadLocal - probabilidadVisitante);
    let golesLocal, golesVisitante;

    if (diferencia > 30) {
      golesLocal = probabilidadLocal > 50 ? 3 : 0;
      golesVisitante = probabilidadLocal > 50 ? 1 : 2;
    } else if (diferencia > 15) {
      golesLocal = probabilidadLocal > 50 ? 2 : 1;
      golesVisitante = probabilidadLocal > 50 ? 1 : 2;
    } else {
      golesLocal = 1;
      golesVisitante = 1;
    }

    setResultado({
      local,
      visitante,
      probabilidadLocal,
      probabilidadVisitante,
      marcadorSugerido: `${golesLocal}-${golesVisitante}`
    });
  };

  const chartData = resultado ? [
    { name: resultado.local.nombre, valor: resultado.probabilidadLocal, color: '#16213e' },
    { name: resultado.visitante.nombre, valor: resultado.probabilidadVisitante, color: '#e94560' }
  ] : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Brain size={32} color="#FFD700" />
        <h2 style={styles.title}>Oráculo IA</h2>
      </div>

      <div style={styles.selector}>
        <div style={styles.selectGroup}>
          <label style={styles.label}>Equipo Local:</label>
          <select 
            value={equipoLocal} 
            onChange={(e) => setEquipoLocal(e.target.value)}
            style={styles.select}
          >
            <option value="">Selecciona...</option>
            {equiposData.map(eq => (
              <option key={eq.id} value={eq.nombre}>{eq.bandera} {eq.nombre}</option>
            ))}
          </select>
        </div>

        <div style={styles.vs}>VS</div>

        <div style={styles.selectGroup}>
          <label style={styles.label}>Equipo Visitante:</label>
          <select 
            value={equipoVisitante} 
            onChange={(e) => setEquipoVisitante(e.target.value)}
            style={styles.select}
          >
            <option value="">Selecciona...</option>
            {equiposData.map(eq => (
              <option key={eq.id} value={eq.nombre}>{eq.bandera} {eq.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <button 
        onClick={consultarOraculo}
        disabled={!equipoLocal || !equipoVisitante}
        style={{
          ...styles.button,
          opacity: (!equipoLocal || !equipoVisitante) ? 0.5 : 1
        }}
      >
        Consultar Oráculo IA
      </button>

      {resultado && (
        <div style={styles.resultado}>
          <h3 style={styles.resultadoTitle}>Predicción del Oráculo</h3>
          
          <div style={styles.marcador}>
            <div style={styles.equipo}>
              <span style={styles.flag}>{resultado.local.bandera}</span>
              <h4>{resultado.local.nombre}</h4>
            </div>
            <div style={styles.score}>{resultado.marcadorSugerido}</div>
            <div style={styles.equipo}>
              <span style={styles.flag}>{resultado.visitante.bandera}</span>
              <h4>{resultado.visitante.nombre}</h4>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="valor" name="Probabilidad (%)">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.stats}>
            <div style={styles.stat}>
              <Trophy size={20} color="#FFD700" />
              <span>Ranking FIFA: #{resultado.local.ranking} vs #{resultado.visitante.ranking}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    margin: 0
  },
  selector: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  selectGroup: {
    flex: 1
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#333'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white'
  },
  vs: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#666'
  },
  button: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#16213e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '2rem',
    transition: 'background-color 0.3s'
  },
  resultado: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  resultadoTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    color: '#1a1a2e',
    textAlign: 'center'
  },
  marcador: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  equipo: {
    textAlign: 'center',
    flex: 1
  },
  flag: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem'
  },
  score: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#16213e',
    padding: '0 2rem'
  },
  chartContainer: {
    marginBottom: '1.5rem'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#666'
  }
};