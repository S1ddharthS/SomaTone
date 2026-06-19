import React, { useRef, useEffect } from 'react';

/**
 * CatharsisWaveform — Minimalist vector visualization of the vocal acoustic signal.
 */
export default function CatharsisWaveform({ analyzer }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyzer) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const data = analyzer.getWaveformData();
      if (!data || data.length === 0) return;

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();

      const sliceWidth = width * 1.0 / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyzer]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
      <h3 className="text-[0.65rem] font-mono text-text-muted/60 mb-2 uppercase tracking-widest flex items-center justify-between">
        <span>Vocal Biomarkers</span>
        <span className="w-1.5 h-1.5 rounded-full bg-rose/60 animate-pulse" />
      </h3>
      <div className="w-full h-16 relative">
        <canvas 
          ref={canvasRef}
          width={240}
          height={64}
          className="w-full h-full"
        />
        {/* Aesthetic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-transparent to-obsidian opacity-50 pointer-events-none" />
      </div>
    </div>
  );
}
