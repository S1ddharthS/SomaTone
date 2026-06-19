import { VOICE_PRESETS, CHECKIN_PROMPTS, EMOTIONS, GESTURE_MACROS, EMOTION_LABELS, EMOTION_PILLARS } from '../utils/constants.js';
import { pickRandom } from '../utils/helpers.js';

/**
 * VoiceAssistant — Adaptive TTS/STT engine with burnout de-escalation,
 * clinical stress responses, wake word detection, and gesture macro support.
 */
export class VoiceAssistant {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentEmotion = EMOTIONS.NEUTRAL;
    this.currentValence = 0;
    this.currentArousal = 0.5;
    this.conversationHistory = [];
    this.checkinIndex = 0;
    this.selectedVoice = null;
    this.onTranscript = null;
    this.onSpeakStart = null;
    this.onSpeakEnd = null;
    this.onError = null;
    this.onWakeWord = null;
    this.onGestureMacro = null;
    this.acousticAnomaly = null;
    this.supported = { recognition: false, synthesis: false };

    this._initRecognition();
    this._initSynthesis();
  }

  _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { this.supported.recognition = false; return; }

    this.supported.recognition = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onTranscript) {
        this.onTranscript({ interim: interimTranscript, final: finalTranscript, isFinal: finalTranscript.length > 0 });
      }

      // Wake word detection
      const currentTranscript = (finalTranscript + ' ' + interimTranscript).toLowerCase();
      if (currentTranscript.includes('hey soma') || currentTranscript.includes('soma ')) {
        if (this.onWakeWord) this.onWakeWord();
      }

      // Proactive keyword detection on interim transcripts
      if (interimTranscript.length > 0) {
        this._checkKeywords(interimTranscript);
      }

      if (finalTranscript.trim().length > 0) {
        this._handleUserInput(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        if (this.onError) this.onError('Microphone access denied. Please allow microphone access.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (this.onError) this.onError(`Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try { this.recognition.start(); } catch (e) { /* already started */ }
      }
    };
  }

  _initSynthesis() {
    if (!this.synth) { this.supported.synthesis = false; return; }
    this.supported.synthesis = true;
    this._selectVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this._selectVoice();
    }
  }

  _selectVoice() {
    const voices = this.synth.getVoices();
    if (voices.length === 0) return;
    const preferredNames = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google UK English Female', 'Google US English', 'Microsoft Zira', 'Microsoft Jenny'];
    for (const name of preferredNames) {
      const match = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (match) { this.selectedVoice = match; return; }
    }
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) this.selectedVoice = englishVoice;
  }

  setEmotionState({ emotion, subEmotion, valence, arousal }) {
    const prevSubEmotion = this.currentEmotion;
    this.currentEmotion = subEmotion || emotion;
    this.currentPillar = emotion;
    this.currentValence = valence;
    this.currentArousal = arousal;

    // Proactive emotion checking
    if (prevSubEmotion !== this.currentEmotion && this.currentEmotion !== EMOTIONS.NEUTRAL) {
      this._emotionStartTime = Date.now();
    } else if (this.currentEmotion === EMOTIONS.NEUTRAL) {
      this._emotionStartTime = null;
    }

    // If an intense emotion is held for > 8 seconds, proactively comment (once)
    if (this._emotionStartTime && !this.isSpeaking && !this._hasCommentedOnEmotion) {
      if (Date.now() - this._emotionStartTime > 8000) {
        this._hasCommentedOnEmotion = true;
        this._proactiveEmotionComment();
      }
    } else if (this.currentEmotion === EMOTIONS.NEUTRAL) {
      this._hasCommentedOnEmotion = false;
    }
  }

  setAcousticAnomaly(anomalyType) {
    this.acousticAnomaly = anomalyType;
  }

  setEmotion(emotion) {
    this.currentEmotion = emotion;
    this.currentPillar = EMOTION_PILLARS[emotion] || 'neutral';
    this.currentValence = 0;
    this.currentArousal = 0.5;
  }

  startListening() {
    if (!this.supported.recognition) {
      if (this.onError) this.onError('Speech recognition is not supported in this browser.');
      return false;
    }
    try { this.isListening = true; this.recognition.start(); return true; } catch (e) { return false; }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) { try { this.recognition.stop(); } catch (e) { /* already stopped */ } }
  }

  speak(text, emotionOverride) {
    return new Promise((resolve, reject) => {
      if (!this.supported.synthesis) {
        this.conversationHistory.push({ role: 'assistant', text, timestamp: Date.now() });
        resolve();
        return;
      }

      this.synth.cancel();

      const emotion = emotionOverride || this.currentEmotion;
      const preset = VOICE_PRESETS[emotion] || VOICE_PRESETS[EMOTIONS.NEUTRAL];
      const utterance = new SpeechSynthesisUtterance(text);

      // Dynamic TTS interpolation
      let finalPitch = preset.pitch;
      let finalRate = preset.rate;
      if (this.currentValence !== undefined && this.currentArousal !== undefined) {
        finalPitch = 1.0 + (this.currentValence * 0.2) + ((this.currentArousal - 0.5) * 0.2);
        finalRate = 1.0 + ((this.currentArousal - 0.5) * 0.3);
        finalPitch = Math.max(0.7, Math.min(finalPitch, 1.4));
        finalRate = Math.max(0.75, Math.min(finalRate, 1.25));
      }

      utterance.pitch = finalPitch;
      utterance.rate = finalRate;
      utterance.volume = preset.volume;
      if (this.selectedVoice) utterance.voice = this.selectedVoice;

      utterance.onstart = () => { this.isSpeaking = true; if (this.onSpeakStart) this.onSpeakStart(text); };
      utterance.onend = () => { this.isSpeaking = false; if (this.onSpeakEnd) this.onSpeakEnd(); resolve(); };
      utterance.onerror = (event) => {
        this.isSpeaking = false;
        if (event.error !== 'interrupted') { if (this.onError) this.onError(`Speech synthesis error: ${event.error}`); reject(event.error); } else { resolve(); }
      };

      this.conversationHistory.push({ role: 'assistant', text, timestamp: Date.now() });
      this.synth.speak(utterance);
    });
  }

  async _handleUserInput(userText) {
    this.conversationHistory.push({ role: 'user', text: userText, timestamp: Date.now() });
    const response = this._generateResponse(userText);
    await this.speak(response);
  }

  _generateResponse(userText) {
    const preset = VOICE_PRESETS[this.currentEmotion] || VOICE_PRESETS[EMOTIONS.NEUTRAL];
    const lower = userText.toLowerCase();

    /* ── Acoustic Anomaly Checks ── */
    if (this.acousticAnomaly) {
      const anomaly = this.acousticAnomaly;
      this.acousticAnomaly = null; // Consume it
      if (anomaly === 'tremor') {
        return "I can hear the break in your voice. It sounds like you're carrying a lot of tension right now. It's okay to let it out, I'm here with you.";
      } else if (anomaly === 'flat') {
        return "Your voice sounds so heavy and exhausted. I hear you. You don't have to carry this all alone. Just lean into the sounds for a moment.";
      }
    }

    /* ── Identity ── */
    if (lower.includes('how are you') || lower.includes('what do you do')) {
      return "I'm SomaTone, your emotional wellness companion. I can sense how you're feeling through your expressions and create adaptive soundscapes to help you regulate your mood. Tell me — how are you feeling right now?";
    }
    if (lower.includes('help') || lower.includes('what can you do')) {
      return "I can read your facial expressions, play adaptive soundscapes, and guide you through check-ins. Use your left hand to control the spatial sound field, and your right hand to play melodies. I also support gesture macros for non-verbal communication.";
    }

    /* ── Gratitude & Farewell ── */
    if (lower.includes('thank') || lower.includes('thanks')) {
      return "You're very welcome. Remember, taking time to check in with yourself is an act of self-care.";
    }
    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you')) {
      return "Take care of yourself. You can always come back whenever you need a moment of calm. Goodbye for now.";
    }

    /* ── Burnout & Work Stress (Clinical De-Escalation) ── */
    if (lower.includes('burned out') || lower.includes('burnout') || lower.includes('exhausted') || lower.includes('drained')) {
      return "I hear you, and burnout is real. Let's practice a boundary exercise: Close your eyes. Imagine a circle of light around you. Everything inside that circle is yours to protect. Say to yourself: 'I have done enough today.' The Alpha waves are playing now to help your nervous system settle.";
    }
    if (lower.includes('work') && (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('too much'))) {
      return "Work stress can feel all-consuming. Let's try the 5-4-3-2-1 grounding technique: Name 5 things you can see. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. This brings your nervous system back to the present moment.";
    }
    if (lower.includes('can\'t stop thinking') || lower.includes('racing thoughts') || lower.includes('overthinking')) {
      return "Racing thoughts are your brain's stress response trying to solve everything at once. Let's interrupt that loop. Focus on your breath — count each exhale backward from ten. The soundscape is shifting into Theta waves to help slow your neural activity.";
    }

    /* ── Emotional Keywords ── */
    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('anxiety') || lower.includes('worried')) {
      return "I hear you. Stress and anxiety can feel overwhelming. Let's try something together — take a slow, deep breath in for four counts, hold for four, and exhale for six. Your soundscape is adapting to help create a sense of safety.";
    }
    if (lower.includes('happy') || lower.includes('great') || lower.includes('good') || lower.includes('amazing')) {
      return "That's wonderful to hear! Your energy is absolutely radiant. Let's celebrate this moment. The soundscape is shifting to match your positive vibrations.";
    }
    if (lower.includes('sad') || lower.includes('down') || lower.includes('lonely') || lower.includes('depressed')) {
      return "Thank you for sharing that with me. It takes real courage to acknowledge these feelings. You're not alone in this. I'm adjusting the soundscape to create a gentle, supportive atmosphere for you.";
    }
    if (lower.includes('angry') || lower.includes('frustrated') || lower.includes('mad') || lower.includes('annoyed')) {
      return "I can sense that intensity. Your feelings are completely valid. Let's channel that energy together. Try unclenching your jaw and dropping your shoulders. The grounding tones are here to support you.";
    }
    if (lower.includes('scared') || lower.includes('afraid') || lower.includes('fear')) {
      return "Fear is your body's way of trying to protect you. You are safe right now, in this moment. Let's breathe together — in for four, hold for four, out for eight. The sounds are wrapping around you like a cocoon.";
    }
    if (lower.includes('disgust') || lower.includes('gross') || lower.includes('repulsed')) {
      return "That sounds like a strong visceral reaction. It's okay to feel that. Let's redirect your focus. What's one thing in your environment right now that feels neutral or pleasant?";
    }
    if (lower.includes('tired') || lower.includes('sleepy') || lower.includes('fatigue')) {
      return "Your body is telling you it needs rest. That's not weakness, that's wisdom. I'm lowering the soundscape into deep, slow waves. Just close your eyes and let the tones carry you.";
    }

    return pickRandom(preset.responses);
  }

  _checkKeywords(text) {
    if (this.isSpeaking) return;
    const lower = text.toLowerCase();
    
    // Proactive interjections for immediate distress or joy
    if (lower.includes('panic') || lower.includes('overwhelmed') || lower.includes('too much')) {
      this.speak("I hear you. Let's pause everything. Deep breath in.");
    } else if (lower.includes('amazing') || lower.includes('so happy') || lower.includes('great news')) {
      this.speak("That's wonderful! Tell me more.");
    }
  }

  async _proactiveEmotionComment() {
    if (this.isSpeaking || !this.currentEmotion || this.currentEmotion === EMOTIONS.NEUTRAL) return;
    
    const preset = VOICE_PRESETS[this.currentEmotion];
    if (preset && preset.greetings && preset.greetings.length > 0) {
      // Use a greeting as a proactive check-in
      const comment = pickRandom(preset.greetings);
      await this.speak(comment);
    }
  }

  /* ─── GESTURE MACRO HANDLER (Non-Verbal Accessibility) ─── */

  /**
   * Check if a gesture sequence matches any defined macro.
   * @param {string[]} sequence - Array of recent gesture names
   * @returns {{ id: string, response: string } | null}
   */
  checkGestureMacro(sequence) {
    if (!sequence || sequence.length === 0) return null;

    for (const macro of GESTURE_MACROS) {
      if (sequence.length >= macro.sequence.length) {
        const tail = sequence.slice(-macro.sequence.length);
        const match = tail.every((g, i) => g === macro.sequence[i]);
        if (match) return macro;
      }
    }
    return null;
  }

  /**
   * Execute a gesture macro: speak the response and emit event.
   */
  async handleGestureMacro(macroId) {
    const macro = GESTURE_MACROS.find(m => m.id === macroId);
    if (!macro) return;
    await this.speak(macro.response);
    if (this.onGestureMacro) this.onGestureMacro(macro);
  }

  async startCheckin() {
    const preset = VOICE_PRESETS[this.currentEmotion] || VOICE_PRESETS[EMOTIONS.NEUTRAL];
    const greeting = pickRandom(preset.greetings);
    this.checkinIndex = 0;
    await this.speak(greeting);
  }

  async nextCheckinPrompt() {
    if (this.checkinIndex < CHECKIN_PROMPTS.length) {
      await this.speak(CHECKIN_PROMPTS[this.checkinIndex]);
      this.checkinIndex++;
    } else {
      await this.speak("Thank you for this check-in session. Remember, taking time for yourself is important. I'm always here whenever you need me.");
      this.checkinIndex = 0;
    }
  }

  async processTextInput(text) {
    if (text.trim().length === 0) return;
    this.conversationHistory.push({ role: 'user', text, timestamp: Date.now() });
    const response = this._generateResponse(text);
    await this.speak(response);
  }

  getHistory() { return [...this.conversationHistory]; }
  clearHistory() { this.conversationHistory = []; this.checkinIndex = 0; }

  stop() { if (this.synth) this.synth.cancel(); this.isSpeaking = false; }

  destroy() { this.stopListening(); this.stop(); this.conversationHistory = []; }
}
