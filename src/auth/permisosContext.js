import { createContext, useContext } from 'react';

export const PermisosContext = createContext({
  usuario: null,
  modulos: [],
  cargando: false,
  puede: () => false,
  refrescar: () => {},
});

// Acceso al usuario de la sesión y a sus módulos habilitados
export const usePermisos = () => useContext(PermisosContext);
