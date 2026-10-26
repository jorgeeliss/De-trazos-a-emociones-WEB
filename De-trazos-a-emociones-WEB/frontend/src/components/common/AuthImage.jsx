import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

// Carga la imagen protegida de un análisis enviando el token (un <img src> no
// puede mandar cabeceras, por eso se descarga como blob y se usa un objectURL).
const AuthImage = ({ analisisId, alt = 'Dibujo', className, style, onClick }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelado = false;
    let objectUrl;

    const cargar = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/analisis/${analisisId}/imagen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelado) return;
        const blob = await res.blob();
        if (cancelado) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        /* se deja el placeholder */
      }
    };

    if (analisisId) cargar();

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [analisisId]);

  if (!src) {
    return <div className={className} style={style} aria-label={alt} />;
  }
  return <img src={src} alt={alt} className={className} style={style} onClick={onClick} />;
};

export default AuthImage;
