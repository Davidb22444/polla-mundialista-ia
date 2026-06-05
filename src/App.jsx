import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import OraculoIA from './components/OraculoIA';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/oraculo" element={<OraculoIA />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;