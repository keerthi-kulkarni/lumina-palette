import { useState } from 'react';

function IntroScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => onFinish(), 500);
  };

  return (
    <div className={`intro-screen ${isExiting ? 'exiting' : ''}`} role="dialog" aria-label="Welcome screen">
      {/* Animated gradient background */}
      <div className="intro-bg-gradient" aria-hidden />
      
      {/* Glowing orbs */}
      <div className="orb orb-1" aria-hidden />
      <div className="orb orb-2" aria-hidden />
      <div className="orb orb-3" aria-hidden />
      <div className="orb orb-4" aria-hidden />
      
      {/* Content card */}
      <div className={`intro-card ${isExiting ? 'fade-out' : 'fade-in'}`}>
        <div className="intro-content">
          <div className="intro-logo">✨</div>
          <h1 className="intro-title">Lumina Palette</h1>
          <p className="intro-subtitle">Extract cinematic color systems from any image</p>
          <button className="intro-btn" onClick={handleEnter}>
            Enter Studio
            <span className="btn-glow" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntroScreen;
