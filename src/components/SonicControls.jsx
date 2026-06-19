import React from 'react';
import { Hand, Volume2, VolumeX } from 'lucide-react';
import { EMOTION_COLORS, EMOTIONS } from '../utils/constants.js';

/**
 * SonicControls — Dual-hand sonic modulator panel with independent L/R indicators.
 */
export default function SonicControls({
  isPlaying,
  isTracking,
  leftHand,
  rightHand,
  presetLabel,
  emotion,
  onToggleAudio,
  earconMode,
}) {
  const color = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

  return (
    <div className="glass-panel rounded-2xl p-5" id="sonic-controls">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hand size={14} className="text-text-muted" strokeWidth={1.5} />
          <span className="system-label">SONIC MODULATOR</span>
        </div>
        <button
          onClick={onToggleAudio}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isPlaying
              ? 'bg-sage/20 border border-sage/30 text-sage'
              : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-secondary'
          }`}
          id="audio-toggle-btn"
          title={isPlaying ? 'Stop audio' : 'Start audio'}
        >
          {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>

      {/* Preset Label */}
      <div className="mb-4">
        <p className="system-label mb-1" style={{ color: color.dim }}>ACTIVE PRESET</p>
        <p className="text-heading-sm" style={{ color: color.primary }}>{presetLabel}</p>
      </div>

      {/* Hand Position Grid — Dual Indicators */}
      <div className="mb-4">
        <p className="system-label mb-2">HAND POSITION</p>
        <div
          className="relative w-full aspect-square rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden"
          style={{ maxHeight: '120px' }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/[0.03]" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/[0.03]" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/[0.03]" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/[0.03]" />
          </div>

          {/* Axis Labels */}
          <span className="absolute bottom-0.5 left-1 text-[0.5rem] text-text-muted/25">PAN L</span>
          <span className="absolute bottom-0.5 right-1 text-[0.5rem] text-text-muted/25">PAN R</span>
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[0.5rem] text-text-muted/25">BRIGHT</span>
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[0.5rem] text-text-muted/25">DARK</span>

          {/* LEFT HAND indicator (blue) */}
          {isTracking && leftHand?.position ? (
            <>
              <div
                className="absolute w-8 h-8 rounded-full transition-all duration-150"
                style={{
                  left: `${leftHand.position.x * 100}%`,
                  top: `${leftHand.position.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(100, 160, 255, 0.25) 0%, transparent 70%)',
                }}
              />
              <div
                className="absolute w-3 h-3 rounded-full border-2 transition-all duration-150"
                style={{
                  left: `${leftHand.position.x * 100}%`,
                  top: `${leftHand.position.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: '#64A0FF',
                  backgroundColor: 'rgba(100, 160, 255, 0.3)',
                }}
              />
              <span
                className="absolute text-[0.45rem] font-mono text-blue-400/60"
                style={{
                  left: `${leftHand.position.x * 100}%`,
                  top: `${leftHand.position.y * 100 + 12}%`,
                  transform: 'translate(-50%, 0)',
                }}
              >L</span>
            </>
          ) : null}

          {/* RIGHT HAND indicator (green) */}
          {isTracking && rightHand?.position ? (
            <>
              <div
                className="absolute w-8 h-8 rounded-full transition-all duration-150"
                style={{
                  left: `${rightHand.position.x * 100}%`,
                  top: `${rightHand.position.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(100, 220, 130, 0.25) 0%, transparent 70%)',
                }}
              />
              <div
                className="absolute w-3 h-3 rounded-full border-2 transition-all duration-150"
                style={{
                  left: `${rightHand.position.x * 100}%`,
                  top: `${rightHand.position.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: '#64DC82',
                  backgroundColor: 'rgba(100, 220, 130, 0.3)',
                }}
              />
              <span
                className="absolute text-[0.45rem] font-mono text-green-400/60"
                style={{
                  left: `${rightHand.position.x * 100}%`,
                  top: `${rightHand.position.y * 100 + 12}%`,
                  transform: 'translate(-50%, 0)',
                }}
              >R</span>
            </>
          ) : null}

          {/* Empty state */}
          {!isTracking && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-label text-text-muted/30">
                {isPlaying ? 'Show your hands' : 'Start audio first'}
              </p>
            </div>
          )}

          {/* Earcon mode indicator */}
          {earconMode && (
            <div className="absolute top-1 right-1 text-[0.5rem] font-mono text-sage/50 bg-sage/10 px-1.5 py-0.5 rounded">
              🔊 EARCON
            </div>
          )}
        </div>
      </div>

      {/* Gesture Recognition — Both Hands */}
      <div className="mb-3">
        <p className="system-label mb-2">GESTURES</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: leftHand?.gesture ? '#64A0FF' : 'rgba(255,255,255,0.1)' }} />
            <span className="text-[0.6rem] font-mono text-blue-400/60 w-4">L</span>
            <span className="text-body-sm text-text-secondary">
              {leftHand?.gesture ? formatGesture(leftHand.gesture) : 'No gesture'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rightHand?.gesture ? '#64DC82' : 'rgba(255,255,255,0.1)' }} />
            <span className="text-[0.6rem] font-mono text-green-400/60 w-4">R</span>
            <span className="text-body-sm text-text-secondary">
              {rightHand?.gesture ? formatGesture(rightHand.gesture) : 'No gesture'}
            </span>
          </div>
        </div>
      </div>

      {/* Gesture Guide */}
      {isPlaying && (
        <div className="pt-3 border-t border-white/[0.04]">
          <p className="system-label mb-2">GESTURE GUIDE</p>
          <div className="space-y-1">
            <p className="text-[0.55rem] font-mono text-text-muted/40 mb-1">LEFT HAND — Ambient</p>
            {[
              ['🖐️', 'Open Palm', 'Next chord'],
              ['✊', 'Fist', 'Mute'],
              ['☝️', 'Point Up', 'Brighten'],
              ['👎', 'Thumb Down', 'Darken'],
            ].map(([emoji, gesture, action]) => (
              <div key={`l-${gesture}`} className="flex items-center gap-2">
                <span className="text-sm w-5">{emoji}</span>
                <span className="text-label text-text-muted flex-1">{gesture}</span>
                <span className="text-label text-text-muted/60">{action}</span>
              </div>
            ))}
            <p className="text-[0.55rem] font-mono text-text-muted/40 mt-2 mb-1">RIGHT HAND — Melody</p>
            {[
              ['☝️', 'Point Up', 'Fast LFO'],
              ['👎', 'Thumb Down', 'Slow LFO'],
              ['✋', 'Move Y', 'Play notes'],
              ['↔️', 'Move X', 'Reverb wet'],
            ].map(([emoji, gesture, action]) => (
              <div key={`r-${gesture}`} className="flex items-center gap-2">
                <span className="text-sm w-5">{emoji}</span>
                <span className="text-label text-text-muted flex-1">{gesture}</span>
                <span className="text-label text-text-muted/60">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatGesture(gesture) {
  return gesture.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
