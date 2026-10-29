import { useState, useEffect, useCallback } from 'react';

// El formulario del login y el registro aparece cuando el logo de la intro
// termina de formarse (AuthGraphics llama a "terminar"). Para no hacer esperar
// a nadie, también aparece al primer clic o tecla, y de inmediato en pantallas
// pequeñas (sin el panel de la intro) o con "reducir movimiento".
// La intro completa se ve una vez por sesión del navegador: al volver al login
// o pasar al registro en la misma pestaña, la marca aparece directamente.
const CLAVE = 'introAuthVista';

const pantallaSinIntro = () =>
  typeof window === 'undefined' ||
  window.matchMedia?.('(max-width: 900px)').matches ||
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const yaVista = () => {
  try {
    return sessionStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
};

// Devuelve [lista, terminar, introVista]: si el formulario ya se muestra, cómo
// avisar que la intro terminó y si la intro ya se había visto en esta sesión.
export function useIntroAuth() {
  const [introVista] = useState(yaVista);
  const [lista, setLista] = useState(() => introVista || pantallaSinIntro());

  const terminar = useCallback(() => {
    setLista(true);
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch {
      /* almacenamiento no disponible: la intro se volverá a ver */
    }
  }, []);

  useEffect(() => {
    if (lista) return undefined;
    window.addEventListener('pointerdown', terminar);
    window.addEventListener('keydown', terminar);
    return () => {
      window.removeEventListener('pointerdown', terminar);
      window.removeEventListener('keydown', terminar);
    };
  }, [lista, terminar]);

  return [lista, terminar, introVista];
}
