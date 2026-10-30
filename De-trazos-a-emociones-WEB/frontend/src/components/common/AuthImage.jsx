import { useImagenAnalisis } from '../../hooks/useImagenAnalisis';

// Imagen protegida de un análisis (se carga con el token; ver useImagenAnalisis).
const AuthImage = ({ analisisId, alt = 'Dibujo', className, style, onClick }) => {
  const { url } = useImagenAnalisis(analisisId);

  if (!url) {
    return <div className={className} style={style} aria-label={alt} />;
  }
  return <img src={url} alt={alt} className={className} style={style} onClick={onClick} />;
};

export default AuthImage;
