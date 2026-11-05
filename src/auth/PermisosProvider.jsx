import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { getSesionGuardada, guardarSesion, resolverModulos } from './modulos';
import { PermisosContext } from './permisosContext';

const PermisosProvider = ({ children }) => {
  const [sesion, setSesion] = useState(getSesionGuardada);
  const [cargando, setCargando] = useState(false);

  // Consulta el rol y los módulos actuales (un Administrador pudo haberlos cambiado)
  const refrescar = useCallback(
    () =>
      api
        .get('/api/auth/permisos')
        .then((res) => {
          const combinada = guardarSesion(res.data);
          setSesion(combinada);
        })
        .catch(() => {
          // Si falla o el backend aún no se reinició, conserva los módulos por defecto del rol
          setSesion((prev) => (prev ? { ...prev, modulos: resolverModulos(prev) } : prev));
        })
        .finally(() => setCargando(false)),
    []
  );

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const value = useMemo(() => {
    const modulos = resolverModulos(sesion);
    return { usuario: sesion, modulos, cargando, refrescar, puede: (modulo) => modulos.includes(modulo) };
  }, [sesion, cargando, refrescar]);

  return <PermisosContext.Provider value={value}>{children}</PermisosContext.Provider>;
};

export default PermisosProvider;
