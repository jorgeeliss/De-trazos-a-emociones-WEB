import { ImageOff } from 'lucide-react';
import { useImagenAnalisis } from '../../hooks/useImagenAnalisis';
import './AuthImage.css';

// Imagen protegida de un análisis (se carga con el token; ver useImagenAnalisis).
// Si el archivo no está en este servidor (p. ej. el análisis se hizo en otro
// equipo que comparte la misma base de datos), lo dice en vez de quedar vacía.
const AuthImage = ({ analisisId, alt = 'Dibujo', className, style, onClick }) => {
  const { url, error } = useImagenAnalisis(analisisId);

  if (error) {
    return (
      <div
        className={`${className || ''} auth-img-faltante`}
        style={style}
        onClick={onClick}
        role="img"
        aria-label="Imagen no disponible en este servidor"
        title="La imagen de este dibujo no está disponible en este servidor"
      >
        <ImageOff size={20} />
        <span>Imagen no disponible</span>
      </div>
    );
  }
  if (!url) {
    return <div className={className} style={style} aria-label={alt} />;
  }
  return <img src={url} alt={alt} className={className} style={style} onClick={onClick} />;
};

export default AuthImage;
