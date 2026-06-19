import { useRef, useEffect, useCallback } from 'react';
import { EMOTION_COLORS, EMOTIONS } from '../utils/constants.js';

/**
 * useAudioVisualizer — React hook that renders an organic waveform visualization
 * on a canvas element, driven by Tone.js analyser data.
 *
 * Features:
 *  - Smooth bezier-interpolated curves (not harsh rectangular bars)
 *  - Emotion-adaptive color shifts
 *  - Subtle glow effect proportional to audio amplitude
 *  - Gradient fade-out at edges
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef - Ref to the canvas element
 * @param {object|null} sonicRegulator - SonicRegulator instance
 * @param {string} emotion - Current emotion state
 * @returns {{ isActive: boolean }}
 */
export function useAudioVisualizer(canvasRef, sonicRegulator, emotion) {
  const rafRef = useRef(null);
  const isActiveRef = useRef(false);

  const draw = useCallback(() => {
    rafRef.current = requestAnimationFrame(draw);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Handle DPR for sharp rendering */
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;

    /* Clear */
    ctx.clearRect(0, 0, width, height);

    /* Get waveform data */
    let waveform = null;
    if (sonicRegulator && sonicRegulator.getWaveform) {
      waveform = sonicRegulator.getWaveform();
    }

    /* Get emotion color */
    const emotionColor = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];
    const color = emotionColor.primary;

    if (!waveform || waveform.length === 0) {
      /* Draw a subtle idle line when no audio */
      ctx.beginPath();
      ctx.strokeStyle = `${color}33`;
      ctx.lineWidth = 1;
      const centerY = height / 2;

      for (let i = 0; i < width; i++) {
        const y = centerY + Math.sin((i / width) * Math.PI * 4 + Date.now() * 0.001) * 2;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      return;
    }

    isActiveRef.current = true;

    /* Calculate amplitude for glow intensity */
    let maxAmplitude = 0;
    for (let i = 0; i < waveform.length; i++) {
      maxAmplitude = Math.max(maxAmplitude, Math.abs(waveform[i]));
    }
    const glowIntensity = Math.min(maxAmplitude * 2, 1);

    /* Draw glow layer */
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 * glowIntensity;
    ctx.globalAlpha = 0.3 * glowIntensity;

    drawWaveformCurve(ctx, waveform, width, height, color, 3);

    ctx.restore();

    /* Draw main waveform */
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * glowIntensity;

    drawWaveformCurve(ctx, waveform, width, height, color, 1.5);

    ctx.restore();

    /* Draw a subtle fill beneath the wave */
    ctx.save();
    ctx.globalAlpha = 0.06 * glowIntensity;

    const gradient = ctx.createLinearGradient(0, height / 2, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');

    drawWaveformFill(ctx, waveform, width, height, gradient);

    ctx.restore();
  }, [canvasRef, sonicRegulator, emotion]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return { isActive: isActiveRef.current };
}

/**
 * Draw a smooth bezier curve through waveform sample points.
 */
function drawWaveformCurve(ctx, waveform, width, height, color, lineWidth) {
  const centerY = height / 2;
  const sliceWidth = width / (waveform.length - 1);
  const amplitude = height * 0.35;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for (let i = 0; i < waveform.length; i++) {
    const x = i * sliceWidth;
    const y = centerY + waveform[i] * amplitude;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      /* Use quadratic bezier for smooth curves */
      const prevX = (i - 1) * sliceWidth;
      const prevY = centerY + waveform[i - 1] * amplitude;
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
    }
  }

  const lastX = (waveform.length - 1) * sliceWidth;
  const lastY = centerY + waveform[waveform.length - 1] * amplitude;
  ctx.lineTo(lastX, lastY);

  ctx.stroke();
}

/**
 * Draw a filled area beneath the waveform curve.
 */
function drawWaveformFill(ctx, waveform, width, height, fillStyle) {
  const centerY = height / 2;
  const sliceWidth = width / (waveform.length - 1);
  const amplitude = height * 0.35;

  ctx.beginPath();
  ctx.moveTo(0, centerY);

  for (let i = 0; i < waveform.length; i++) {
    const x = i * sliceWidth;
    const y = centerY + waveform[i] * amplitude;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = (i - 1) * sliceWidth;
      const prevY = centerY + waveform[i - 1] * amplitude;
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
    }
  }

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}
