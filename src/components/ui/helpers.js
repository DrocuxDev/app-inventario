import { useCallback, useEffect, useRef } from 'react';

export const formatFecha = (value) => new Date(value).toLocaleString('es-PE', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function useAutoDismiss(setMensaje, ms = 4000) {
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback((texto, tipo = 'success') => {
    clearTimeout(timer.current);
    setMensaje({ texto, tipo });
    timer.current = setTimeout(() => setMensaje({ texto: '', tipo: '' }), ms);
  }, [setMensaje, ms]);
}
