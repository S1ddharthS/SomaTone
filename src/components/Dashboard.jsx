import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Square } from 'lucide-react';
import { useEmotionEngine } from '../hooks/useEmotionEngine.js';
import { useHandTracker } from '../hooks/useHandTracker.js';
import { VoiceAssistant } from '../engine/VoiceAssistant.js';
import { SonicRegulator } from '../engine/SonicRegulator.js';
import { supabase } from '../lib/supabaseClient.js';
import { DETECTION_CONFIG, EMOTIONS, EMOTION_COLORS } from '../utils/constants.js';
import { uuid } from '../utils/helpers.js';

import WebcamView from './WebcamView.jsx';
import EmotionHUD from './EmotionHUD.jsx';
import AudioVisualizer from './AudioVisualizer.jsx';
import HapticVisualizer from './HapticVisualizer.jsx';
import VoicePanel from './VoicePanel.jsx';
import SonicControls from './SonicControls.jsx';
import UserMenu from './UserMenu.jsx';
import AccessibilityBar from './AccessibilityBar.jsx';
import CatharsisWaveform from './CatharsisWaveform.jsx';
import VibeJournal from './VibeJournal.jsx';

import { CircadianSoundEngine } from '../engine/CircadianSoundEngine.js';
import { VibeShiftJournal } from '../engine/VibeShiftJournal.js';
import { AcousticAnalyzer } from '../engine/AcousticAnalyzer.js';

/**
 * Dashboard — Main application view with dual-hand tracking,
 * 24 sub-emotion classification, burnout detection, and universal accessibility.
 */
export default function Dashboard({ user, profile, onSignOut }) {
  const videoRef = useRef(null);
  const moodLogTimerRef = useRef(null);
  const lastMacroTimeRef = useRef(0);
  const prevEmotionForA11yRef = useRef(EMOTIONS.NEUTRAL);
  const prevChordIndexForA11yRef = useRef(-1);

  /* Engine instances (stable refs) */
  const voiceAssistantRef = useRef(null);
  const sonicRegulatorRef = useRef(null);
  const circadianEngineRef = useRef(null);
  const vibeJournalRef = useRef(null);
  const acousticAnalyzerRef = useRef(null);

  /* Lazy-init engines */
  if (!voiceAssistantRef.current) voiceAssistantRef.current = new VoiceAssistant();
  if (!sonicRegulatorRef.current) sonicRegulatorRef.current = new SonicRegulator();
  if (!circadianEngineRef.current) circadianEngineRef.current = new CircadianSoundEngine();
  if (!vibeJournalRef.current) vibeJournalRef.current = new VibeShiftJournal();
  if (!acousticAnalyzerRef.current) acousticAnalyzerRef.current = new AcousticAnalyzer();

  const voiceAssistant = voiceAssistantRef.current;
  const sonicRegulator = sonicRegulatorRef.current;
  const circadianEngine = circadianEngineRef.current;
  const vibeShiftJournal = vibeJournalRef.current;
  const acousticAnalyzer = acousticAnalyzerRef.current;

  /* Detection hooks — pass acousticAnalyzer for real-time fusion */
  const emotionState = useEmotionEngine(videoRef, acousticAnalyzer);
  const handState = useHandTracker(videoRef);

  /* UI state */
  const [isListening, setIsListening] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [a11yModes, setA11yModes] = useState({ earcon: false, haptic: false, gestureMacro: false });
  const [burnoutActive, setBurnoutActive] = useState(false);

  /* ─── CALLBACKS (hoisted before effects) ─── */

  const toggleListening = useCallback(() => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
    } else {
      const started = voiceAssistant.startListening();
      setIsListening(started);
    }
  }, [isListening, voiceAssistant]);

  const toggleAudio = useCallback(async () => {
    if (isAudioPlaying) {
      sonicRegulator.stop();
      setIsAudioPlaying(false);
    } else {
      await sonicRegulator.start();
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying, sonicRegulator]);

  const toggleSession = useCallback(async () => {
    if (isSessionActive) {
      voiceAssistant.stopListening();
      voiceAssistant.stop();
      sonicRegulator.stop();
      setIsListening(false);
      setIsAudioPlaying(false);
      setIsSessionActive(false);
      setBurnoutActive(false);
    } else {
      setIsSessionActive(true);
      sessionIdRef.current = uuid();
      await sonicRegulator.start();
      setIsAudioPlaying(true);
      setTimeout(async () => {
        await voiceAssistant.startCheckin();
        setConversationHistory([...voiceAssistant.getHistory()]);
        const started = voiceAssistant.startListening();
        setIsListening(started);
      }, 1500);
    }
  }, [isSessionActive, voiceAssistant, sonicRegulator]);

  const toggleA11y = useCallback((mode) => {
    setA11yModes(prev => ({ ...prev, [mode]: !prev[mode] }));
  }, []);

  /* ─── EFFECTS ─── */

  // Sync emotion state → voice assistant (sub-emotion aware)
  useEffect(() => {
    voiceAssistant.setEmotionState({
      emotion: emotionState.emotion,
      subEmotion: emotionState.subEmotion,
      valence: emotionState.valence,
      arousal: emotionState.arousal,
    });
  }, [emotionState.emotion, emotionState.subEmotion, emotionState.valence, emotionState.arousal, voiceAssistant]);

  // Sync sub-emotion → sonic regulator + circadian
  useEffect(() => {
    if (isAudioPlaying) {
      sonicRegulator.updateFromEmotion(emotionState.subEmotion);
      const modifiers = circadianEngine.update();
      sonicRegulator.applyCircadianModifiers(modifiers);
    }
  }, [emotionState.subEmotion, isAudioPlaying, sonicRegulator, circadianEngine]);

  // Sync hands → sonic regulator (Left/Right independent routing)
  useEffect(() => {
    if (handState.isTracking && isAudioPlaying) {
      sonicRegulator.updateFromHands({
        left: handState.left,
        right: handState.right,
      });

      // Earcon mode (Blind Accessibility): Announce chord changes and position instead of just tones
      if (a11yModes.earcon && handState.left?.position) {
        sonicRegulator.playEarcon(handState.left.position.x, handState.left.position.y);
      }
    }
  }, [handState.left, handState.right, handState.isTracking, isAudioPlaying, sonicRegulator, a11yModes.earcon]);

  // Blind Accessibility: Announce emotion changes and chord changes
  useEffect(() => {
    if (!a11yModes.earcon) return;

    // Check emotion changes
    if (emotionState.subEmotion !== prevEmotionForA11yRef.current && emotionState.subEmotion !== EMOTIONS.NEUTRAL) {
      if (!isSpeaking) {
        voiceAssistant.speak(`I sense you are feeling ${emotionState.subEmotion.replace(/_/g, ' ')}.`);
      }
      prevEmotionForA11yRef.current = emotionState.subEmotion;
    }

    // Check chord changes via interval since it's driven by SonicRegulator's internal timer
    if (isAudioPlaying) {
      const checkChord = () => {
        const state = sonicRegulator.getActiveState();
        if (state.chordIndex !== prevChordIndexForA11yRef.current && state.currentChordNames) {
          prevChordIndexForA11yRef.current = state.chordIndex;
          if (!isSpeaking) {
            voiceAssistant.speak(`Chord changed to ${state.currentChordNames.join(', ')}.`);
          }
        }
      };
      // Poll every 500ms for chord changes
      const interval = setInterval(checkChord, 500);
      return () => clearInterval(interval);
    }
  }, [emotionState.subEmotion, a11yModes.earcon, voiceAssistant, isSpeaking, isAudioPlaying, sonicRegulator]);

  // Gesture macro detection (Non-Verbal Accessibility)
  useEffect(() => {
    if (!a11yModes.gestureMacro) return;

    const leftMacro = voiceAssistant.checkGestureMacro(handState.gestureSequences?.left);
    const rightMacro = voiceAssistant.checkGestureMacro(handState.gestureSequences?.right);

    const macro = leftMacro || rightMacro;
    const now = Date.now();
    if (macro && !isSpeaking && (now - lastMacroTimeRef.current > 5000)) {
      lastMacroTimeRef.current = now;
      voiceAssistant.handleGestureMacro(macro.id);
    }
  }, [handState.gestureSequences, a11yModes.gestureMacro, voiceAssistant, isSpeaking]);

  // Burnout detection
  useEffect(() => {
    const burnoutScore = emotionState.burnoutScore || 0;
    if (burnoutScore >= DETECTION_CONFIG.BURNOUT_THRESHOLD && isAudioPlaying && !burnoutActive) {
      setBurnoutActive(true);
      sonicRegulator.activateBurnoutMode('alpha');
      if (!isSpeaking) {
        voiceAssistant.speak(
          "I'm detecting signs of deep fatigue. I'm switching the soundscape to Alpha entrainment waves at 10 hertz. Close your eyes and let your nervous system settle. You have done enough today.",
          EMOTIONS.TIRED
        );
      }
    } else if (burnoutScore < DETECTION_CONFIG.BURNOUT_THRESHOLD * 0.6 && burnoutActive) {
      setBurnoutActive(false);
      sonicRegulator.deactivateBurnoutMode();
    }
  }, [emotionState.burnoutScore, isAudioPlaying, burnoutActive, sonicRegulator, voiceAssistant, isSpeaking]);

  // AcousticAnalyzer lifecycle
  useEffect(() => {
    if (isSessionActive) { acousticAnalyzer.start(); } else { acousticAnalyzer.stop(); }
  }, [isSessionActive, acousticAnalyzer]);

  // Catharsis Trigger — bridge anomaly to voice assistant
  useEffect(() => {
    acousticAnalyzer.onAnomalyDetected = async (type) => {
      voiceAssistant.setAcousticAnomaly(type);
      if (!isSpeaking) {
        if (type === 'tremor') {
          await voiceAssistant.speak("I can hear the tension in your voice right now. Let's pause the talking. Just lean into the sound layers for a minute.", EMOTIONS.NEUTRAL);
        } else if (type === 'flat') {
          await voiceAssistant.speak("Your voice sounds heavy today. You don't have to carry it all right now. Just listen to the tones.", EMOTIONS.NEUTRAL);
        }
      }
    };
    return () => { acousticAnalyzer.onAnomalyDetected = null; };
  }, [acousticAnalyzer, voiceAssistant, isSpeaking]);

  // Voice assistant callbacks
  useEffect(() => {
    voiceAssistant.onSpeakStart = () => setIsSpeaking(true);
    voiceAssistant.onSpeakEnd = () => {
      setIsSpeaking(false);
      setConversationHistory([...voiceAssistant.getHistory()]);
    };
    voiceAssistant.onTranscript = async (data) => {
      if (data.isFinal) {
        const userText = data.final.trim();
        if (userText.length > 0) {
          const entry = vibeShiftJournal.processTranscript(userText, emotionState.subEmotion, emotionState.valence);
          if (entry && entry.reframe) {
            await voiceAssistant.speak(`Consider this perspective: ${entry.reframe}`);
          }
          setJournalEntries([...vibeShiftJournal.getEntries()]);

          if (isSessionActive) {
            const activeState = sonicRegulator.getActiveState();
            const metrics = acousticAnalyzer.getMetrics();
            supabase.from('mood_logs').insert({
              user_id: user?.id,
              emotion: emotionState.emotion,
              sub_emotion: emotionState.subEmotion,
              emotion_pillar: emotionState.emotion,
              emotion_scores: emotionState.rawScores,
              confidence: emotionState.confidence,
              valence: emotionState.valence,
              arousal: emotionState.arousal,
              burnout_score: emotionState.burnoutScore || 0,
              active_frequencies: activeState,
              left_hand_position: handState.left?.position || null,
              right_hand_position: handState.right?.position || null,
              left_hand_gesture: handState.left?.gesture || null,
              right_hand_gesture: handState.right?.gesture || null,
              acoustic_energy: metrics.energy,
              acoustic_variance: metrics.variance,
              acoustic_jitter: metrics.jitter,
              vocal_anomaly: metrics.anomaly || null,
              journal_text: userText,
              reframe_text: entry?.reframe || null,
              circadian_band: circadianEngine.getCurrentBand(),
              accessibility_mode: Object.entries(a11yModes).filter(([,v]) => v).map(([k]) => k).join(',') || null,
              session_id: sessionIdRef.current,
            });
          }
        }
        setConversationHistory([...voiceAssistant.getHistory()]);
      }
    };
    voiceAssistant.onWakeWord = () => {
      if (!isSessionActive) toggleSession();
    };
    return () => {
      voiceAssistant.onSpeakStart = null;
      voiceAssistant.onSpeakEnd = null;
      voiceAssistant.onTranscript = null;
      voiceAssistant.onWakeWord = null;
    };
  }, [voiceAssistant, isSessionActive, toggleSession]);

  // Passive listening on mount
  useEffect(() => {
    const started = voiceAssistant.startListening();
    if (started) setIsListening(true);
  }, [voiceAssistant]);

  // Periodic mood logging
  useEffect(() => {
    if (!user || !isSessionActive) return;
    const logMood = async () => {
      const activeState = sonicRegulator.getActiveState();
      const metrics = acousticAnalyzer.getMetrics();
      await supabase.from('mood_logs').insert({
        user_id: user.id,
        emotion: emotionState.emotion,
        sub_emotion: emotionState.subEmotion,
        emotion_pillar: emotionState.emotion,
        emotion_scores: emotionState.rawScores,
        confidence: emotionState.confidence,
        valence: emotionState.valence,
        arousal: emotionState.arousal,
        burnout_score: emotionState.burnoutScore || 0,
        active_frequencies: activeState,
        left_hand_position: handState.left?.position || null,
        right_hand_position: handState.right?.position || null,
        left_hand_gesture: handState.left?.gesture || null,
        right_hand_gesture: handState.right?.gesture || null,
        acoustic_energy: metrics.energy,
        acoustic_variance: metrics.variance,
        acoustic_jitter: metrics.jitter,
        vocal_anomaly: metrics.anomaly || null,
        accessibility_mode: Object.entries(a11yModes).filter(([,v]) => v).map(([k]) => k).join(',') || null,
        session_id: sessionIdRef.current,
      });
    };
    logMood();
    moodLogTimerRef.current = setInterval(logMood, DETECTION_CONFIG.MOOD_LOG_INTERVAL_MS);
    return () => { if (moodLogTimerRef.current) clearInterval(moodLogTimerRef.current); };
  }, [user, isSessionActive, emotionState.emotion, emotionState.subEmotion, emotionState.confidence,
      emotionState.valence, emotionState.arousal, sonicRegulator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceAssistant.destroy();
      sonicRegulator.destroy();
      acousticAnalyzer.stop();
      if (moodLogTimerRef.current) clearInterval(moodLogTimerRef.current);
    };
  }, [voiceAssistant, sonicRegulator, acousticAnalyzer]);

  /* ─── RENDER ─── */

  const subEmotionColor = EMOTION_COLORS[emotionState.subEmotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];
  const emotionGlow = subEmotionColor.glow.replace(/[\d.]+\)$/, '0.04)');

  return (
    <div className="fixed inset-0 bg-obsidian flex flex-col overflow-hidden" id="dashboard">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-float opacity-30"
          style={{
            top: '-10%', right: '-5%',
            background: `radial-gradient(circle, ${emotionGlow} 0%, transparent 70%)`,
            transition: 'background 2s ease',
          }}
        />
      </div>

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-sage/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-sage/60" />
          </div>
          <span className="text-body font-light tracking-widest text-text-secondary">SOMATONE</span>
        </div>

        {/* Center: Session Control + Accessibility */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSession}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-500 ease-human ${
              isSessionActive
                ? 'bg-rose/15 border border-rose/25 text-rose hover:bg-rose/20'
                : 'bg-sage/15 border border-sage/25 text-sage hover:bg-sage/20'
            }`}
            id="session-toggle-btn"
          >
            {isSessionActive ? (
              <><Square size={12} fill="currentColor" /><span className="text-body-sm font-medium tracking-wide">End Session</span></>
            ) : (
              <><Play size={12} fill="currentColor" /><span className="text-body-sm font-medium tracking-wide">Begin Session</span></>
            )}
          </button>
          <AccessibilityBar modes={a11yModes} onToggle={toggleA11y} />
        </div>

        {/* Right: User Menu */}
        <UserMenu profile={profile} onSignOut={onSignOut} />
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex gap-4 px-6 pb-4 min-h-0">
        {/* Left Sidebar */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          <EmotionHUD
            emotion={emotionState.emotion}
            subEmotion={emotionState.subEmotion}
            confidence={emotionState.confidence}
            valence={emotionState.valence}
            arousal={emotionState.arousal}
            burnoutScore={emotionState.burnoutScore || 0}
            rawScores={emotionState.rawScores}
          />
          <SonicControls
            isPlaying={isAudioPlaying}
            isTracking={handState.isTracking}
            leftHand={handState.left}
            rightHand={handState.right}
            presetLabel={sonicRegulator.getPresetLabel()}
            emotion={emotionState.subEmotion}
            onToggleAudio={toggleAudio}
            earconMode={a11yModes.earcon}
          />
        </aside>

        {/* Center: Webcam + Visualizer */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 min-h-0">
            <WebcamView
              videoRef={videoRef}
              emotion={emotionState.subEmotion}
              landmarks={emotionState.landmarks}
              isDetecting={emotionState.isReady}
            />
          </div>

          {/* Swap visualizer based on haptic mode */}
          {a11yModes.haptic ? (
            <HapticVisualizer
              sonicRegulator={sonicRegulator}
              emotion={emotionState.subEmotion}
              isPlaying={isAudioPlaying}
            />
          ) : (
            <AudioVisualizer
              sonicRegulator={sonicRegulator}
              emotion={emotionState.subEmotion}
              isPlaying={isAudioPlaying}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-4">
          <VoicePanel
            voiceAssistant={voiceAssistant}
            emotion={emotionState.subEmotion}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleListening={toggleListening}
            conversationHistory={conversationHistory}
          />
          <CatharsisWaveform analyzer={acousticAnalyzer} />
          <VibeJournal entries={journalEntries} />
        </aside>
      </main>
    </div>
  );
}
