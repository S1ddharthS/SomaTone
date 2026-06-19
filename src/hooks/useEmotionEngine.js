import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { EmotionClassifier } from '../engine/EmotionClassifier.js';
import { MEDIAPIPE_MODELS, DETECTION_CONFIG, EMOTIONS } from '../utils/constants.js';

/**
 * useEmotionEngine — React hook that initializes MediaPipe FaceLandmarker,
 * runs real-time detection on a video element, and classifies emotions from
 * blendshape coefficients into 24 granular sub-emotion states.
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef - Ref to the video element
 * @param {Object} [acousticAnalyzer] - Optional AcousticAnalyzer instance for fusion
 * @returns {{
 *   emotion: string,       // pillar key
 *   subEmotion: string,    // granular sub-emotion key
 *   confidence: number,
 *   valence: number,
 *   arousal: number,
 *   burnoutScore: number,
 *   landmarks: Array|null,
 *   blendshapes: Array|null,
 *   isReady: boolean,
 *   error: string|null,
 *   rawScores: object,
 * }}
 */
export function useEmotionEngine(videoRef, acousticAnalyzer) {
  const [state, setState] = useState({
    emotion: 'neutral',
    subEmotion: EMOTIONS.NEUTRAL,
    confidence: 0,
    valence: 0,
    arousal: 0,
    burnoutScore: 0,
    landmarks: null,
    blendshapes: null,
    isReady: false,
    error: null,
    rawScores: {},
  });

  const faceLandmarkerRef = useRef(null);
  const classifierRef = useRef(new EmotionClassifier());
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameIntervalRef = useRef(1000 / DETECTION_CONFIG.FPS_TARGET);

  /**
   * Initialize the MediaPipe FaceLandmarker.
   */
  const initFaceLandmarker = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_MODELS.WASM_PATH);

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODELS.FACE_LANDMARKER,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
      });

      faceLandmarkerRef.current = faceLandmarker;
      setState(prev => ({ ...prev, isReady: true, error: null }));
    } catch (err) {
      console.error('FaceLandmarker init failed:', err);
      setState(prev => ({
        ...prev,
        isReady: false,
        error: `Failed to initialize face detection: ${err.message}`,
      }));
    }
  }, []);

  /**
   * Detection loop — runs at target FPS via requestAnimationFrame.
   */
  const detect = useCallback((timestamp) => {
    rafRef.current = requestAnimationFrame(detect);

    if (timestamp - lastTimeRef.current < frameIntervalRef.current) return;
    lastTimeRef.current = timestamp;

    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;

    if (!video || !faceLandmarker || video.readyState < 2) return;

    try {
      const results = faceLandmarker.detectForVideo(video, performance.now());

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes?.[0]?.categories || null;

        if (blendshapes) {
          // Get acoustic metrics for fusion (if analyzer is available)
          const acousticMetrics = acousticAnalyzer?.getMetrics?.() || null;

          const classified = classifierRef.current.classify(blendshapes, acousticMetrics);

          setState(prev => ({
            ...prev,
            emotion: classified.emotion,
            subEmotion: classified.subEmotion,
            confidence: classified.confidence,
            valence: classified.valence,
            arousal: classified.arousal,
            burnoutScore: classified.burnoutScore || 0,
            landmarks,
            blendshapes,
            rawScores: classified.rawScores,
          }));
        }
      }
    } catch (err) {
      /* Detection errors are transient — don't crash the loop */
    }
  }, [videoRef, acousticAnalyzer]);

  /**
   * Start the detection loop when the FaceLandmarker is ready.
   */
  useEffect(() => {
    initFaceLandmarker();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, [initFaceLandmarker]);

  /**
   * Start/stop the detection loop based on readiness.
   */
  useEffect(() => {
    if (state.isReady && videoRef.current) {
      rafRef.current = requestAnimationFrame(detect);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.isReady, detect, videoRef]);

  return state;
}
