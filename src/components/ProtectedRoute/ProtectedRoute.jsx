import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Protege rutas: sin token redirige al login.
// Se usa como envoltorio (children) o como ruta de diseño (Outlet).
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Si no hay token, lo mandamos de regreso al login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si hay token, renderizamos el componente hijo o las rutas anidadas
  return children ?? <Outlet />;
};

export default ProtectedRoute;
