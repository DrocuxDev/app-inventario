import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  ArrowLeftRight,
  Users,
  Boxes,
  ChevronRight,
} from "lucide-react";
import Dashboard from "./components/dashboard/Dashboard";
import CrudProductos from "./components/productos/crudProductos";
import CrudCategorias from "./components/categorias/CrudCategorias";
import CrudProveedores from "./components/proveedores/CrudProveedores";
import KardexMovimientos from "./components/kardex/KardexMovimientos";
import CrudUsuarios from "./components/usuarios/CrudUsuarios";
import "./App.css";

const NAV_GENERAL = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];
const NAV_INVENTARIO = [
  { to: "/productos", label: "Productos", icon: Package },
  { to: "/categorias", label: "Categorías", icon: Layers },
  { to: "/proveedores", label: "Proveedores", icon: Truck },
  { to: "/kardex", label: "Kardex / Movimientos", icon: ArrowLeftRight },
];
const NAV_ADMIN = [{ to: "/usuarios", label: "Usuarios", icon: Users }];
const ALL_NAV = [...NAV_GENERAL, ...NAV_INVENTARIO, ...NAV_ADMIN];

const NavGroup = ({ items }) =>
  items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
      <Icon size={18} strokeWidth={1.75} />
      {label}
    </NavLink>
  ));

const Topbar = () => {
  const { pathname } = useLocation();
  const actual = ALL_NAV.find((n) => pathname.startsWith(n.to));
  return (
    <header className="topbar">
      <div className="breadcrumb-ui">
        <span>Panel de Control de Almacén e Inventario</span>
        <ChevronRight size={14} strokeWidth={1.75} />
        <strong>{actual ? actual.label : "Inicio"}</strong>
      </div>
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-ui btn-secondary-ui"
          style={{ height: "32px", fontSize: "0.75rem", padding: "0 10px" }}
        >
          Actualizar datos
        </button>
        <div style={{ width: "1px", height: "20px", background: "var(--border)" }}></div>
        <div
          className="d-flex align-items-center gap-2"
          style={{
            padding: "4px 10px 4px 5px",
            borderRadius: "999px",
            background: "#F8FAFC",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "999px",
              background: "#4F46E5",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            DD
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--text-900)" }}>
              DrocuxDev
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-500)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span className="dot dot-green" style={{ width: "5px", height: "5px" }}></span>
              Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">
              <Boxes size={18} strokeWidth={1.75} />
            </div>
            <div>
              <div className="brand-name">Stockflow</div>
              <div className="brand-sub">Panel de Inventario</div>
            </div>
          </div>

          <div className="sidebar-section">General</div>
          <nav className="sidebar-nav" style={{ flex: "none" }}>
            <NavGroup items={NAV_GENERAL} />
          </nav>
          <div className="sidebar-section">Inventario</div>
          <nav className="sidebar-nav" style={{ flex: "none" }}>
            <NavGroup items={NAV_INVENTARIO} />
          </nav>
          <div className="sidebar-section">Administración</div>
          <nav className="sidebar-nav">
            <NavGroup items={NAV_ADMIN} />
          </nav>

          <div className="sidebar-footer">
            <div className="avatar">DX</div>
            <div>
              <div className="footer-name">DrocuxDev</div>
              <div className="footer-role">Administrador</div>
            </div>
          </div>
        </aside>

        <div className="main-content">
          <Topbar />
          <main className="page-body">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/productos" element={<CrudProductos />} />
              <Route path="/categorias" element={<CrudCategorias />} />
              <Route path="/proveedores" element={<CrudProveedores />} />
              <Route path="/kardex" element={<KardexMovimientos />} />
              <Route path="/usuarios" element={<CrudUsuarios />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
