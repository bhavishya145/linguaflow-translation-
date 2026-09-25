import React, { useMemo } from 'react';
import { Globe, Radio, Sparkles, Navigation } from 'lucide-react';
import { Language } from '../types';

interface WorldLanguageMapProps {
  sourceLang: Language;
  targetLang: Language;
  detectedLang?: Language;
}

export const WorldLanguageMap: React.FC<WorldLanguageMapProps> = ({
  sourceLang,
  targetLang,
  detectedLang,
}) => {
  const actualSource = sourceLang.code === 'auto' && detectedLang ? detectedLang : sourceLang;

  // Convert lat/lng to SVG coordinates on a simplified equirectangular projection (width 800, height 400)
  const sourceCoords = useMemo(() => {
    const x = ((actualSource.lng + 180) / 360) * 800;
    const y = ((90 - actualSource.lat) / 180) * 400;
    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(380, y)) };
  }, [actualSource]);

  const targetCoords = useMemo(() => {
    const x = ((targetLang.lng + 180) / 360) * 800;
    const y = ((90 - targetLang.lat) / 180) * 400;
    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(380, y)) };
  }, [targetLang]);

  // Quadratic bezier curve midpoint
  const arcPath = useMemo(() => {
    const dx = targetCoords.x - sourceCoords.x;
    const dy = targetCoords.y - sourceCoords.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const midX = (sourceCoords.x + targetCoords.x) / 2;
    const midY = (sourceCoords.y + targetCoords.y) / 2 - Math.min(100, Math.max(30, dist * 0.25));

    return `M ${sourceCoords.x} ${sourceCoords.y} Q ${midX} ${midY} ${targetCoords.x} ${targetCoords.y}`;
  }, [sourceCoords, targetCoords]);

  // Approximate geodesic distance in km
  const approximateDistanceKm = useMemo(() => {
    const R = 6371; // Earth radius in km
    const dLat = ((targetLang.lat - actualSource.lat) * Math.PI) / 180;
    const dLon = ((targetLang.lng - actualSource.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((actualSource.lat * Math.PI) / 180) *
        Math.cos((targetLang.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [actualSource, targetLang]);

  return (
    <div className="mt-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 sm:p-6 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-sky-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>World Linguistic Bridge</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Geodesic Vector Map
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cross-continental communication bridge between linguistic regions
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-cyan-300">Communication Bridge Created</span>
        </div>
      </div>

      {/* Interactive Map Visualizer Canvas Container */}
      <div className="mt-4 relative rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden aspect-[2/1] max-h-[360px] flex items-center justify-center">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Global Continent Simplified Polygons & Connection Arc */}
        <svg viewBox="0 0 800 400" className="w-full h-full">
          <defs>
            <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Continents outline silhouettes (Stylized vectors) */}
          <g fill="#1e293b" opacity="0.45" stroke="#334155" strokeWidth="0.8">
            {/* North America */}
            <path d="M 120 70 L 260 70 L 240 180 L 190 220 L 140 160 Z" />
            {/* South America */}
            <path d="M 230 230 L 310 240 L 270 360 L 220 310 Z" />
            {/* Europe */}
            <path d="M 380 70 L 480 80 L 470 150 L 390 140 Z" />
            {/* Africa */}
            <path d="M 390 160 L 490 170 L 470 300 L 430 320 L 380 230 Z" />
            {/* Asia */}
            <path d="M 480 70 L 720 90 L 690 220 L 520 220 L 480 150 Z" />
            {/* Australia */}
            <path d="M 640 270 L 730 270 L 710 350 L 640 340 Z" />
          </g>

          {/* Connection Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="url(#bridgeGradient)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="animate-pulse"
            filter="url(#glow)"
          />

          {/* Source Point */}
          <g transform={`translate(${sourceCoords.x}, ${sourceCoords.y})`}>
            <circle r="12" fill="#22d3ee" opacity="0.2" className="animate-ping" />
            <circle r="6" fill="#22d3ee" />
            <circle r="2" fill="#ffffff" />
            <text y="-14" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              {actualSource.flag} {actualSource.name}
            </text>
          </g>

          {/* Target Point */}
          <g transform={`translate(${targetCoords.x}, ${targetCoords.y})`}>
            <circle r="12" fill="#e879f9" opacity="0.2" className="animate-ping" style={{ animationDelay: '0.8s' }} />
            <circle r="6" fill="#e879f9" />
            <circle r="2" fill="#ffffff" />
            <text y="-14" textAnchor="middle" fill="#f472b6" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              {targetLang.flag} {targetLang.name}
            </text>
          </g>
        </svg>

        {/* Overlay Bridge Details */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300">
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {actualSource.name} ({actualSource.region}) ↔ {targetLang.name} ({targetLang.region})
            </span>
          </div>

          <div className="font-mono text-cyan-300 font-semibold">
            {approximateDistanceKm > 0 ? `~${approximateDistanceKm.toLocaleString()} km traverse` : 'Local Regional Alignment'}
          </div>
        </div>
      </div>
    </div>
  );
};
