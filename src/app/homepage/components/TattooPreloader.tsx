'use client';

import { useEffect, useState } from 'react';

export default function TattooPreloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const hideTimer = setTimeout(() => setVisible(false), 2900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="preloader-overlay"
      style={{ opacity: fadeOut ? 0 : 1 }}
      aria-hidden="true"
    >
      {/* Grain texture */}
      <div className="preloader-grain" />

      {/* Tattoo machine SVG */}
      <div className="preloader-content">
        <svg
          className="preloader-machine"
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Machine body */}
          <rect x="35" y="20" width="50" height="70" rx="6" fill="#1a1410" stroke="#C8A96E" strokeWidth="1.2" />
          {/* Coil top */}
          <ellipse cx="60" cy="20" rx="18" ry="6" fill="#111" stroke="#C8A96E" strokeWidth="1" />
          {/* Coil lines */}
          <line x1="42" y1="20" x2="42" y2="55" stroke="#C8A96E" strokeWidth="0.8" strokeDasharray="3 2" />
          <line x1="78" y1="20" x2="78" y2="55" stroke="#C8A96E" strokeWidth="0.8" strokeDasharray="3 2" />
          {/* Grip */}
          <rect x="47" y="90" width="26" height="40" rx="4" fill="#0f0d0b" stroke="#C8A96E" strokeWidth="1" />
          {/* Grip texture lines */}
          <line x1="47" y1="100" x2="73" y2="100" stroke="#C8A96E" strokeWidth="0.5" opacity="0.5" />
          <line x1="47" y1="108" x2="73" y2="108" stroke="#C8A96E" strokeWidth="0.5" opacity="0.5" />
          <line x1="47" y1="116" x2="73" y2="116" stroke="#C8A96E" strokeWidth="0.5" opacity="0.5" />
          <line x1="47" y1="124" x2="73" y2="124" stroke="#C8A96E" strokeWidth="0.5" opacity="0.5" />
          {/* Needle tube */}
          <rect x="57" y="130" width="6" height="20" rx="2" fill="#C8A96E" opacity="0.9" />
          {/* Needle tip */}
          <polygon points="57,150 63,150 60,160" fill="#C8A96E" />
          {/* Ink drop */}
          <ellipse className="ink-drop" cx="60" cy="162" rx="3" ry="2" fill="#8B0000" opacity="0.85" />
          {/* Power cord */}
          <path d="M35 55 Q10 70 15 100" stroke="#C8A96E" strokeWidth="1.2" fill="none" strokeDasharray="4 3" opacity="0.6" />
          {/* Screw details */}
          <circle cx="45" cy="30" r="3" fill="#0f0d0b" stroke="#C8A96E" strokeWidth="0.8" />
          <circle cx="75" cy="30" r="3" fill="#0f0d0b" stroke="#C8A96E" strokeWidth="0.8" />
          <line x1="43" y1="30" x2="47" y2="30" stroke="#C8A96E" strokeWidth="0.6" />
          <line x1="73" y1="30" x2="77" y2="30" stroke="#C8A96E" strokeWidth="0.6" />
        </svg>

        {/* Studio name */}
        <p className="preloader-studio">SERBERO INK</p>

        {/* Ink fill bar */}
        <div className="preloader-bar-wrap">
          <div className="preloader-bar" />
        </div>

        {/* Tagline */}
        <p className="preloader-tagline">Cargando el arte…</p>
      </div>
    </div>
  );
}
