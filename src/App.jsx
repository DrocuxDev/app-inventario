import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate, useSearchParams, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  ArrowLeftRight,
  Users,
  Search,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import Login from './components/Login/Login';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import CrudProductos from './components/productos/crudProductos';
import CrudCategorias from './components/categorias/CrudCategorias';
import CrudProveedores from './components/proveedores/CrudProveedores';
import KardexMovimientos from './components/kardex/KardexMovimientos';
import CrudUsuarios from './components/usuarios/CrudUsuarios';
import senatiLogo from './assets/senati-logo.png';

const NAV_GENERAL = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];
const NAV_INVENTARIO = [
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/categorias', label: 'Categorías', icon: Layers },
  { to: '/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/kardex', label: 'Kardex / Movimientos', icon: ArrowLeftRight },
];
const NAV_ADMIN = [{ to: '/usuarios', label: 'Usuarios', icon: Users }];

const getUsuario = () => {
  try { return JSON.parse(localStorage.getItem('usuario')) || null; } catch { return null; }
};

const iniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';

// Solo permite la ruta a los roles indicados; el resto vuelve al Dashboard
const RoleRoute = ({ roles, children }) =>
  roles.includes(getUsuario()?.rol) ? children : <Navigate to="/dashboard" replace />;

const NavGroup = ({ items, onNavigate }) =>
  items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} title={label} aria-label={label} onClick={onNavigate} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <Icon size={18} strokeWidth={1.75} />
      <span className="nav-label">{label}</span>
    </NavLink>
  ));

const Topbar = ({ menuOpen, onToggleMenu, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchProducts = (event) => {
    event.preventDefault();
    navigate({ pathname: '/productos', search: query ? `?${new URLSearchParams({ q: query })}` : '' });
  };
  return (
    <header className="topbar">
      <button type="button" className="mobile-menu-toggle icon-btn" onClick={onToggleMenu} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="main-sidebar">
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      <form className="topbar-search" role="search" onSubmit={searchProducts}>
        <Search size={18} aria-hidden="true" />
        <input type="search" aria-label="Buscar productos" placeholder="Buscar productos por nombre o descripción…" value={query} onChange={(event) => setSearchParams(previous => { const next = new URLSearchParams(previous); if (event.target.value) next.set('q', event.target.value); else next.delete('q'); return next; }, { replace: true })} />
        <button type="submit" aria-label="Buscar en productos">Buscar</button>
      </form>
      <div className="d-flex align-items-center gap-3">
        <div className="workspace-label"><span className="workspace-dot" /> Almacén principal</div>
        <button type="button" className="btn-ui btn-secondary-ui btn-sm-ui" onClick={onLogout}>
          <LogOut size={15} strokeWidth={1.75} /> Cerrar sesión
        </button>
      </div>
    </header>
  );
};

// Diseño del panel administrativo (solo se muestra con sesión iniciada)
const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const usuario = getUsuario();
  const esAdmin = usuario?.rol === 'Administrador';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login', { replace: true });
  };

  return (
    <div className={`admin-layout${menuOpen ? ' menu-open' : ''}`}>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
      <aside className="sidebar" id="main-sidebar" onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false); }}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-frame">
            <img src={senatiLogo} alt="SENATI" className="sidebar-logo" />
          </div>
          <span className="sidebar-brand-caption">PANEL DE INVENTARIO</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="sidebar-section">Vista general</span>
          <NavGroup items={NAV_GENERAL} onNavigate={() => setMenuOpen(false)} />
          <span className="sidebar-section">Inventario</span>
          <NavGroup items={NAV_INVENTARIO} onNavigate={() => setMenuOpen(false)} />
          {esAdmin && (
            <>
              <span className="sidebar-section">Administración</span>
              <NavGroup items={NAV_ADMIN} onNavigate={() => setMenuOpen(false)} />
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">{iniciales(usuario?.nombre)}</div>
          <div>
            <div className="footer-name">{usuario?.nombre || 'Usuario'}</div>
            <div className="footer-role">{usuario?.rol || 'Sesión activa'}</div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <Topbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} onLogout={handleLogout} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas / Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos" element={<CrudProductos />} />
            <Route path="/categorias" element={<CrudCategorias />} />
            <Route path="/proveedores" element={<CrudProveedores />} />
            <Route path="/kardex" element={<KardexMovimientos />} />
            <Route path="/usuarios" element={<RoleRoute roles={['Administrador']}><CrudUsuarios /></RoleRoute>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
