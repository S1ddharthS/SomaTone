import * as Tone from 'tone';
import { AUDIO_PRESETS, BURNOUT_PRESETS, PENTATONIC_SCALES, EARCON_TONES, EMOTIONS, EMOTION_PILLARS } from '../utils/constants.js';
import { mapRange, clamp } from '../utils/helpers.js';

/**
 * SonicRegulator — Dual-hand polyphonic Tone.js audio engine.
 *
 * Signal chains:
 *   Ambient:  PolySynth → Filter → Chorus → Reverb → Delay → Panner → Gain → Analyser → Destination
 *   Lead:     MonoSynth → LeadReverb → LeadDelay → Gain → Analyser → Destination
 *   Burnout:  2x Oscillators (binaural) → BurnoutGain → Destination
 *   Earcon:   MonoSynth → EarconPanner → Destination
 */
export class SonicRegulator {
  constructor() {
    this.isPlaying = false;
    this.isInitialized = false;
    this.isInitializing = false;
    this.isBurnoutMode = false;
    this.currentEmotion = EMOTIONS.NEUTRAL;
    this.currentPreset = AUDIO_PRESETS[EMOTIONS.NEUTRAL];
    this.currentChordIndex = 0;
    this.chordInterval = null;

    /* Ambient chain nodes */
    this.synth = null;
    this.filter = null;
    this.chorus = null;
    this.reverb = null;
    this.delay = null;
    this.panner = null;
    this.analyser = null;
    this.lfo = null;
    this.gainNode = null;

    /* Lead synth nodes (right hand) */
    this.leadSynth = null;
    this.leadReverb = null;
    this.leadDelay = null;
    this.lastLeadNote = null;

    /* Burnout binaural nodes */
    this.burnoutOscL = null;
    this.burnoutOscR = null;
    this.burnoutGain = null;
    this.burnoutPannerL = null;
    this.burnoutPannerR = null;

    /* Earcon accessibility synth */
    this.earconSynth = null;
    this.earconPanner = null;
  }

  async init() {
    if (this.isInitialized || this.isInitializing) return;
    this.isInitializing = true;

    try {
      await Tone.start();
      if (Tone.context.state !== 'running') {
        await Tone.context.resume();
      }

      /* ── Analyser & Master Gain ── */
      this.analyser = new Tone.Analyser('waveform', 256);
      this.gainNode = new Tone.Gain(0.35).connect(this.analyser);
      this.analyser.toDestination();

      /* ── Panner (Left Hand X-axis) ── */
      this.panner = new Tone.Panner(0).connect(this.gainNode);

      /* ── Delay ── */
      this.delay = new Tone.PingPongDelay({
        delayTime: this.currentPreset.delayTime,
        feedback: this.currentPreset.delayFeedback,
        wet: 0.2,
      }).connect(this.panner);

      /* ── Reverb ── */
      this.reverb = new Tone.Reverb({
        decay: this.currentPreset.reverbDecay,
        wet: this.currentPreset.reverbWet,
      }).connect(this.delay);
      await this.reverb.ready;

      /* ── Chorus ── */
      this.chorus = new Tone.Chorus({ frequency: 0.5, delayTime: 3.5, depth: 0.6, wet: 0.3 }).connect(this.reverb);
      this.chorus.start();

      /* ── Filter ── */
      this.filter = new Tone.Filter({ frequency: this.currentPreset.filterFreq, type: 'lowpass', rolloff: -24, Q: 1 }).connect(this.chorus);

      /* ── LFO ── */
      this.lfo = new Tone.LFO({ frequency: this.currentPreset.lfoFreq, min: this.currentPreset.filterFreq * 0.5, max: this.currentPreset.filterFreq * 1.5 });
      this.lfo.connect(this.filter.frequency);

      /* ── Ambient PolySynth ── */
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: this.currentPreset.oscillator },
        envelope: { attack: this.currentPreset.attack, decay: 0.5, sustain: 0.8, release: this.currentPreset.release },
        volume: -12,
      }).connect(this.filter);

      /* ── Lead Synth (Right Hand Pentatonic) ── */
      this.leadReverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(this.gainNode);
      await this.leadReverb.ready;
      this.leadDelay = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.15, wet: 0.25 }).connect(this.leadReverb);
      this.leadSynth = new Tone.MonoSynth({
        oscillator: { type: 'triangle' },
        filter: { Q: 2, type: 'lowpass', rolloff: -12 },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.0 },
        filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 0.8, baseFrequency: 300, octaves: 3 },
        volume: -18,
      }).connect(this.leadDelay);

      /* ── Burnout Binaural Beat Oscillators ── */
      this.burnoutPannerL = new Tone.Panner(-1).toDestination();
      this.burnoutPannerR = new Tone.Panner(1).toDestination();
      this.burnoutGain = new Tone.Gain(0).connect(this.burnoutPannerL).connect(this.burnoutPannerR);
      this.burnoutOscL = new Tone.Oscillator({ type: 'sine', frequency: 200, volume: -20 }).connect(this.burnoutPannerL);
      this.burnoutOscR = new Tone.Oscillator({ type: 'sine', frequency: 210, volume: -20 }).connect(this.burnoutPannerR);

      /* ── Earcon Synth (Accessibility) ── */
      this.earconPanner = new Tone.Panner(0).toDestination();
      this.earconSynth = new Tone.MonoSynth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.05, release: 0.3 },
        volume: -15,
      }).connect(this.earconPanner);

      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize SonicRegulator:', err);
    } finally {
      this.isInitializing = false;
    }
  }

  async start() {
    if (!this.isInitialized) await this.init();
    if (Tone.context.state !== 'running') {
      try { await Tone.context.resume(); } catch (err) { console.warn('Could not resume audio context:', err); return; }
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.gainNode) {
      this.gainNode.gain.cancelScheduledValues(Tone.now());
      this.gainNode.gain.rampTo(0.35, 0.5, Tone.now());
    }
    if (this.lfo) this.lfo.start();
    this._playNextChord();

    const chordDurationMs = this.currentPreset.attack * 1000 + this.currentPreset.release * 1000 + 1000;
    this.chordInterval = setInterval(() => {
      if (this.isPlaying) this._playNextChord();
    }, chordDurationMs);
  }

  stop() {
    this.isPlaying = false;
    if (this.chordInterval) { clearInterval(this.chordInterval); this.chordInterval = null; }
    if (Tone.context.state === 'running') {
      if (this.synth) this.synth.releaseAll();
      if (this.lfo) this.lfo.stop();
      if (this.gainNode) {
        this.gainNode.gain.cancelScheduledValues(Tone.now());
        this.gainNode.gain.rampTo(0, 0.8, Tone.now());
      }
    }
    this.deactivateBurnoutMode();
  }

  _playNextChord() {
    if (!this.synth || !this.isPlaying || Tone.context.state !== 'running') return;
    try {
      const chords = this.currentPreset.chords;
      const chord = chords[this.currentChordIndex % chords.length];
      const duration = this.currentPreset.attack + this.currentPreset.release;
      this.synth.triggerAttackRelease(chord, duration);
      // We no longer auto-increment chord index here to let the left hand control it
      // this.currentChordIndex++;
    } catch (err) { console.warn('Failed to play chord:', err); }
  }

  /**
   * Update audio parameters based on sub-emotion (or pillar).
   * Accepts the sub-emotion key directly (e.g., 'anxiety', 'joy').
   */
  updateFromEmotion(subEmotion) {
    if (subEmotion === this.currentEmotion || !this.isInitialized || Tone.context.state !== 'running') return;
    this.currentEmotion = subEmotion;
    const preset = AUDIO_PRESETS[subEmotion] || AUDIO_PRESETS[EMOTIONS.NEUTRAL];
    this.currentPreset = preset;
    const now = Tone.now();

    try {
      const targetFreq = Math.max(20, preset.filterFreq);
      if (this.filter) this.filter.frequency.rampTo(targetFreq, 3, now);
      if (this.lfo) {
        const targetLfo = Math.max(0.01, preset.lfoFreq);
        this.lfo.frequency.rampTo(targetLfo, 2, now);
        this.lfo.min = preset.filterFreq * 0.5;
        this.lfo.max = preset.filterFreq * 1.5;
      }
      const targetWet = clamp(preset.reverbWet, 0, 1);
      if (this.reverb) this.reverb.wet.rampTo(targetWet, 2, now);
      const targetDelay = clamp(preset.delayFeedback, 0, 1);
      if (this.delay) this.delay.feedback.rampTo(targetDelay, 2, now);
      if (this.synth) {
        this.synth.set({
          oscillator: { type: preset.oscillator },
          envelope: { attack: preset.attack, release: preset.release },
        });
      }
      this.currentChordIndex = 0;
      if (this.chordInterval) {
        clearInterval(this.chordInterval);
        const chordDurationMs = preset.attack * 1000 + preset.release * 1000 + 1000;
        this.chordInterval = setInterval(() => { if (this.isPlaying) this._playNextChord(); }, chordDurationMs);
      }
    } catch (err) { console.warn('Failed to update from emotion:', err); }
  }

  applyCircadianModifiers(modifiers) {
    if (!this.isInitialized || Tone.context.state !== 'running' || !modifiers) return;
    const now = Tone.now();
    try {
      const targetFreq = Math.max(20, this.currentPreset.filterFreq * modifiers.filterBias);
      if (this.filter) this.filter.frequency.rampTo(targetFreq, 5, now);
      
      const targetWet = clamp(this.currentPreset.reverbWet * modifiers.reverbBias, 0, 1);
      if (this.reverb) this.reverb.wet.rampTo(targetWet, 5, now);
    } catch (err) { console.warn('Failed to apply circadian modifiers:', err); }
  }

  /* ─── DUAL-HAND ROUTING ─── */

  /**
   * @param {{ left: { position, gesture } | null, right: { position, gesture } | null }}
   */
  updateFromHands({ left, right }) {
    if (!this.isInitialized || !this.isPlaying || Tone.context.state !== 'running') return;
    const now = Tone.now();

    try {
      /* ── LEFT HAND: Spatial Panning, Chords, and Sustain ── */
      if (left) {
        const { position, gesture } = left;
        if (position) {
          // X-axis → Spatial Panning (-1 = full left, +1 = full right)
          const pan = clamp(mapRange(position.x, 0, 1, -1, 1), -1, 1);
          if (this.panner) this.panner.pan.rampTo(pan, 0.3, now);

          // Y-axis → Select Chord Progression Root
          if (this.currentPreset && this.currentPreset.chords) {
            const chordCount = this.currentPreset.chords.length;
            const newIndex = clamp(Math.floor(mapRange(position.y, 1, 0, 0, chordCount - 1)), 0, chordCount - 1);
            if (newIndex !== this.currentChordIndex) {
              this.currentChordIndex = newIndex;
              this._playNextChord();
            }
          }
        }
        if (gesture) {
          switch (gesture) {
            case 'Open_Palm':
              // Sustain: Keep gain open and filter bright
              if (this.gainNode) this.gainNode.gain.rampTo(0.5, 0.5, now);
              if (this.filter) this.filter.frequency.rampTo(4000, 1, now);
              break;
            case 'Closed_Fist':
              // Mute/Release: Drop gain and close filter
              if (this.gainNode) this.gainNode.gain.exponentialRampTo(0.01, 0.5, now);
              if (this.filter) this.filter.frequency.rampTo(200, 0.5, now);
              if (this.synth) this.synth.releaseAll();
              break;
            case 'Pointing_Up':
              if (this.filter) this.filter.frequency.rampTo(5000, 0.5, now);
              break;
            case 'Thumb_Down':
              if (this.filter) this.filter.frequency.rampTo(200, 0.5, now);
              break;
            default:
              if (this.gainNode && this.gainNode.gain.value < 0.3) {
                this.gainNode.gain.rampTo(0.35, 1, now);
              }
              break;
          }
        }
      }

      /* ── RIGHT HAND: Pentatonic Lead Notes + Vibrato ── */
      if (right) {
        const { position, gesture } = right;
        if (position) {
          // X-axis → Pentatonic note selection
          const scale = PENTATONIC_SCALES[this.currentEmotion] || PENTATONIC_SCALES[EMOTIONS.NEUTRAL];
          const noteIndex = Math.floor(mapRange(position.x, 0, 1, 0, scale.length - 1));
          const note = scale[clamp(noteIndex, 0, scale.length - 1)];

          if (this.leadSynth && note !== this.lastLeadNote) {
            this.leadSynth.triggerAttackRelease(note, '8n', now);
            this.lastLeadNote = note;
          }

          // Y-axis → Vibrato (LFO frequency)
          const vibratoSpeed = mapRange(position.y, 1, 0, 0.1, 10);
          if (this.lfo) this.lfo.frequency.rampTo(vibratoSpeed, 0.2, now);
        }

        if (gesture === 'Pointing_Up') {
          // Increase LFO speed
          const targetLfo = Math.max(0.01, this.currentPreset.lfoFreq * 2.5);
          if (this.lfo) this.lfo.frequency.rampTo(targetLfo, 0.5, now);
        } else if (gesture === 'Thumb_Down') {
          // Deep slow LFO
          const targetLfo = Math.max(0.01, this.currentPreset.lfoFreq * 0.2);
          if (this.lfo) this.lfo.frequency.rampTo(targetLfo, 0.5, now);
        } else if (gesture !== 'Closed_Fist' && this.lfo) {
          const targetLfo = Math.max(0.01, this.currentPreset.lfoFreq);
          this.lfo.frequency.rampTo(targetLfo, 2, now);
        }
      }
    } catch (err) { console.warn('Failed to update from hands:', err); }
  }

  /* ─── BURNOUT MODE (Alpha/Theta Entrainment) ─── */

  activateBurnoutMode(type = 'alpha') {
    if (!this.isInitialized || this.isBurnoutMode || Tone.context.state !== 'running') return;
    this.isBurnoutMode = true;

    const preset = BURNOUT_PRESETS[type] || BURNOUT_PRESETS.alpha;
    const now = Tone.now();

    try {
      // Fade ambient down
      if (this.gainNode) this.gainNode.gain.rampTo(0.08, 3, now);

      // Set binaural frequencies
      if (this.burnoutOscL) {
        this.burnoutOscL.frequency.setValueAtTime(preset.binauralBaseHz, now);
        this.burnoutOscL.start(now);
      }
      if (this.burnoutOscR) {
        this.burnoutOscR.frequency.setValueAtTime(preset.binauralBaseHz + preset.binauralBeatHz, now);
        this.burnoutOscR.start(now);
      }
    } catch (err) { console.warn('Failed to activate burnout mode:', err); }
  }

  deactivateBurnoutMode() {
    if (!this.isBurnoutMode) return;
    this.isBurnoutMode = false;

    try {
      if (this.burnoutOscL) this.burnoutOscL.stop();
      if (this.burnoutOscR) this.burnoutOscR.stop();
      if (this.gainNode && this.isPlaying) {
        this.gainNode.gain.rampTo(0.35, 2, Tone.now());
      }
    } catch (err) { /* ignore */ }
  }

  /* ─── EARCON ACCESSIBILITY ─── */

  playEarcon(gridX, gridY) {
    if (!this.isInitialized || Tone.context.state !== 'running') return;

    // Map position to 3x3 grid zone
    const col = gridX < 0.33 ? 'Left' : gridX < 0.66 ? 'Center' : 'Right';
    const row = gridY < 0.33 ? 'top' : gridY < 0.66 ? 'mid' : 'bottom';
    const key = `${row}${col}`;

    const earcon = EARCON_TONES[key];
    if (!earcon || !this.earconSynth) return;

    try {
      if (this.earconPanner) this.earconPanner.pan.setValueAtTime(earcon.pan, Tone.now());
      this.earconSynth.triggerAttackRelease(earcon.note, '16n');
    } catch (err) { /* ignore */ }
  }

  /* ─── GETTERS ─── */

  getWaveform() {
    if (!this.isInitialized || !this.analyser) return new Float32Array(256).fill(0);
    try { return this.analyser.getValue(); } catch (err) { return new Float32Array(256).fill(0); }
  }

  getFrequencyData() {
    if (!this.isInitialized || !this.analyser) return new Float32Array(256).fill(0);
    try { return this.analyser.getValue(); } catch (err) { return new Float32Array(256).fill(0); }
  }

  getPresetLabel() { return this.currentPreset?.label || 'Still Waters'; }

  getActiveState() {
    const currentChordNames = this.currentPreset?.chords?.[this.currentChordIndex % this.currentPreset.chords.length] || [];
    return {
      filterFreq: this.filter ? this.filter.frequency.value : 0,
      reverbWet: this.reverb ? this.reverb.wet.value : 0,
      chordIndex: this.currentChordIndex,
      currentChordNames,
      preset: this.currentPreset?.label || 'none',
      isBurnoutMode: this.isBurnoutMode,
    };
  }

  destroy() {
    this.stop();
    const disposeNode = (node) => { if (node) try { node.dispose(); } catch (e) { /* ignore */ } };

    disposeNode(this.synth); this.synth = null;
    disposeNode(this.filter); this.filter = null;
    disposeNode(this.chorus); this.chorus = null;
    disposeNode(this.reverb); this.reverb = null;
    disposeNode(this.delay); this.delay = null;
    disposeNode(this.panner); this.panner = null;
    disposeNode(this.lfo); this.lfo = null;
    disposeNode(this.gainNode); this.gainNode = null;
    disposeNode(this.analyser); this.analyser = null;
    disposeNode(this.leadSynth); this.leadSynth = null;
    disposeNode(this.leadReverb); this.leadReverb = null;
    disposeNode(this.leadDelay); this.leadDelay = null;
    disposeNode(this.burnoutOscL); this.burnoutOscL = null;
    disposeNode(this.burnoutOscR); this.burnoutOscR = null;
    disposeNode(this.burnoutGain); this.burnoutGain = null;
    disposeNode(this.burnoutPannerL); this.burnoutPannerL = null;
    disposeNode(this.burnoutPannerR); this.burnoutPannerR = null;
    disposeNode(this.earconSynth); this.earconSynth = null;
    disposeNode(this.earconPanner); this.earconPanner = null;

    this.isInitialized = false;
  }
}
