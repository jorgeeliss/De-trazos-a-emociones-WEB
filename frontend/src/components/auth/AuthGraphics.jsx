import React from 'react';
import './AuthGraphics.css';

const AuthGraphics = ({ title, highlight, subtitle }) => {
  return (
    <div className="left-panel">
      <div className="glow-orb purple"></div>
      
      <div className="abstract-eye">
        <div className="eye-line"></div>
        <div className="eye-line"></div>
      </div>
      
      <div className="floating-elements">
        {/* Stars & Shapes */}
        <div className="star star1"></div>
        <div className="star star2"></div>
        <div className="star star3"></div>
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>

        {/* Smiling Face (Yellow) */}
        <div className="face-container face-yellow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <path d="M8 15a4 4 0 0 0 8 0" />
          </svg>
        </div>
        
        {/* Small Smiling Face (Yellow) */}
        <div className="face-container face-yellow-small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 9h.01M16 9h.01M8 14a4 4 0 0 0 8 0" />
          </svg>
        </div>

        {/* Surprised Face (Orange/Purple glow) */}
        <div className="face-container face-orange">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="12" cy="12" r="11" fill="#4c3661" />
            <circle cx="12" cy="12" r="10" fill="#fca5a5" />
            <circle cx="8" cy="10" r="1.5" fill="#1e1b4b" />
            <circle cx="16" cy="10" r="1.5" fill="#1e1b4b" />
            <ellipse cx="12" cy="16" rx="2.5" ry="3.5" fill="#1e1b4b" />
          </svg>
        </div>

        {/* Sad Face (Purple) */}
        <div className="face-container face-sad">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <path d="M8 16a4 4 0 0 1 8 0" />
          </svg>
        </div>
      </div>

      <div className="hero-text">
        <h1 className="hero-title">
          {title.split(highlight)[0]}
          <span className="highlight">{highlight}</span>
          {title.split(highlight)[1]}
        </h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthGraphics;
