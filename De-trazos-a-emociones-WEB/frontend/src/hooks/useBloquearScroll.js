import { useEffect } from 'react';

// Bloquea el scroll del <body> mientras hay un modal abierto, para que no
// queden dos barras de scroll (la de la página detrás y la del modal).
// Guarda el valor previo de overflow y lo restaura al cerrar, de modo que
// los modales anidados (p. ej. "Exportar PDF" dentro del detalle) lo manejen bien.
export function useBloquearScroll(activo) {
  useEffect(() => {
    if (!activo) return undefined;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [activo]);
}
