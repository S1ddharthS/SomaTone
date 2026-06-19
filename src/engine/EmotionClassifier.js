import { EMOTIONS, EMOTION_PILLARS, DETECTION_CONFIG } from '../utils/constants.js';
import { ema, clamp } from '../utils/helpers.js';

/**
 * EmotionClassifier — Maps MediaPipe's 52 facial blendshape coefficients
 * to 24 granular sub-emotion states using weighted decision-boundary
 * algorithms fused with acoustic voice biomarkers.
 *
 * 6 Pillars × 24 Sub-Emotions:
 *   Happiness: Joy, Contentment, Pride, Relief, Enthusiasm, Love
 *   Sadness:   Grief, Disappointment, Loneliness, Despair
 *   Fear:      Anxiety, Nervousness, Horror
 *   Anger:     Frustration, Resentment, Rage
 *   Surprise:  Astonishment, Wonder, Amazement
 *   Disgust:   Revulsion, Contempt
 *   + Neutral, Tired (burnout override)
 */

function getScore(blendshapes, name) {
  if (!blendshapes || !Array.isArray(blendshapes)) return 0;
  const shape = blendshapes.find(b => b.categoryName === name);
  return shape ? shape.score : 0;
}

/**
 * Extract all relevant facial action unit channels from blendshapes.
 */
function extractActionUnits(blendshapes) {
  const g = (name) => getScore(blendshapes, name);

  return {
    smile:          (g('mouthSmileLeft') + g('mouthSmileRight')) / 2,
    frown:          (g('mouthFrownLeft') + g('mouthFrownRight')) / 2,
    cheekSquint:    (g('cheekSquintLeft') + g('cheekSquintRight')) / 2,
    eyeWide:        (g('eyeWideLeft') + g('eyeWideRight')) / 2,
    eyeSquint:      (g('eyeSquintLeft') + g('eyeSquintRight')) / 2,
    eyeBlink:       (g('eyeBlinkLeft') + g('eyeBlinkRight')) / 2,
    browUp:         (g('browInnerUp') + (g('browOuterUpLeft') + g('browOuterUpRight')) / 2) / 2,
    browDown:       (g('browDownLeft') + g('browDownRight')) / 2,
    browInnerUp:    g('browInnerUp'),
    noseSneer:      (g('noseSneerLeft') + g('noseSneerRight')) / 2,
    jawOpen:        g('jawOpen'),
    jawForward:     g('jawForward'),
    mouthPress:     (g('mouthPressLeft') + g('mouthPressRight')) / 2,
    mouthPucker:    g('mouthPucker'),
    lipCornerPull:  (g('mouthDimpleLeft') + g('mouthDimpleRight')) / 2,
    chinRaise:      g('jawForward'),
    smileLeft:      g('mouthSmileLeft'),
    smileRight:     g('mouthSmileRight'),
    mouthRollUpper: g('mouthRollUpper'),
    mouthRollLower: g('mouthRollLower'),
    mouthStretch:   (g('mouthStretchLeft') + g('mouthStretchRight')) / 2,
    mouthClose:     g('mouthClose'),
    lipsPucker:     g('mouthPucker'),
    lipsPress:      (g('mouthPressLeft') + g('mouthPressRight')) / 2,
    eyeLookDown:    (g('eyeLookDownLeft') + g('eyeLookDownRight')) / 2,
    eyeLookUp:      (g('eyeLookUpLeft') + g('eyeLookUpRight')) / 2,
    cheekPuff:      g('cheekPuff'),
  };
}

/**
 * Compute per-sub-emotion activation scores using weighted AU combinations.
 * Each sub-emotion has a characteristic facial signature.
 *
 * @param {Object} au - Action units
 * @param {Object|null} acousticMetrics - { energy, variance, jitter, anomaly }
 * @returns {Object} scores keyed by sub-emotion
 */
function computeSubEmotionScores(au, acousticMetrics) {
  const scores = {};

  /* ─── HAPPINESS PILLAR ─── */

  // Joy: big smile + cheek squint + brow up + jaw open (laughing)
  scores[EMOTIONS.JOY] =
    (au.smile * 0.45) + (au.cheekSquint * 0.25) + (au.browUp * 0.15) + (au.jawOpen * 0.15);

  // Contentment: soft smile + relaxed brow + no tension
  scores[EMOTIONS.CONTENTMENT] =
    (au.smile * 0.5) + (au.cheekSquint * 0.25) + ((1 - au.browDown) * 0.25 * au.smile);

  // Pride: chin forward + slight smile + brow down (confident)
  scores[EMOTIONS.PRIDE] =
    (au.jawForward * 0.3) + (au.smile * 0.3) + (au.browDown * 0.2) + (au.cheekSquint * 0.2);

  // Relief: exhale (jaw slight open) + smile + brow up
  scores[EMOTIONS.RELIEF] =
    (au.smile * 0.35) + (au.browUp * 0.25) + (au.jawOpen * 0.2) + ((1 - au.mouthPress) * 0.2);

  // Enthusiasm: wide eyes + big smile + brow up
  scores[EMOTIONS.ENTHUSIASM] =
    (au.smile * 0.35) + (au.eyeWide * 0.25) + (au.browUp * 0.2) + (au.cheekSquint * 0.2);

  // Love: soft squint + gentle smile + pucker hint
  scores[EMOTIONS.LOVE] =
    (au.smile * 0.3) + (au.eyeSquint * 0.25) + (au.cheekSquint * 0.2) + (au.lipsPucker * 0.25);

  /* ─── SADNESS PILLAR ─── */

  // Grief: inner brow up + frown + mouth press + eye squeeze
  scores[EMOTIONS.GRIEF] =
    (au.browInnerUp * 0.3) + (au.frown * 0.3) + (au.mouthPress * 0.2) + (au.eyeSquint * 0.2);

  // Disappointment: frown + slight brow down + lip corner pull
  scores[EMOTIONS.DISAPPOINTMENT] =
    (au.frown * 0.4) + (au.browDown * 0.2) + (au.lipCornerPull * 0.2) + (au.eyeLookDown * 0.2);

  // Loneliness: similar to grief but subtler + looking down
  scores[EMOTIONS.LONELINESS] =
    (au.frown * 0.25) + (au.browInnerUp * 0.2) + (au.eyeLookDown * 0.25) + (au.mouthPress * 0.15) + ((1 - au.smile) * 0.15);

  // Despair: deep frown + brow inner up + mouth stretch
  scores[EMOTIONS.DESPAIR] =
    (au.frown * 0.3) + (au.browInnerUp * 0.25) + (au.mouthStretch * 0.2) + (au.mouthPress * 0.15) + (au.eyeSquint * 0.1);

  /* ─── FEAR PILLAR ─── */

  // Anxiety: wide eyes + brow up + lip press (tense but moderate)
  scores[EMOTIONS.ANXIETY] =
    (au.eyeWide * 0.3) + (au.browUp * 0.25) + (au.mouthPress * 0.2) + (au.lipsPress * 0.15) + ((1 - au.smile) * 0.1);

  // Nervousness: similar to anxiety but with more blink + slight eye movement
  scores[EMOTIONS.NERVOUSNESS] =
    (au.eyeWide * 0.2) + (au.browUp * 0.2) + (au.eyeBlink * 0.2) + (au.lipsPress * 0.2) + (au.mouthPress * 0.2);

  // Horror: extreme eye wide + jaw drop + brow up
  scores[EMOTIONS.HORROR] =
    (au.eyeWide * 0.4) + (au.jawOpen * 0.25) + (au.browUp * 0.2) + (au.mouthStretch * 0.15);

  /* ─── ANGER PILLAR ─── */

  // Frustration: brow down + mouth press + nose sneer (moderate)
  scores[EMOTIONS.FRUSTRATION] =
    (au.browDown * 0.3) + (au.mouthPress * 0.25) + (au.noseSneer * 0.2) + (au.eyeSquint * 0.15) + (au.jawForward * 0.1);

  // Resentment: sustained squint + tight lips + subtle frown
  scores[EMOTIONS.RESENTMENT] =
    (au.eyeSquint * 0.3) + (au.mouthPress * 0.25) + (au.browDown * 0.2) + (au.frown * 0.15) + (au.noseSneer * 0.1);

  // Rage: extreme brow down + jaw clench + nose sneer + eye wide
  scores[EMOTIONS.RAGE] =
    (au.browDown * 0.3) + (au.noseSneer * 0.25) + (au.jawForward * 0.2) + (au.eyeWide * 0.15) + (au.mouthPress * 0.1);

  /* ─── SURPRISE PILLAR ─── */

  // Astonishment: extreme eye wide + jaw drop + brow up
  scores[EMOTIONS.ASTONISHMENT] =
    (au.eyeWide * 0.4) + (au.browUp * 0.3) + (au.jawOpen * 0.3);

  // Wonder: moderate eye wide + brow up + slight smile (positive surprise)
  scores[EMOTIONS.WONDER] =
    (au.eyeWide * 0.25) + (au.browUp * 0.25) + (au.smile * 0.25) + (au.jawOpen * 0.15) + (au.cheekSquint * 0.1);

  // Amazement: eye wide + jaw open + smile (delighted surprise)
  scores[EMOTIONS.AMAZEMENT] =
    (au.eyeWide * 0.3) + (au.jawOpen * 0.2) + (au.smile * 0.25) + (au.browUp * 0.25);

  /* ─── DISGUST PILLAR ─── */

  // Revulsion: nose sneer + upper lip roll + eye squint
  scores[EMOTIONS.REVULSION] =
    (au.noseSneer * 0.45) + (au.mouthRollUpper * 0.25) + (au.eyeSquint * 0.15) + (au.frown * 0.15);

  // Contempt: asymmetric smile + nose sneer hint
  scores[EMOTIONS.CONTEMPT] =
    (Math.abs(au.smileLeft - au.smileRight) * 0.5) + (au.noseSneer * 0.2) + (au.lipCornerPull * 0.3);

  /* ─── META ─── */

  // Tired: heavy blinks + squint + frown + chin raise
  scores[EMOTIONS.TIRED] =
    (au.eyeBlink * 0.35) + (au.eyeSquint * 0.25) + (au.frown * 0.15) + (au.chinRaise * 0.15) + (au.eyeLookDown * 0.1);

  /* ─── ACOUSTIC FUSION ─── */
  // Voice biomarkers shift the emotional landscape
  if (acousticMetrics) {
    const anomaly = acousticMetrics.anomaly || null;

    // Vocal tremor biases toward anxiety/nervousness
    if (anomaly === 'tremor') {
      scores[EMOTIONS.ANXIETY] += 0.15;
      scores[EMOTIONS.NERVOUSNESS] += 0.1;
      scores[EMOTIONS.FRUSTRATION] += 0.05;
    }

    // Flat prosody biases toward grief/despair/loneliness
    if (anomaly === 'flat') {
      scores[EMOTIONS.GRIEF] += 0.1;
      scores[EMOTIONS.DESPAIR] += 0.12;
      scores[EMOTIONS.LONELINESS] += 0.1;
      scores[EMOTIONS.TIRED] += 0.08;
    }

    // Low energy voice diminishes high-arousal states
    if (acousticMetrics.energy < 20) {
      scores[EMOTIONS.JOY] *= 0.7;
      scores[EMOTIONS.ENTHUSIASM] *= 0.6;
      scores[EMOTIONS.RAGE] *= 0.7;
    }
  }

  return scores;
}

/**
 * Select the dominant sub-emotion from weighted scores.
 * Applies gain and requires a minimum threshold to break from Neutral.
 */
function selectSubEmotion(scores) {
  const GAIN = 2.5;
  const THRESHOLD = 0.10; // Lowered from 0.18 for higher sensitivity

  let maxScore = 0;
  let maxEmotion = EMOTIONS.NEUTRAL;

  for (const [emotionKey, rawScore] of Object.entries(scores)) {
    const amplified = rawScore * GAIN;
    if (amplified > maxScore) {
      maxScore = amplified;
      maxEmotion = emotionKey;
    }
  }

  if (maxScore < THRESHOLD) return EMOTIONS.NEUTRAL;
  return maxEmotion;
}

/**
 * Compute Valence (-1 to +1) and Arousal (0 to 1) from action units.
 */
function computeValenceArousal(au) {
  const positiveValence = (au.smile * 0.7) + (au.cheekSquint * 0.3);
  const negativeValence = (au.frown * 0.4) + (au.browDown * 0.3) + (au.noseSneer * 0.3);
  const valence = clamp((positiveValence - negativeValence) * 2.5, -1, 1);

  const activation = (au.eyeWide * 0.35) + (au.browUp * 0.25) + (au.jawOpen * 0.25) + (au.smile * 0.15);
  const tension = (au.browDown * 0.4) + (au.mouthPress * 0.35) + (au.noseSneer * 0.25);
  const arousal = clamp(Math.max(activation, tension) * 2.5, 0, 1);

  return { valence, arousal };
}

/**
 * Compute a burnout score (0-1) combining facial and acoustic indicators.
 */
function computeBurnoutScore(au, acousticMetrics) {
  const facialFatigue =
    (au.eyeBlink * 0.3) + (au.eyeSquint * 0.25) + (au.frown * 0.2) +
    ((1 - au.smile) * 0.15) + (au.mouthPress * 0.1);

  let acousticFlatness = 0;
  // Only factor in acoustic flatness if the user is actually speaking (energy > 5)
  if (acousticMetrics && acousticMetrics.energy > 5) {
    const normalizedEnergy = clamp(acousticMetrics.energy / 80, 0, 1);
    const normalizedVariance = clamp(acousticMetrics.variance / 500, 0, 1);
    acousticFlatness = (1 - normalizedEnergy) * 0.5 + (1 - normalizedVariance) * 0.5;
    
    // Blend face and voice when speaking
    return clamp((facialFatigue * 0.6 + acousticFlatness * 0.4), 0, 1);
  }

  // If silent, burnout is purely facial
  return clamp(facialFatigue, 0, 1);
}

export class EmotionClassifier {
  constructor() {
    this.smoothedValence = 0;
    this.smoothedArousal = 0;
    this.smoothedBurnout = 0;
    this.alpha = DETECTION_CONFIG.SMOOTHING_ALPHA;
    this.lastSubEmotion = EMOTIONS.NEUTRAL;
    this.emotionStability = 0;
    this.stableSubEmotion = EMOTIONS.NEUTRAL;
    this.stabilityThreshold = 5;
  }

  /**
   * @param {Array} blendshapes - MediaPipe blendshape array
   * @param {Object} [acousticMetrics] - { energy, variance, jitter, anomaly }
   * @returns {{
   *   emotion: string,       // pillar key
   *   subEmotion: string,    // granular sub-emotion key
   *   confidence: number,
   *   valence: number,
   *   arousal: number,
   *   burnoutScore: number,
   *   rawScores: Object,     // all 24 sub-emotion scores
   * }}
   */
  classify(blendshapes, acousticMetrics) {
    if (!blendshapes || blendshapes.length === 0) {
      const pillar = EMOTION_PILLARS[this.stableSubEmotion] || 'neutral';
      return {
        emotion: pillar,
        subEmotion: this.stableSubEmotion,
        confidence: 0,
        valence: this.smoothedValence,
        arousal: this.smoothedArousal,
        burnoutScore: this.smoothedBurnout,
        rawScores: {},
      };
    }

    const au = extractActionUnits(blendshapes);
    const scores = computeSubEmotionScores(au, acousticMetrics);
    const subEmotion = selectSubEmotion(scores);

    const { valence, arousal } = computeValenceArousal(au);
    const burnout = computeBurnoutScore(au, acousticMetrics);

    this.smoothedValence = ema(this.smoothedValence, valence, this.alpha);
    this.smoothedArousal = ema(this.smoothedArousal, arousal, this.alpha);
    this.smoothedBurnout = ema(this.smoothedBurnout, burnout, this.alpha);

    // Confidence = distance from neutral center
    const intensity = Math.sqrt(this.smoothedValence ** 2 + this.smoothedArousal ** 2);
    const confidence = clamp(intensity, 0, 1);

    // Stability filter — only commit sub-emotion after N consecutive frames
    if (subEmotion === this.lastSubEmotion) {
      this.emotionStability++;
    } else {
      this.emotionStability = 0;
      this.lastSubEmotion = subEmotion;
    }

    if (this.emotionStability >= this.stabilityThreshold) {
      this.stableSubEmotion = subEmotion;
    }

    // Override: if burnout is extremely high, force TIRED regardless of face
    if (this.smoothedBurnout >= DETECTION_CONFIG.BURNOUT_THRESHOLD && this.smoothedArousal < 0.3) {
      this.stableSubEmotion = EMOTIONS.TIRED;
    }

    const pillar = EMOTION_PILLARS[this.stableSubEmotion] || 'neutral';

    return {
      emotion: pillar,
      subEmotion: this.stableSubEmotion,
      confidence,
      valence: this.smoothedValence,
      arousal: this.smoothedArousal,
      burnoutScore: this.smoothedBurnout,
      rawScores: scores,
    };
  }

  reset() {
    this.smoothedValence = 0;
    this.smoothedArousal = 0;
    this.smoothedBurnout = 0;
    this.lastSubEmotion = EMOTIONS.NEUTRAL;
    this.emotionStability = 0;
    this.stableSubEmotion = EMOTIONS.NEUTRAL;
  }
}
