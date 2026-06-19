/* ═══════════════════════════════════════════════════════════════════
   SomaTone v2 — 24 Sub-Emotion Hierarchy
   6 Pillars × 24 Granular States + Neutral & Tired (burnout override)
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Sub-Emotion Keys ─── */
export const EMOTIONS = {
  // Happiness Pillar
  JOY:          'joy',
  CONTENTMENT:  'contentment',
  PRIDE:        'pride',
  RELIEF:       'relief',
  ENTHUSIASM:   'enthusiasm',
  LOVE:         'love',
  // Sadness Pillar
  GRIEF:        'grief',
  DISAPPOINTMENT: 'disappointment',
  LONELINESS:   'loneliness',
  DESPAIR:      'despair',
  // Fear Pillar
  ANXIETY:      'anxiety',
  NERVOUSNESS:  'nervousness',
  HORROR:       'horror',
  // Anger Pillar
  FRUSTRATION:  'frustration',
  RESENTMENT:   'resentment',
  RAGE:         'rage',
  // Surprise Pillar
  ASTONISHMENT: 'astonishment',
  WONDER:       'wonder',
  AMAZEMENT:    'amazement',
  // Disgust Pillar
  REVULSION:    'revulsion',
  CONTEMPT:     'contempt',
  // Meta
  NEUTRAL:      'neutral',
  TIRED:        'tired',
};

/* ─── Pillar Enum ─── */
export const PILLARS = {
  HAPPINESS: 'happiness',
  SADNESS:   'sadness',
  FEAR:      'fear',
  ANGER:     'anger',
  SURPRISE:  'surprise',
  DISGUST:   'disgust',
  NEUTRAL:   'neutral',
  TIRED:     'tired',
};

/* ─── Sub-Emotion → Pillar Map ─── */
export const EMOTION_PILLARS = {
  [EMOTIONS.JOY]:            PILLARS.HAPPINESS,
  [EMOTIONS.CONTENTMENT]:    PILLARS.HAPPINESS,
  [EMOTIONS.PRIDE]:          PILLARS.HAPPINESS,
  [EMOTIONS.RELIEF]:         PILLARS.HAPPINESS,
  [EMOTIONS.ENTHUSIASM]:     PILLARS.HAPPINESS,
  [EMOTIONS.LOVE]:           PILLARS.HAPPINESS,
  [EMOTIONS.GRIEF]:          PILLARS.SADNESS,
  [EMOTIONS.DISAPPOINTMENT]: PILLARS.SADNESS,
  [EMOTIONS.LONELINESS]:     PILLARS.SADNESS,
  [EMOTIONS.DESPAIR]:        PILLARS.SADNESS,
  [EMOTIONS.ANXIETY]:        PILLARS.FEAR,
  [EMOTIONS.NERVOUSNESS]:    PILLARS.FEAR,
  [EMOTIONS.HORROR]:         PILLARS.FEAR,
  [EMOTIONS.FRUSTRATION]:    PILLARS.ANGER,
  [EMOTIONS.RESENTMENT]:     PILLARS.ANGER,
  [EMOTIONS.RAGE]:           PILLARS.ANGER,
  [EMOTIONS.ASTONISHMENT]:   PILLARS.SURPRISE,
  [EMOTIONS.WONDER]:         PILLARS.SURPRISE,
  [EMOTIONS.AMAZEMENT]:      PILLARS.SURPRISE,
  [EMOTIONS.REVULSION]:      PILLARS.DISGUST,
  [EMOTIONS.CONTEMPT]:       PILLARS.DISGUST,
  [EMOTIONS.NEUTRAL]:        PILLARS.NEUTRAL,
  [EMOTIONS.TIRED]:          PILLARS.TIRED,
};

/* ─── Sub-Emotion Display Labels ─── */
export const EMOTION_LABELS = {
  [EMOTIONS.JOY]:            'Joy',
  [EMOTIONS.CONTENTMENT]:    'Contentment',
  [EMOTIONS.PRIDE]:          'Pride',
  [EMOTIONS.RELIEF]:         'Relief',
  [EMOTIONS.ENTHUSIASM]:     'Enthusiasm',
  [EMOTIONS.LOVE]:           'Love',
  [EMOTIONS.GRIEF]:          'Grief',
  [EMOTIONS.DISAPPOINTMENT]: 'Disappointment',
  [EMOTIONS.LONELINESS]:     'Loneliness',
  [EMOTIONS.DESPAIR]:        'Despair',
  [EMOTIONS.ANXIETY]:        'Anxiety',
  [EMOTIONS.NERVOUSNESS]:    'Nervousness',
  [EMOTIONS.HORROR]:         'Horror',
  [EMOTIONS.FRUSTRATION]:    'Frustration',
  [EMOTIONS.RESENTMENT]:     'Resentment',
  [EMOTIONS.RAGE]:           'Rage',
  [EMOTIONS.ASTONISHMENT]:   'Astonishment',
  [EMOTIONS.WONDER]:         'Wonder',
  [EMOTIONS.AMAZEMENT]:      'Amazement',
  [EMOTIONS.REVULSION]:      'Revulsion',
  [EMOTIONS.CONTEMPT]:       'Contempt',
  [EMOTIONS.NEUTRAL]:        'Neutral',
  [EMOTIONS.TIRED]:          'Tired / Burned Out',
};

/* ─── Pillar Display Labels ─── */
export const PILLAR_LABELS = {
  [PILLARS.HAPPINESS]: 'Happiness',
  [PILLARS.SADNESS]:   'Sadness',
  [PILLARS.FEAR]:      'Fear',
  [PILLARS.ANGER]:     'Anger',
  [PILLARS.SURPRISE]:  'Surprise',
  [PILLARS.DISGUST]:   'Disgust',
  [PILLARS.NEUTRAL]:   'Neutral',
  [PILLARS.TIRED]:     'Exhaustion',
};

/* ─── Emotion → Color Mapping (within pillar hue families) ─── */
export const EMOTION_COLORS = {
  // Happiness family — warm golds/ambers
  [EMOTIONS.JOY]:            { primary: '#FFD700', dim: '#CCAC00', glow: 'rgba(255, 215, 0, 0.2)' },
  [EMOTIONS.CONTENTMENT]:    { primary: '#E8C547', dim: '#B89D38', glow: 'rgba(232, 197, 71, 0.18)' },
  [EMOTIONS.PRIDE]:          { primary: '#F5A623', dim: '#C48418', glow: 'rgba(245, 166, 35, 0.2)' },
  [EMOTIONS.RELIEF]:         { primary: '#A8D8A0', dim: '#7EAD76', glow: 'rgba(168, 216, 160, 0.18)' },
  [EMOTIONS.ENTHUSIASM]:     { primary: '#FF9A3C', dim: '#CC7B30', glow: 'rgba(255, 154, 60, 0.2)' },
  [EMOTIONS.LOVE]:           { primary: '#FF6B8A', dim: '#CC5570', glow: 'rgba(255, 107, 138, 0.2)' },
  // Sadness family — cool blues/steels
  [EMOTIONS.GRIEF]:          { primary: '#4A7FB5', dim: '#3A6590', glow: 'rgba(74, 127, 181, 0.2)' },
  [EMOTIONS.DISAPPOINTMENT]: { primary: '#6A9FCA', dim: '#5580A2', glow: 'rgba(106, 159, 202, 0.18)' },
  [EMOTIONS.LONELINESS]:     { primary: '#5D7A99', dim: '#49617A', glow: 'rgba(93, 122, 153, 0.18)' },
  [EMOTIONS.DESPAIR]:        { primary: '#3A5A7C', dim: '#2E4863', glow: 'rgba(58, 90, 124, 0.2)' },
  // Fear family — purples/magentas
  [EMOTIONS.ANXIETY]:        { primary: '#C084D6', dim: '#9A69AB', glow: 'rgba(192, 132, 214, 0.2)' },
  [EMOTIONS.NERVOUSNESS]:    { primary: '#D4A0E8', dim: '#AA80BA', glow: 'rgba(212, 160, 232, 0.18)' },
  [EMOTIONS.HORROR]:         { primary: '#8B3A8B', dim: '#6E2E6E', glow: 'rgba(139, 58, 139, 0.2)' },
  // Anger family — reds/crimsons
  [EMOTIONS.FRUSTRATION]:    { primary: '#E05C5C', dim: '#B34A4A', glow: 'rgba(224, 92, 92, 0.2)' },
  [EMOTIONS.RESENTMENT]:     { primary: '#C04040', dim: '#993333', glow: 'rgba(192, 64, 64, 0.18)' },
  [EMOTIONS.RAGE]:           { primary: '#DC143C', dim: '#B01030', glow: 'rgba(220, 20, 60, 0.2)' },
  // Surprise family — oranges/corals
  [EMOTIONS.ASTONISHMENT]:   { primary: '#FF8C00', dim: '#CC7000', glow: 'rgba(255, 140, 0, 0.2)' },
  [EMOTIONS.WONDER]:         { primary: '#FFB347', dim: '#CC8F39', glow: 'rgba(255, 179, 71, 0.18)' },
  [EMOTIONS.AMAZEMENT]:      { primary: '#FF6F61', dim: '#CC594E', glow: 'rgba(255, 111, 97, 0.2)' },
  // Disgust family — olives/teals
  [EMOTIONS.REVULSION]:      { primary: '#8B8000', dim: '#6B6200', glow: 'rgba(139, 128, 0, 0.2)' },
  [EMOTIONS.CONTEMPT]:       { primary: '#6B7B3A', dim: '#556230', glow: 'rgba(107, 123, 58, 0.18)' },
  // Meta
  [EMOTIONS.NEUTRAL]:        { primary: '#7C9A82', dim: '#5A7360', glow: 'rgba(124, 154, 130, 0.15)' },
  [EMOTIONS.TIRED]:          { primary: '#708090', dim: '#5A6673', glow: 'rgba(112, 128, 144, 0.2)' },
};

/* ─── Voice Presets per Sub-Emotion ─── */
export const VOICE_PRESETS = {
  [EMOTIONS.JOY]:            { pitch: 1.2,  rate: 1.1,  volume: 0.95, greetings: ["Your energy is absolutely radiant today!", "I can feel your joy!"], responses: ["That's incredible!", "I love this energy!"] },
  [EMOTIONS.CONTENTMENT]:    { pitch: 1.05, rate: 0.95, volume: 0.8,  greetings: ["You look so peaceful right now.", "There's a beautiful calm about you."], responses: ["That sounds very grounding.", "I'm glad you're finding peace."] },
  [EMOTIONS.PRIDE]:          { pitch: 1.1,  rate: 1.0,  volume: 0.9,  greetings: ["I can see that sense of accomplishment.", "You look proud."], responses: ["You should be proud of that.", "That's a real achievement."] },
  [EMOTIONS.RELIEF]:         { pitch: 1.0,  rate: 0.95, volume: 0.85, greetings: ["You seem like a weight has been lifted.", "That looks like relief."], responses: ["It's so good to let that go.", "Breathe that relief in."] },
  [EMOTIONS.ENTHUSIASM]:     { pitch: 1.2,  rate: 1.15, volume: 0.95, greetings: ["Your enthusiasm is contagious!", "I love that excitement!"], responses: ["That's amazing!", "Keep that fire going!"] },
  [EMOTIONS.LOVE]:           { pitch: 1.1,  rate: 0.9,  volume: 0.85, greetings: ["I see warmth radiating from you.", "That's a beautiful expression."], responses: ["Love is the most powerful emotion.", "That warmth is beautiful."] },
  [EMOTIONS.GRIEF]:          { pitch: 0.8,  rate: 0.8,  volume: 0.65, greetings: ["I can see the weight you're carrying.", "I'm here with you through this."], responses: ["Grief is love with nowhere to go. I'm here.", "Take all the time you need."] },
  [EMOTIONS.DISAPPOINTMENT]: { pitch: 0.9,  rate: 0.85, volume: 0.7,  greetings: ["Something didn't go as planned?", "I sense some disappointment."], responses: ["It's okay to feel let down.", "Not every door is your door."] },
  [EMOTIONS.LONELINESS]:     { pitch: 0.85, rate: 0.85, volume: 0.7,  greetings: ["I sense you might be feeling alone.", "I'm right here with you."], responses: ["You are not as alone as it feels.", "Connection starts with being seen. I see you."] },
  [EMOTIONS.DESPAIR]:        { pitch: 0.75, rate: 0.75, volume: 0.6,  greetings: ["I can feel the heaviness. I'm not going anywhere.", "I'm here. You don't have to carry this alone."], responses: ["Even the darkest night ends with dawn.", "One breath at a time. Just one."] },
  [EMOTIONS.ANXIETY]:        { pitch: 0.95, rate: 0.85, volume: 0.75, greetings: ["I sense some unease. Let's slow down together.", "It's okay to feel uncertain."], responses: ["You are safe in this moment. Let's ground ourselves.", "Focus on what's right in front of you."] },
  [EMOTIONS.NERVOUSNESS]:    { pitch: 1.0,  rate: 0.9,  volume: 0.75, greetings: ["Feeling a bit on edge?", "Those butterflies are trying to tell you something."], responses: ["Nervousness means you care. That's brave.", "Let's breathe through this together."] },
  [EMOTIONS.HORROR]:         { pitch: 0.85, rate: 0.8,  volume: 0.7,  greetings: ["I see real fear in your expression.", "You look shaken. I'm here."], responses: ["You are safe here. Focus on my voice.", "Let's ground you. Feel your feet on the floor."] },
  [EMOTIONS.FRUSTRATION]:    { pitch: 0.95, rate: 0.95, volume: 0.8,  greetings: ["I see that frustration building.", "Something is testing your patience."], responses: ["Let's channel that energy into something.", "Try releasing your jaw and dropping your shoulders."] },
  [EMOTIONS.RESENTMENT]:     { pitch: 0.9,  rate: 0.9,  volume: 0.75, greetings: ["I sense something has been weighing on you.", "That looks like a slow-burning tension."], responses: ["Resentment often protects a deeper hurt.", "What would it feel like to set that down?"] },
  [EMOTIONS.RAGE]:           { pitch: 0.85, rate: 0.9,  volume: 0.8,  greetings: ["I see intense energy. You are safe here.", "Your feelings are powerful and valid."], responses: ["Let's ground that intensity. Slow breath in.", "Feel the surge, then let it move through you."] },
  [EMOTIONS.ASTONISHMENT]:   { pitch: 1.15, rate: 1.1,  volume: 0.9,  greetings: ["Something has really caught you off guard!", "Wow, that got your attention!"], responses: ["That sounds truly unexpected!", "Life can be surprising."] },
  [EMOTIONS.WONDER]:         { pitch: 1.1,  rate: 1.0,  volume: 0.85, greetings: ["I see wonder in your eyes.", "Something has sparked your curiosity."], responses: ["That sense of wonder is precious.", "Stay curious."] },
  [EMOTIONS.AMAZEMENT]:      { pitch: 1.15, rate: 1.05, volume: 0.9,  greetings: ["You look truly amazed!", "Something incredible just happened?"], responses: ["Moments like these are gifts.", "Let that awe wash over you."] },
  [EMOTIONS.REVULSION]:      { pitch: 0.9,  rate: 0.9,  volume: 0.75, greetings: ["I see a strong reaction there.", "Something feels deeply wrong."], responses: ["It's natural to reject what feels wrong.", "Let's step back from that."] },
  [EMOTIONS.CONTEMPT]:       { pitch: 0.95, rate: 0.95, volume: 0.75, greetings: ["I see some resistance in your expression.", "Something isn't sitting right."], responses: ["That judgment might be protecting something.", "What's underneath that feeling?"] },
  [EMOTIONS.NEUTRAL]:        { pitch: 1.0,  rate: 1.0,  volume: 0.8,  greetings: ["Welcome to SomaTone. How are you feeling?", "Hey there. I'm here whenever you'd like to check in."], responses: ["Thank you for sharing.", "I appreciate you checking in."] },
  [EMOTIONS.TIRED]:          { pitch: 0.8,  rate: 0.8,  volume: 0.65, greetings: ["You seem exhausted. It's okay to rest.", "I can see you've given a lot today."], responses: ["You don't have to do anything right now.", "Just let the sounds carry you."] },
};

/* ─── Audio Presets per Sub-Emotion ─── */
export const AUDIO_PRESETS = {
  // Happiness
  [EMOTIONS.JOY]:            { chords: [['C5','E5','G5','B5'], ['F5','A5','C6','E6']], oscillator: 'triangle', attack: 0.5, release: 1.5, filterFreq: 4000, reverbDecay: 2, reverbWet: 0.2, delayTime: '16n', delayFeedback: 0.1, lfoFreq: 0.8, label: 'Crystal Heights' },
  [EMOTIONS.CONTENTMENT]:    { chords: [['E4','G#4','B4','D#5'], ['A3','C#4','E4','G#4']], oscillator: 'sine', attack: 2.0, release: 4.0, filterFreq: 2000, reverbDecay: 5, reverbWet: 0.4, delayTime: '4n', delayFeedback: 0.3, lfoFreq: 0.2, label: 'Clear Skies' },
  [EMOTIONS.PRIDE]:          { chords: [['D4','F#4','A4','C#5'], ['G4','B4','D5','F#5']], oscillator: 'triangle', attack: 1.0, release: 2.5, filterFreq: 3000, reverbDecay: 3, reverbWet: 0.3, delayTime: '8n', delayFeedback: 0.15, lfoFreq: 0.5, label: 'Rising Sun' },
  [EMOTIONS.RELIEF]:         { chords: [['C4','E4','G4','B4'], ['F3','A3','C4','E4']], oscillator: 'sine', attack: 2.5, release: 4.5, filterFreq: 1800, reverbDecay: 6, reverbWet: 0.5, delayTime: '4n', delayFeedback: 0.25, lfoFreq: 0.15, label: 'Weight Lifted' },
  [EMOTIONS.ENTHUSIASM]:     { chords: [['G4','B4','D5','F#5'], ['C5','E5','G5','B5']], oscillator: 'square', attack: 0.3, release: 1.0, filterFreq: 4500, reverbDecay: 2, reverbWet: 0.15, delayTime: '16n', delayFeedback: 0.1, lfoFreq: 1.0, label: 'Electric Spark' },
  [EMOTIONS.LOVE]:           { chords: [['Ab3','C4','Eb4','G4'], ['Db3','F3','Ab3','C4']], oscillator: 'sine', attack: 2.0, release: 5.0, filterFreq: 1500, reverbDecay: 7, reverbWet: 0.6, delayTime: '4n', delayFeedback: 0.3, lfoFreq: 0.1, label: 'Tender Glow' },
  // Sadness
  [EMOTIONS.GRIEF]:          { chords: [['C3','Eb3','G3','Bb3'], ['Ab2','C3','Eb3','G3']], oscillator: 'sine', attack: 3.5, release: 6.0, filterFreq: 600, reverbDecay: 10, reverbWet: 0.8, delayTime: '4n', delayFeedback: 0.4, lfoFreq: 0.05, label: 'Deep Waters' },
  [EMOTIONS.DISAPPOINTMENT]: { chords: [['D3','F3','A3','C4'], ['G2','Bb2','D3','F3']], oscillator: 'sine', attack: 2.5, release: 4.5, filterFreq: 900, reverbDecay: 6, reverbWet: 0.6, delayTime: '4n', delayFeedback: 0.3, lfoFreq: 0.1, label: 'Fading Light' },
  [EMOTIONS.LONELINESS]:     { chords: [['E3','G3','B3','D4'], ['A2','C3','E3','G3']], oscillator: 'sine', attack: 3.0, release: 5.5, filterFreq: 700, reverbDecay: 9, reverbWet: 0.75, delayTime: '2n', delayFeedback: 0.35, lfoFreq: 0.06, label: 'Empty Room' },
  [EMOTIONS.DESPAIR]:        { chords: [['D2','F2','A2','C3'], ['G1','Bb1','D2','F2']], oscillator: 'sine', attack: 4.0, release: 7.0, filterFreq: 400, reverbDecay: 12, reverbWet: 0.85, delayTime: '2n', delayFeedback: 0.45, lfoFreq: 0.03, label: 'Abyssal Drone' },
  // Fear
  [EMOTIONS.ANXIETY]:        { chords: [['B3','D4','F#4','A4'], ['E3','G3','B3','D4']], oscillator: 'sine', attack: 2.0, release: 4.0, filterFreq: 800, reverbDecay: 7, reverbWet: 0.6, delayTime: '8n', delayFeedback: 0.3, lfoFreq: 0.25, label: 'Nervous Pulse' },
  [EMOTIONS.NERVOUSNESS]:    { chords: [['A3','C4','E4','G4'], ['D3','F3','A3','C4']], oscillator: 'triangle', attack: 1.5, release: 3.0, filterFreq: 1200, reverbDecay: 5, reverbWet: 0.45, delayTime: '8n', delayFeedback: 0.2, lfoFreq: 0.35, label: 'Uneasy Shimmer' },
  [EMOTIONS.HORROR]:         { chords: [['E2','G2','Bb2','Db3'], ['A1','C2','E2','G2']], oscillator: 'sawtooth', attack: 3.5, release: 6.0, filterFreq: 350, reverbDecay: 12, reverbWet: 0.9, delayTime: '2n', delayFeedback: 0.5, lfoFreq: 0.04, label: 'Dark Abyss' },
  // Anger
  [EMOTIONS.FRUSTRATION]:    { chords: [['A2','C3','E3','G3'], ['D2','F2','A2','C3']], oscillator: 'sawtooth', attack: 1.5, release: 3.5, filterFreq: 600, reverbDecay: 5, reverbWet: 0.4, delayTime: '8n', delayFeedback: 0.2, lfoFreq: 0.15, label: 'Smoldering Coals' },
  [EMOTIONS.RESENTMENT]:     { chords: [['E2','G2','B2','D3'], ['A1','C2','E2','G2']], oscillator: 'sawtooth', attack: 2.5, release: 5.0, filterFreq: 450, reverbDecay: 8, reverbWet: 0.55, delayTime: '4n', delayFeedback: 0.3, lfoFreq: 0.08, label: 'Buried Fire' },
  [EMOTIONS.RAGE]:           { chords: [['A1','E2','A2'], ['D2','A2','D3']], oscillator: 'sawtooth', attack: 2.5, release: 6.0, filterFreq: 400, reverbDecay: 10, reverbWet: 0.6, delayTime: '2n', delayFeedback: 0.25, lfoFreq: 0.05, label: 'Grounding Bass' },
  // Surprise
  [EMOTIONS.ASTONISHMENT]:   { chords: [['D4','F#4','A4','C#5'], ['G4','B4','D5','F#5']], oscillator: 'square', attack: 0.8, release: 2.0, filterFreq: 3500, reverbDecay: 3, reverbWet: 0.3, delayTime: '8n', delayFeedback: 0.2, lfoFreq: 0.5, label: 'Dynamic Pulse' },
  [EMOTIONS.WONDER]:         { chords: [['C4','E4','G4','B4'], ['F4','A4','C5','E5']], oscillator: 'triangle', attack: 1.5, release: 3.0, filterFreq: 2800, reverbDecay: 5, reverbWet: 0.4, delayTime: '8n', delayFeedback: 0.25, lfoFreq: 0.3, label: 'Starlit Path' },
  [EMOTIONS.AMAZEMENT]:      { chords: [['E4','G#4','B4','D#5'], ['A4','C#5','E5','G#5']], oscillator: 'square', attack: 0.5, release: 1.5, filterFreq: 4200, reverbDecay: 3, reverbWet: 0.25, delayTime: '16n', delayFeedback: 0.15, lfoFreq: 0.6, label: 'Cosmic Flash' },
  // Disgust
  [EMOTIONS.REVULSION]:      { chords: [['G2','Bb2','D3','F#3'], ['C3','Eb3','G3','B3']], oscillator: 'square', attack: 2.0, release: 4.0, filterFreq: 1000, reverbDecay: 5, reverbWet: 0.5, delayTime: '4n', delayFeedback: 0.25, lfoFreq: 0.15, label: 'Shadowed Path' },
  [EMOTIONS.CONTEMPT]:       { chords: [['D3','F3','Ab3','C4'], ['G2','Bb2','D3','F3']], oscillator: 'triangle', attack: 1.5, release: 3.5, filterFreq: 1200, reverbDecay: 4, reverbWet: 0.35, delayTime: '8n', delayFeedback: 0.2, lfoFreq: 0.2, label: 'Cold Edge' },
  // Meta
  [EMOTIONS.NEUTRAL]:        { chords: [['E3','G#3','B3','D#4'], ['A3','C#4','E4','G#4']], oscillator: 'sine', attack: 2.0, release: 4.0, filterFreq: 1500, reverbDecay: 5, reverbWet: 0.5, delayTime: '4n', delayFeedback: 0.2, lfoFreq: 0.12, label: 'Still Waters' },
  [EMOTIONS.TIRED]:          { chords: [['D2','F2','A2','C3'], ['G1','Bb1','D2','F2']], oscillator: 'sine', attack: 4.0, release: 6.0, filterFreq: 500, reverbDecay: 10, reverbWet: 0.8, delayTime: '2n', delayFeedback: 0.4, lfoFreq: 0.05, label: 'Echoing Void' },
};

/* ─── Burnout Alpha/Theta Entrainment ─── */
export const BURNOUT_PRESETS = {
  alpha: { binauralBaseHz: 200, binauralBeatHz: 10, oscillator: 'sine', filterFreq: 300, reverbWet: 0.9, volume: -18, label: 'Alpha Wave — 10 Hz' },
  theta: { binauralBaseHz: 150, binauralBeatHz: 6, oscillator: 'sine', filterFreq: 250, reverbWet: 0.95, volume: -20, label: 'Theta Wave — 6 Hz' },
};

/* ─── Pentatonic Scales per Sub-Emotion ─── */
export const PENTATONIC_SCALES = {
  // Happiness
  [EMOTIONS.JOY]:            ['C4','D4','E4','G4','A4','C5','D5','E5'],
  [EMOTIONS.CONTENTMENT]:    ['E4','F#4','G#4','B4','C#5','E5','F#5','G#5'],
  [EMOTIONS.PRIDE]:          ['D4','E4','F#4','A4','B4','D5','E5','F#5'],
  [EMOTIONS.RELIEF]:         ['C4','D4','E4','G4','A4','C5','D5','E5'],
  [EMOTIONS.ENTHUSIASM]:     ['G4','A4','B4','D5','E5','G5','A5','B5'],
  [EMOTIONS.LOVE]:           ['Ab3','Bb3','C4','Eb4','F4','Ab4','Bb4','C5'],
  // Sadness
  [EMOTIONS.GRIEF]:          ['A3','C4','D4','E4','G4','A4','C5','D5'],
  [EMOTIONS.DISAPPOINTMENT]: ['D3','F3','G3','A3','C4','D4','F4','G4'],
  [EMOTIONS.LONELINESS]:     ['E3','G3','A3','B3','D4','E4','G4','A4'],
  [EMOTIONS.DESPAIR]:        ['C3','D3','E3','G3','A3','C4','D4','E4'],
  // Fear
  [EMOTIONS.ANXIETY]:        ['B3','D4','E4','F#4','A4','B4','D5','E5'],
  [EMOTIONS.NERVOUSNESS]:    ['A3','C4','D4','E4','G4','A4','C5','D5'],
  [EMOTIONS.HORROR]:         ['E2','G2','A2','B2','D3','E3','G3','A3'],
  // Anger
  [EMOTIONS.FRUSTRATION]:    ['A3','C4','D4','E4','G4','A4','C5','D5'],
  [EMOTIONS.RESENTMENT]:     ['E3','G3','A3','B3','D4','E4','G4','A4'],
  [EMOTIONS.RAGE]:           ['E3','G3','A3','B3','D4','E4','G4','A4'],
  // Surprise
  [EMOTIONS.ASTONISHMENT]:   ['G4','A4','B4','D5','E5','G5','A5','B5'],
  [EMOTIONS.WONDER]:         ['C4','D4','E4','G4','A4','C5','D5','E5'],
  [EMOTIONS.AMAZEMENT]:      ['E4','F#4','G#4','B4','C#5','E5','F#5','G#5'],
  // Disgust
  [EMOTIONS.REVULSION]:      ['D3','F3','G3','A3','C4','D4','F4','G4'],
  [EMOTIONS.CONTEMPT]:       ['D3','F3','G3','Bb3','C4','D4','F4','G4'],
  // Meta
  [EMOTIONS.NEUTRAL]:        ['C4','D4','E4','G4','A4','C5','D5','E5'],
  [EMOTIONS.TIRED]:          ['C3','D3','E3','G3','A3','C4','D4','E4'],
};

/* ─── Earcon Tones for Blind Accessibility ─── */
export const EARCON_TONES = {
  topLeft:     { note: 'C5', pan: -0.8, label: 'Bright Filter' },
  topCenter:   { note: 'E5', pan: 0, label: 'Center High' },
  topRight:    { note: 'G5', pan: 0.8, label: 'Dry Bright' },
  midLeft:     { note: 'C4', pan: -0.8, label: 'Mid Reverb' },
  midCenter:   { note: 'E4', pan: 0, label: 'Center' },
  midRight:    { note: 'G4', pan: 0.8, label: 'Mid Dry' },
  bottomLeft:  { note: 'C3', pan: -0.8, label: 'Dark Reverb' },
  bottomCenter:{ note: 'E3', pan: 0, label: 'Center Low' },
  bottomRight: { note: 'G3', pan: 0.8, label: 'Dark Dry' },
};

/* ─── Gesture Macros for Non-Verbal Accessibility ─── */
export const GESTURE_MACROS = [
  { id: 'calm_me', sequence: ['Open_Palm'], label: 'Calm Me Down', response: "Let's take a slow breath together. Inhale for four. Hold for four. Exhale for six. You're doing great." },
  { id: 'im_okay', sequence: ['Thumb_Up'], label: "I'm Doing Okay", response: "That's wonderful to hear. Your positive energy is shining through." },
  { id: 'need_space', sequence: ['Closed_Fist'], label: 'I Need Space', response: "I hear you. I'll just play the sounds quietly. Take all the time you need." },
  { id: 'feeling_down', sequence: ['Thumb_Down'], label: 'Feeling Down', response: "Thank you for telling me. You are not alone. I'm adjusting the soundscape to wrap around you gently." },
  { id: 'ground_me', sequence: ['Pointing_Up'], label: 'Ground Me', response: "Let's try the 5-4-3-2-1 technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste." },
  { id: 'end_session', sequence: ['Victory'], label: 'End Session', response: "Thank you for this session. Remember, showing up for yourself is an act of courage. See you next time." },
];

/* ─── Check-in Prompts ─── */
export const CHECKIN_PROMPTS = [
  "How has your day been so far?",
  "What's been on your mind lately?",
  "On a scale from one to ten, how would you rate your energy right now?",
  "Is there anything weighing on you that you'd like to release?",
  "What's one thing that brought you comfort recently?",
  "How does your body feel right now? Any tension or ease?",
  "What's something you're looking forward to?",
  "Take a moment to notice your breathing. How does it feel?",
];

/* ─── MediaPipe Model URLs ─── */
export const MEDIAPIPE_MODELS = {
  FACE_LANDMARKER: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  GESTURE_RECOGNIZER: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
  WASM_PATH: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
};

/* ─── Detection Config ─── */
export const DETECTION_CONFIG = {
  FPS_TARGET: 15,
  SMOOTHING_ALPHA: 0.3,
  CONFIDENCE_THRESHOLD: 0.4,
  MOOD_LOG_INTERVAL_MS: 30000,
  BURNOUT_THRESHOLD: 0.7,
  GESTURE_MACRO_BUFFER_SIZE: 3,
};
