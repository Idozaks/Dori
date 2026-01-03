
import React from 'react';

interface AvatarProps {
  seed: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ seed, className = "" }) => {
  const s = seed.toLowerCase();

  const DorisSVG = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full shadow-inner">
      <defs>
        <radialGradient id="gradDoris" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#7dd3fc', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#gradDoris)" />
      
      {/* Hair back */}
      <circle cx="50" cy="40" r="28" fill="#1a0f0a" />
      
      {/* Face */}
      <path d="M50 78c-12 0-22-10-22-22V42c0-12 10-22 22-22s22 10 22 22v14c0 12-10 22-22 22z" fill="#4d2e24" />
      
      {/* Hair front/sides */}
      <circle cx="28" cy="35" r="10" fill="#1a0f0a" />
      <circle cx="72" cy="35" r="10" fill="#1a0f0a" />
      <circle cx="35" cy="22" r="12" fill="#1a0f0a" />
      <circle cx="65" cy="22" r="12" fill="#1a0f0a" />
      <circle cx="50" cy="18" r="12" fill="#1a0f0a" />
      
      {/* Eyes */}
      <g>
        <circle cx="41" cy="45" r="3.5" fill="#fff" />
        <circle cx="41" cy="45" r="2" fill="#000" />
        <circle cx="40.2" cy="44" r="0.8" fill="#fff" />
        
        <circle cx="59" cy="45" r="3.5" fill="#fff" />
        <circle cx="59" cy="45" r="2" fill="#000" />
        <circle cx="58.2" cy="44" r="0.8" fill="#fff" />
      </g>
      
      {/* Smile */}
      <path d="M42 62c2 3 14 3 16 0" stroke="#7c2d12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Shirt */}
      <path d="M25 100c0-10 8-18 25-18s25 8 25 18H25z" fill="#1d4ed8" />
      <path d="M50 82v8l-6 2h12l-6-2z" fill="#1e3a8a" opacity="0.3" />
    </svg>
  );

  const SolomonSVG = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gradSolomon" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#fdf2f8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fce7f3', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#gradSolomon)" />
      
      {/* Head */}
      <path d="M50 80c-11 0-20-9-20-20V42c0-11 9-20 20-20s20 9 20 20v18c0 11-9 20-20 20z" fill="#f1c27d" />
      
      {/* Hair (Short/Grey) */}
      <path d="M30 42c0-11 9-20 20-20s20 9 20 20v-5c0-11-9-15-20-15s-20 4-20 15v5z" fill="#94a3b8" />
      
      {/* Glasses */}
      <g>
        <rect x="33" y="44" width="13" height="9" rx="3" stroke="#1e293b" strokeWidth="2" fill="none" />
        <rect x="54" y="44" width="13" height="9" rx="3" stroke="#1e293b" strokeWidth="2" fill="none" />
        <path d="M46 48.5h8" stroke="#1e293b" strokeWidth="2" fill="none" />
        {/* Lenses reflection */}
        <path d="M35 46l3 2M56 46l3 2" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />
      </g>
      
      {/* Eyes (dots behind glasses) */}
      <circle cx="39.5" cy="48.5" r="1.5" fill="#1e293b" />
      <circle cx="60.5" cy="48.5" r="1.5" fill="#1e293b" />
      
      {/* Mouth */}
      <path d="M45 65q5 2 10 0" stroke="#854d0e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Shirt (Polo/Grey) */}
      <path d="M28 100c0-10 10-16 22-16s22 6 22 16H28z" fill="#334155" />
      <path d="M50 84l-10 4 10 6 10-6-10-4z" fill="#1e293b" />
    </svg>
  );

  const GoldieSVG = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gradGoldie" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ddd6fe', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#gradGoldie)" />
      
      {/* Bob Hair back */}
      <path d="M20 50c0-18 10-30 30-30s30 12 30 30v20H20V50z" fill="#eab308" />
      
      {/* Face */}
      <path d="M50 80c-11 0-20-9-20-20V42c0-11 9-20 20-20s20 9 20 20v18c0 11-9 20-20 20z" fill="#ffdbac" />
      
      {/* Hair front/bob bangs */}
      <path d="M30 42c0-11 9-20 20-20s20 9 20 20H30z" fill="#facc15" />
      <path d="M30 42v15c0 5-5 8-5 8s2-8 2-15" fill="#facc15" />
      <path d="M70 42v15c0 5 5 8 5 8s-2-8-2-15" fill="#facc15" />

      {/* Eyes */}
      <g>
        <circle cx="41" cy="48" r="2.5" fill="#333" />
        <circle cx="42" cy="47" r="0.7" fill="#fff" />
        <circle cx="59" cy="48" r="2.5" fill="#333" />
        <circle cx="60" cy="47" r="0.7" fill="#fff" />
      </g>
      
      {/* Smile & Blush */}
      <circle cx="36" cy="62" r="3" fill="#fca5a5" opacity="0.4" />
      <circle cx="64" cy="62" r="3" fill="#fca5a5" opacity="0.4" />
      <path d="M43 68q7 4 14 0" stroke="#be185d" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Jewelry */}
      <circle cx="28" cy="55" r="2" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />
      <circle cx="72" cy="55" r="2" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />

      {/* Shirt */}
      <path d="M25 100c0-10 10-18 25-18s25 8 25 18H25z" fill="#be185d" />
      <path d="M50 82a10 10 0 0 0-8 4l8 2 8-2a10 10 0 0 0-8-4z" fill="#fff" opacity="0.2" />
    </svg>
  );

  return (
    <div className={`aspect-square overflow-hidden rounded-full border-4 border-white shadow-lg ${className}`}>
      {s.includes('doris') && <DorisSVG />}
      {s.includes('solomon') && <SolomonSVG />}
      {s.includes('goldie') && <GoldieSVG />}
      {!['doris', 'solomon', 'goldie'].some(char => s.includes(char)) && (
        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-4xl">
          {seed.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
