import './BrandHeader.css';

const BrandHeader = () => (
  <div className="brand-header">
    <div className="brand-header-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    </div>
    <div className="brand-header-text">
      <span className="brand-header-name">De trazos a emociones</span>
      <span className="brand-header-sub">Psicología infantil · IA</span>
    </div>
  </div>
);

export default BrandHeader;
