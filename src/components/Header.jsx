import { Link } from 'react-router-dom';
import { Trophy, Brain, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Trophy size={28} color="#FFD700" />
        <h1 style={styles.title}>Polla Mundialista IA</h1>
      </div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Inicio</Link>
        <Link to="/oraculo" style={styles.link}>Oráculo IA</Link>
        <Link to="/admin" style={styles.link}>Admin</Link>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '20px'
  },
  link: {
    color: '#e0e0e0',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.3s'
  }
};