import React, { useRef } from 'react';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer.js';
import { EMOTION_COLORS, EMOTIONS } from '../utils/constants.js';

/**
 * AudioVisualizer — Organic waveform visualization canvas.
 *
 * Renders smooth bezier-interpolated waveforms with emotion-adaptive
 * color shifts and subtle glow effects.
 */
export default function AudioVisualizer({ sonicRegulator, emotion, isPlaying }) {
  const canvasRef = useRef(null);
  useAudioVisualizer(canvasRef, sonicRegulator, emotion);

  const color = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

  return (
    <div
      className="visualizer-container glass-panel rounded-2xl overflow-hidden transition-all duration-700 ease-human"
      style={{
        boxShadow: isPlaying ? `0 0 30px ${color.glow}` : 'none',
      }}
      id="audio-visualizer"
    >
      <div className="px-4 pt-3 pb-1 flex items-center justify-between relative z-10">
        <span className="system-label" style={{ color: isPlaying ? color.dim : undefined }}>
          WAVEFORM
        </span>
        {isPlaying && (
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full animate-breathe" style={{ backgroundColor: color.primary }} />
            <span className="system-label" style={{ color: color.dim }}>LIVE</span>
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: '100px' }}
      />
    </div>
  );
}
