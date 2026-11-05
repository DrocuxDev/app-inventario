import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate, useSearchParams, Outlet } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  LogOut,
  Lock,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import Login from './components/Login/Login';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import CrudProductos from './components/productos/crudProductos';
import CrudCategorias from './components/categorias/CrudCategorias';
import CrudProveedores from './components/proveedores/CrudProveedores';
import KardexMovimientos from './components/kardex/KardexMovimientos';
import CrudUsuarios from './components/usuarios/CrudUsuarios';
import { PageHeader, EmptyState } from './components/ui/ui';
import { MODULOS, rutaInicial } from './auth/modulos';
import { usePermisos } from './auth/permisosContext';
import PermisosProvider from './auth/PermisosProvider';
import senatiLogo from './assets/senati-logo.png';

const GRUPOS = [
  { id: 'general', titulo: 'Vista general' },
  { id: 'inventario', titulo: 'Inventario' },
  { id: 'admin', titulo: 'Administración' },
];

const iniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';

// Solo permite la ruta si el rol del usuario tiene habilitado el módulo;
// si no, lo envía a la primera pantalla a la que sí tiene acceso
const ModuloRoute = ({ modulo, children }) => {
  const { puede, modulos, cargando } = usePermisos();
  if (cargando) return null;
  return puede(modulo) ? children : <Navigate to={rutaInicial(modulos)} replace />;
};

// Ruta "/" → primera pantalla habilitada
const Inicio = () => {
  const { modulos, cargando } = usePermisos();
  if (cargando) return null;
  return <Navigate to={rutaInicial(modulos)} replace />;
};

const SinAcceso = () => {
  const { modulos, cargando } = usePermisos();
  if (!cargando && modulos.length > 0) return <Navigate to={rutaInicial(modulos)} replace />;
  return (
    <div>
      <PageHeader title="Sin módulos asignados" subtitle="Tu tipo de usuario todavía no tiene pantallas habilitadas." />
      <div className="ui-card">
        <EmptyState icon={Lock} title="Acceso restringido" subtitle="Pide a un Administrador que habilite módulos para tu rol desde Usuarios → Roles y módulos." />
      </div>
    </div>
  );
};

const NavGroup = ({ items, onNavigate }) =>
  items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} title={label} aria-label={label} onClick={onNavigate} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <Icon size={18} strokeWidth={1.75} />
      <span className="nav-label">{label}</span>
    </NavLink>
  ));

const Topbar = ({ menuOpen, onToggleMenu, onLogout }) => {
  const navigate = useNavigate();
  const { puede } = usePermisos();
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
      {/* El buscador de productos solo aparece si el rol tiene el módulo Productos */}
      {puede('productos') ? (
        <form className="topbar-search" role="search" onSubmit={searchProducts}>
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label="Buscar productos" placeholder="Buscar productos por nombre o descripción…" value={query} onChange={(event) => setSearchParams(previous => { const next = new URLSearchParams(previous); if (event.target.value) next.set('q', event.target.value); else next.delete('q'); return next; }, { replace: true })} />
          <button type="submit" aria-label="Buscar en productos">Buscar</button>
        </form>
      ) : (
        <div className="flex-grow-1" />
      )}
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
  const { usuario, puede } = usePermisos();

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

        {/* Solo se muestran los módulos habilitados para el rol del usuario */}
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {GRUPOS.map((grupo) => {
            const items = MODULOS.filter((m) => m.grupo === grupo.id && puede(m.key));
            if (items.length === 0) return null;
            return (
              <Fragment key={grupo.id}>
                <span className="sidebar-section">{grupo.titulo}</span>
                <NavGroup items={items} onNavigate={() => setMenuOpen(false)} />
              </Fragment>
            );
          })}
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
          <Route element={<PermisosProvider><AdminLayout /></PermisosProvider>}>
            <Route path="/" element={<Inicio />} />
            <Route path="/dashboard" element={<ModuloRoute modulo="dashboard"><Dashboard /></ModuloRoute>} />
            <Route path="/productos" element={<ModuloRoute modulo="productos"><CrudProductos /></ModuloRoute>} />
            <Route path="/categorias" element={<ModuloRoute modulo="categorias"><CrudCategorias /></ModuloRoute>} />
            <Route path="/proveedores" element={<ModuloRoute modulo="proveedores"><CrudProveedores /></ModuloRoute>} />
            <Route path="/kardex" element={<ModuloRoute modulo="kardex"><KardexMovimientos /></ModuloRoute>} />
            <Route path="/usuarios" element={<ModuloRoute modulo="usuarios"><CrudUsuarios /></ModuloRoute>} />
            <Route path="/sin-acceso" element={<SinAcceso />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
