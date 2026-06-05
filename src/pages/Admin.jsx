import { useState } from 'react';
import { Users, Trophy, Calendar, BarChart3 } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('partidos');

  // Datos de ejemplo (después vendrán de una API o archivo JSON)
  const estadisticas = {
    totalUsuarios: 24,
    partidosActivos: 6,
    prediccionesTotales: 142,
    precisionOraculo: '78%'
  };

  const tabs = [
    { id: 'partidos', label: 'Partidos', icon: Calendar },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'resultados', label: 'Resultados', icon: Trophy }
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Panel de Administración</h2>

      {/* Tarjetas de resumen */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Users size={24} color="#16213e" />
          <div>
            <div style={styles.statNumber}>{estadisticas.totalUsuarios}</div>
            <div style={styles.statLabel}>Usuarios</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Calendar size={24} color="#16213e" />
          <div>
            <div style={styles.statNumber}>{estadisticas.partidosActivos}</div>
            <div style={styles.statLabel}>Partidos Activos</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Trophy size={24} color="#16213e" />
          <div>
            <div style={styles.statNumber}>{estadisticas.prediccionesTotales}</div>
            <div style={styles.statLabel}>Predicciones</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <BarChart3 size={24} color="#16213e" />
          <div>
            <div style={styles.statNumber}>{estadisticas.precisionOraculo}</div>
            <div style={styles.statLabel}>Precisión IA</div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div style={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {})
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido según la pestaña activa */}
      <div style={styles.content}>
        {activeTab === 'partidos' && (
          <div>
            <h3 style={styles.sectionTitle}>Gestión de Partidos</h3>
            <p style={styles.placeholder}>Aquí podrás agregar, editar y eliminar partidos de la jornada.</p>
            <button style={styles.addButton}>+ Agregar Nuevo Partido</button>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div>
            <h3 style={styles.sectionTitle}>Lista de Usuarios</h3>
            <p style={styles.placeholder}>Aquí verás todos los usuarios registrados y sus pronósticos.</p>
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div>
            <h3 style={styles.sectionTitle}>Estadísticas Generales</h3>
            <p style={styles.placeholder}>Gráficos y métricas de rendimiento del Oráculo IA.</p>
          </div>
        )}

        {activeTab === 'resultados' && (
          <div>
            <h3 style={styles.sectionTitle}>Resultados Finales</h3>
            <p style={styles.placeholder}>Tabla de posiciones y ganadores de la polla.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '2rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#16213e'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s'
  },
  tabActive: {
    backgroundColor: '#16213e',
    color: 'white'
  },
  content: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minHeight: '300px'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '1rem',
    color: '#1a1a2e'
  },
  placeholder: {
    color: '#888',
    marginBottom: '1.5rem'
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#16213e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};