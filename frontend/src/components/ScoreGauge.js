import React, { useEffect, useRef, useState } from 'react';

const ScoreGauge = ({ score = 0, animated = true, size = 200 }) => {
  const [display, setDisplay]   = useState(animated ? 0 : score);
  const [progress, setProgress] = useState(animated ? 0 : score / 900);
  const canvasRef = useRef(null);

  const getColor = (s) => s >= 750 ? '#10b981' : s >= 600 ? '#3b82f6' : s >= 450 ? '#f59e0b' : '#ef4444';
  const getLabel = (s) => s >= 750 ? 'Excellent' : s >= 600 ? 'Good' : s >= 450 ? 'Fair' : 'Building';

  useEffect(() => {
    if (!animated) { setDisplay(score); setProgress(score / 900); return; }
    const startTime = performance.now();
    const duration  = 1800;
    const run = (now) => {
      const t   = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(ease * score));
      setProgress(ease * (score / 900));
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [score, animated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s   = canvas.width;
    const cx  = s / 2, cy = s / 2;
    const R   = s * 0.38;
    const startA = Math.PI * 0.75;
    const totalA = Math.PI * 1.5;
    ctx.clearRect(0, 0, s, s);

    // Background arc segments
    const segs = [
      { end: 0.33, color: 'rgba(239,68,68,0.12)' },
      { end: 0.55, color: 'rgba(245,158,11,0.12)' },
      { end: 0.78, color: 'rgba(59,130,246,0.12)' },
      { end: 1,    color: 'rgba(16,185,129,0.12)' },
    ];
    let prev = 0;
    segs.forEach(seg => {
      ctx.beginPath();
      ctx.arc(cx, cy, R, startA + totalA * prev, startA + totalA * seg.end);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.stroke();
      prev = seg.end;
    });

    // Active arc with glow
    if (progress > 0) {
      const color = getColor(display);
      ctx.beginPath();
      ctx.arc(cx, cy, R, startA, startA + totalA * progress);
      ctx.strokeStyle = color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Dot at tip
      const tipA = startA + totalA * progress;
      const tx = cx + R * Math.cos(tipA);
      const ty = cy + R * Math.sin(tipA);
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Tick marks
    for (let i = 0; i <= 9; i++) {
      const a = startA + (totalA * i) / 9;
      ctx.beginPath();
      ctx.moveTo(cx + (R - 10) * Math.cos(a), cy + (R - 10) * Math.sin(a));
      ctx.lineTo(cx + (R + 2)  * Math.cos(a), cy + (R + 2)  * Math.sin(a));
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [display, progress]);

  const color = getColor(display);
  const label = getLabel(display);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} width={size} height={size} style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: size * 0.1 }}>
          <div className="font-display font-extrabold leading-none" style={{ fontSize: size * 0.22, color, textShadow: `0 0 24px ${color}55` }}>
            {display}
          </div>
          <div className="font-semibold tracking-widest uppercase mt-1" style={{ fontSize: size * 0.06, color }}>
            {label}
          </div>
          <div className="text-slate-600" style={{ fontSize: size * 0.055, marginTop: 2 }}>
            BehaviorScore™
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full px-2 mt-1">
        <span className="text-[10px] text-slate-700">300</span>
        <span className="text-[10px] text-slate-600">out of 900</span>
        <span className="text-[10px] text-slate-700">900</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
