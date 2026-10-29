import './Logo.css';

// Logo de "De trazos a emociones": una sola línea continua que forma una "e"
// manuscrita (de emociones) y termina en un punto. Se "dibuja" al aparecer.
// Hereda el color (currentColor), así se adapta al fondo donde se use.
const Logo = ({ size = 24 }) => (
  <svg
    className="logo-e"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path className="logo-e-stroke" d="M12 21 H25 C30 21 30 12 23 11 C15 10 9 18 12 26 C14 31 21 33 28 28" />
    <circle className="logo-e-dot" cx="29.6" cy="28.6" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

export default Logo;
