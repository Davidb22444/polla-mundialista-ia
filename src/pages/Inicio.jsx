import PartidoCard from '../components/PartidoCard';

// Datos de ejemplo (después vendrán de un archivo JSON)
const partidos = [
  {
    id: 1,
    equipoLocal: { nombre: 'Argentina', bandera: '🇦🇷' },
    equipoVisitante: { nombre: 'Francia', bandera: '🇫🇷' }
  },
  {
    id: 2,
    equipoLocal: { nombre: 'Brasil', bandera: '🇧🇷' },
    equipoVisitante: { nombre: 'España', bandera: '🇪🇸' }
  },
  {
    id: 3,
    equipoLocal: { nombre: 'Inglaterra', bandera: '🏴󠁧󠁧' },
    equipoVisitante: { nombre: 'Alemania', bandera: '🇩🇪' }
  }
];

export default function Inicio() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>¡Bienvenido a la Polla Mundialista!</h2>
        <p style={styles.heroText}>
          Haz tus pronósticos, consulta al Oráculo IA y compite con tus amigos.
        </p>
      </div>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Partidos de la Jornada</h3>
        <div style={styles.partidosList}>
          {partidos.map((partido) => (
            <PartidoCard key={partido.id} partido={partido} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
    color: 'white',
    marginBottom: '2rem'
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  heroText: {
    fontSize: '1.2rem',
    color: '#a0aec0'
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: '12px'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    color: '#1a1a2e'
  },
  partidosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }
};