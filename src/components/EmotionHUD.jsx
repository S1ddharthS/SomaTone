import React, { useMemo } from 'react';
import { EMOTION_COLORS, EMOTIONS, EMOTION_LABELS, EMOTION_PILLARS, PILLAR_LABELS, PILLARS } from '../utils/constants.js';

/**
 * EmotionHUD — Heads-up display showing current emotional state
 * with 24 sub-emotion granularity grouped under 6 pillars.
 *
 * Features:
 *  - Sub-emotion label with pillar indicator
 *  - SVG confidence ring
 *  - Valence/Arousal/Burnout bars
 *  - 24 sub-emotion expression scores grouped by pillar
 */
export default function EmotionHUD({ emotion, subEmotion, confidence, valence, arousal, burnoutScore = 0, rawScores }) {
  const color = EMOTION_COLORS[subEmotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

  const confidenceAngle = useMemo(() => confidence * 360, [confidence]);

  const emotionLabel = useMemo(() => {
    return EMOTION_LABELS[subEmotion] || 'Neutral';
  }, [subEmotion]);

  const pillarLabel = useMemo(() => {
    const pillar = EMOTION_PILLARS[subEmotion] || PILLARS.NEUTRAL;
    return PILLAR_LABELS[pillar] || 'Neutral';
  }, [subEmotion]);

  const valencePercent = ((valence + 1) / 2) * 100;
  const arousalPercent = arousal * 100;

  // Group raw scores by pillar for organized display
  const groupedScores = useMemo(() => {
    if (!rawScores || Object.keys(rawScores).length === 0) return [];

    const groups = {};
    for (const [key, value] of Object.entries(rawScores)) {
      const pillar = EMOTION_PILLARS[key] || 'other';
      if (!groups[pillar]) groups[pillar] = [];
      groups[pillar].push({ key, value, label: EMOTION_LABELS[key] || key });
    }

    // Sort pillars in consistent order
    const pillarOrder = [PILLARS.HAPPINESS, PILLARS.SADNESS, PILLARS.FEAR, PILLARS.ANGER, PILLARS.SURPRISE, PILLARS.DISGUST, PILLARS.TIRED];
    const sorted = [];
    for (const p of pillarOrder) {
      if (groups[p]) {
        sorted.push({
          pillar: p,
          pillarLabel: PILLAR_LABELS[p] || p,
          emotions: groups[p].sort((a, b) => b.value - a.value),
        });
      }
    }
    return sorted;
  }, [rawScores]);

  return (
    <div
      className="glass-panel rounded-2xl p-5 transition-all duration-700 ease-human"
      style={{ boxShadow: `0 0 40px ${color.glow}` }}
      id="emotion-hud"
    >
      {/* Top: Emotion Ring + Label */}
      <div className="flex items-center gap-4 mb-5">
        {/* Confidence Ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke={color.primary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(confidenceAngle / 360) * 150.8} 150.8`}
              className="transition-all duration-700 ease-human"
              style={{ filter: `drop-shadow(0 0 4px ${color.glow})` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full transition-colors duration-700" style={{ backgroundColor: color.primary, opacity: 0.8 }} />
          </div>
        </div>

        {/* Emotion Label */}
        <div>
          <p className="system-label mb-0.5" style={{ color: color.dim }}>
            {pillarLabel.toUpperCase()} PILLAR
          </p>
          <h2 className="text-heading-sm transition-colors duration-700" style={{ color: color.primary }}>
            {emotionLabel}
          </h2>
          <p className="text-label text-text-muted mt-0.5">
            {Math.round(confidence * 100)}% confidence
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.04] mb-4" />

      {/* Dimensions */}
      <div className="space-y-3">
        {/* Valence */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="system-label">VALENCE</span>
            <span className="text-label text-text-muted">
              {valence > 0 ? '+' : ''}{valence.toFixed(2)}
            </span>
          </div>
          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-1/2 w-px h-full bg-white/[0.08]" />
            <div
              className="absolute top-0 h-full rounded-full transition-all duration-700 ease-human"
              style={{
                left: valence >= 0 ? '50%' : `${valencePercent}%`,
                width: `${Math.abs(valence) * 50}%`,
                backgroundColor: color.primary,
                opacity: 0.6,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.6rem] text-text-muted/40">negative</span>
            <span className="text-[0.6rem] text-text-muted/40">positive</span>
          </div>
        </div>

        {/* Arousal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="system-label">AROUSAL</span>
            <span className="text-label text-text-muted">{arousal.toFixed(2)}</span>
          </div>
          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-human"
              style={{ width: `${arousalPercent}%`, backgroundColor: color.primary, opacity: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.6rem] text-text-muted/40">calm</span>
            <span className="text-[0.6rem] text-text-muted/40">activated</span>
          </div>
        </div>

        {/* Burnout Score */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="system-label">BURNOUT</span>
            <span className="text-label text-text-muted">{(burnoutScore * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-human"
              style={{
                width: `${burnoutScore * 100}%`,
                backgroundColor: burnoutScore > 0.7 ? '#FF6347' : burnoutScore > 0.4 ? '#FFD700' : color.primary,
                opacity: 0.6,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.6rem] text-text-muted/40">rested</span>
            <span className="text-[0.6rem] text-text-muted/40">exhausted</span>
          </div>
        </div>
      </div>

      {/* Raw Score Breakdown — Grouped by Pillar */}
      {groupedScores.length > 0 && (
        <>
          <div className="h-px bg-white/[0.04] my-4" />
          <div className="space-y-3">
            <p className="system-label mb-2">EXPRESSION SCORES</p>
            {groupedScores.map(({ pillar, pillarLabel: pLabel, emotions: emos }) => (
              <div key={pillar}>
                <p className="text-[0.55rem] font-mono text-text-muted/40 uppercase tracking-widest mb-1.5">{pLabel}</p>
                <div className="space-y-1.5">
                  {emos.map(({ key, value, label }) => {
                    const entryColor = EMOTION_COLORS[key] || EMOTION_COLORS[EMOTIONS.NEUTRAL];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-label text-text-muted w-24 truncate">{label}</span>
                        <div className="flex-1 h-0.5 bg-white/[0.03] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(value * 100, 100)}%`,
                              backgroundColor: entryColor.primary,
                              opacity: 0.5,
                            }}
                          />
                        </div>
                        <span className="text-label text-text-muted w-10 text-right">
                          {(value * 100).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
