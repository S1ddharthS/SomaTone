import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_MODELS, DETECTION_CONFIG } from '../utils/constants.js';

/**
 * useHandTracker — React hook that initializes MediaPipe GestureRecognizer,
 * runs real-time hand detection on a video element, and exposes Left and Right
 * hand data independently with gesture sequence tracking.
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 * @returns {{
 *   left: { position, gesture, confidence, landmarks } | null,
 *   right: { position, gesture, confidence, landmarks } | null,
 *   isTracking: boolean,
 *   isReady: boolean,
 *   error: string|null,
 *   gestureSequences: { left: string[], right: string[] },
 * }}
 */
export function useHandTracker(videoRef) {
  const [state, setState] = useState({
    left: null,
    right: null,
    isTracking: false,
    isReady: false,
    error: null,
    gestureSequences: { left: [], right: [] },
  });

  const gestureRecognizerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameIntervalRef = useRef(1000 / DETECTION_CONFIG.FPS_TARGET);

  // Per-hand debounce buffers
  const leftBufferRef = useRef([]);
  const rightBufferRef = useRef([]);

  // Gesture sequence history (last N committed gestures per hand)
  const leftSeqRef = useRef([]);
  const rightSeqRef = useRef([]);

  const initGestureRecognizer = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_MODELS.WASM_PATH);

      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODELS.GESTURE_RECOGNIZER,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      gestureRecognizerRef.current = gestureRecognizer;
      setState(prev => ({ ...prev, isReady: true, error: null }));
    } catch (err) {
      console.error('GestureRecognizer init failed:', err);
      setState(prev => ({
        ...prev,
        isReady: false,
        error: `Failed to initialize hand tracking: ${err.message}`,
      }));
    }
  }, []);

  const computeHandPosition = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];
    return {
      x: (wrist.x + middleMCP.x) / 2,
      y: (wrist.y + middleMCP.y) / 2,
    };
  }, []);

  /**
   * Apply debounce buffer logic and return the committed gesture.
   */
  const debounceGesture = (buffer, gestureName) => {
    buffer.push(gestureName);
    if (buffer.length > 5) buffer.shift();
    const allSame = buffer.every(g => g === gestureName);
    return (allSame && gestureName !== 'None') ? gestureName : null;
  };

  const detect = useCallback((timestamp) => {
    rafRef.current = requestAnimationFrame(detect);

    if (timestamp - lastTimeRef.current < frameIntervalRef.current) return;
    lastTimeRef.current = timestamp;

    const video = videoRef.current;
    const gestureRecognizer = gestureRecognizerRef.current;
    if (!video || !gestureRecognizer || video.readyState < 2) return;

    try {
      const results = gestureRecognizer.recognizeForVideo(video, performance.now());

      if (results && results.landmarks && results.landmarks.length > 0) {
        let leftData = null;
        let rightData = null;

        for (let i = 0; i < results.landmarks.length; i++) {
          const landmarks = results.landmarks[i];
          const position = computeHandPosition(landmarks);

          const recognizedGesture = results.gestures?.[i]?.[0] || null;
          const gestureName = recognizedGesture?.categoryName || 'None';
          const gestureConfidence = recognizedGesture?.score || 0;

          // Determine handedness — MediaPipe reports from camera's perspective,
          // so 'Left' from camera = user's Right hand (mirrored video)
          const handedness = results.handednesses?.[i]?.[0]?.categoryName || 'Right';
          const isLeftHand = handedness === 'Right'; // Mirror flip

          if (isLeftHand) {
            const finalGesture = debounceGesture(leftBufferRef.current, gestureName);
            if (finalGesture && finalGesture !== leftSeqRef.current[leftSeqRef.current.length - 1]) {
              leftSeqRef.current.push(finalGesture);
              if (leftSeqRef.current.length > DETECTION_CONFIG.GESTURE_MACRO_BUFFER_SIZE) {
                leftSeqRef.current.shift();
              }
            }
            leftData = { position, gesture: finalGesture, gestureConfidence: finalGesture ? gestureConfidence : 0, landmarks };
          } else {
            const finalGesture = debounceGesture(rightBufferRef.current, gestureName);
            if (finalGesture && finalGesture !== rightSeqRef.current[rightSeqRef.current.length - 1]) {
              rightSeqRef.current.push(finalGesture);
              if (rightSeqRef.current.length > DETECTION_CONFIG.GESTURE_MACRO_BUFFER_SIZE) {
                rightSeqRef.current.shift();
              }
            }
            rightData = { position, gesture: finalGesture, gestureConfidence: finalGesture ? gestureConfidence : 0, landmarks };
          }
        }

        setState(prev => ({
          ...prev,
          left: leftData,
          right: rightData,
          isTracking: true,
          gestureSequences: {
            left: [...leftSeqRef.current],
            right: [...rightSeqRef.current],
          },
        }));
      } else {
        leftBufferRef.current = [];
        rightBufferRef.current = [];
        setState(prev => ({
          ...prev,
          left: null,
          right: null,
          isTracking: false,
          gestureSequences: { left: [...leftSeqRef.current], right: [...rightSeqRef.current] },
        }));
      }
    } catch (err) {
      /* Transient detection error */
    }
  }, [videoRef, computeHandPosition]);

  useEffect(() => {
    initGestureRecognizer();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
        gestureRecognizerRef.current = null;
      }
    };
  }, [initGestureRecognizer]);

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
