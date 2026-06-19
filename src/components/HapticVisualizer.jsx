import React, { useRef, useEffect } from 'react';
import { EMOTION_COLORS, EMOTIONS } from '../utils/constants.js';

/**
 * HapticVisualizer — Organic fluid wave canvas for deaf/hard-of-hearing users.
 * Translates Tone.js frequency data into undulating visual waves with color mapping.
 */
export default function HapticVisualizer({ sonicRegulator, emotion, isPlaying }) {
  const canvasRef = useRef(null);
  const color = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;
    let lastVibrateTime = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const waveform = isPlaying ? sonicRegulator.getWaveform() : new Float32Array(256).fill(0);
      phase += 0.015;

      // Haptic Vibration Logic (throttled to 100ms)
      const now = Date.now();
      if (isPlaying && navigator.vibrate && now - lastVibrateTime > 100) {
        let sum = 0;
        for (let i = 0; i < waveform.length; i++) sum += Math.abs(waveform[i]);
        const avgAmplitude = sum / waveform.length;
        
        if (avgAmplitude > 0.05) {
          // Vibrate duration based on amplitude (10ms to 80ms)
          const duration = Math.min(80, Math.max(10, Math.floor(avgAmplitude * 300)));
          navigator.vibrate(duration);
          lastVibrateTime = now;
        }
      }

      // Draw 3 layered organic waves
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 0.3;
        const alpha = 0.15 + (layer * 0.1);

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x++) {
          const dataIndex = Math.floor((x / width) * waveform.length);
          const sample = waveform[dataIndex] || 0;

          // Map low freq to warm colors, high to cool
          const freqNormalized = dataIndex / waveform.length;
          const waveHeight = (sample + 1) * 0.5 * height * 0.6;
          const organic = Math.sin(x * 0.02 + phase + layerOffset) * 15;
          const y = height * 0.5 - waveHeight * 0.3 + organic + (layer * 12);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        // Frequency-mapped gradient fill
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(220, 100, 80, ${alpha})`);    // Low freq → warm red
        gradient.addColorStop(0.3, `rgba(200, 180, 60, ${alpha})`);  // Low-mid → amber
        gradient.addColorStop(0.5, `rgba(100, 200, 120, ${alpha})`); // Mid → green
        gradient.addColorStop(0.7, `rgba(80, 160, 220, ${alpha})`);  // High-mid → blue
        gradient.addColorStop(1, `rgba(160, 100, 220, ${alpha})`);   // High → purple
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Glowing center line
      ctx.beginPath();
      ctx.strokeStyle = `${color.primary}60`;
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= width; x++) {
        const dataIndex = Math.floor((x / width) * waveform.length);
        const sample = waveform[dataIndex] || 0;
        const y = height * 0.5 - sample * height * 0.25 + Math.sin(x * 0.03 + phase) * 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [sonicRegulator, emotion, isPlaying, color]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-1000"
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `${color.primary}25`,
        background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, ${color.glow} 100%)`,
      }}
      id="haptic-visualizer"
    >
      <div className="absolute top-3 left-4 z-10">
        <span className="text-[0.6rem] font-mono text-text-muted/50 uppercase tracking-widest">
          Haptic Frequency Map
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={120}
        className="w-full h-28"
      />
      {/* Pulsing border overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
        style={{
          boxShadow: `inset 0 0 30px ${color.glow}`,
          animationDuration: '3s',
        }}
      />
    </div>
  );
}
