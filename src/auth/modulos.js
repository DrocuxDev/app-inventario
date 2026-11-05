import { LayoutDashboard, Package, Layers, Truck, ArrowLeftRight, Users } from 'lucide-react';

// Módulos del sistema (deben coincidir con config/permisos.js del backend)
export const MODULOS = [
  { key: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, grupo: 'general' },
  { key: 'productos', to: '/productos', label: 'Productos', icon: Package, grupo: 'inventario' },
  { key: 'categorias', to: '/categorias', label: 'Categorías', icon: Layers, grupo: 'inventario' },
  { key: 'proveedores', to: '/proveedores', label: 'Proveedores', icon: Truck, grupo: 'inventario' },
  { key: 'kardex', to: '/kardex', label: 'Kardex / Movimientos', icon: ArrowLeftRight, grupo: 'inventario' },
  { key: 'usuarios', to: '/usuarios', label: 'Usuarios', icon: Users, grupo: 'admin' },
];

const TODOS_LOS_MODULOS = MODULOS.map((m) => m.key);

// Respaldo por rol cuando la sesión guardada aún no trae el arreglo "modulos"
export const MODULOS_POR_DEFECTO = {
  Administrador: TODOS_LOS_MODULOS,
  Almacenero: ['dashboard', 'productos', 'categorias', 'proveedores', 'kardex'],
  Supervisor: ['dashboard', 'kardex'],
};

export const resolverModulos = (sesion) => {
  if (!sesion) return [];
  if (sesion.rol === 'Administrador') return TODOS_LOS_MODULOS;
  if (Array.isArray(sesion.modulos)) return sesion.modulos;
  return MODULOS_POR_DEFECTO[sesion.rol] || ['dashboard'];
};

export const getSesionGuardada = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('usuario')) || null;
    if (!raw) return null;
    return { ...raw, modulos: resolverModulos(raw) };
  } catch {
    return null;
  }
};

// Guarda el usuario junto con sus módulos habilitados
export const guardarSesion = ({ usuario, modulos }) => {
  const combinada = { ...usuario, modulos: resolverModulos({ ...usuario, modulos }) };
  localStorage.setItem('usuario', JSON.stringify(combinada));
  return combinada;
};

// Primera pantalla a la que el usuario tiene acceso
export const rutaInicial = (modulos = []) => MODULOS.find((m) => modulos.includes(m.key))?.to || '/sin-acceso';
