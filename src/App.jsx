import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import CrudProductos from './components/productos/crudProductos';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Componente para el Navbar que incluye el botón de Cerrar Sesión
const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark bg-dark shadow-sm">
      <div className="container">
        <span className="navbar-brand mb-0 h1">SENATI - Sistema de Inventario</span>
        {token && (
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        {/* Ruta Pública */}
        <Route path="/" element={<Login />} />

        {/* Ruta Privada / Protegida */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <CrudProductos />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
