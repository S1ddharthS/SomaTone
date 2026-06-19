import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { EMOTION_COLORS, EMOTIONS } from '../utils/constants.js';

/**
 * WebcamView — Camera feed component with face mesh overlay,
 * vignette effect, and emotion-adaptive border glow.
 *
 * Handles camera permissions gracefully with elegant fallback states.
 */
export default function WebcamView({ videoRef, emotion, landmarks, isDetecting }) {
  const canvasRef = useRef(null);
  const [cameraState, setCameraState] = useState('idle'); /* idle | requesting | active | denied | error */
  const streamRef = useRef(null);

  /**
   * Request camera access.
   */
  const startCamera = useCallback(async () => {
    setCameraState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraState('active');
        };
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
      } else {
        setCameraState('error');
      }
      console.error('Camera access error:', err);
    }
  }, [videoRef]);

  /**
   * Start camera on mount.
   */
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  /**
   * Draw face mesh landmarks on overlay canvas.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !landmarks || cameraState !== 'active') return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

    /* Draw landmark points */
    ctx.fillStyle = `${color.primary}40`;
    const step = 3; /* Draw every 3rd landmark for performance + aesthetics */

    for (let i = 0; i < landmarks.length; i += step) {
      const lm = landmarks[i];
      const x = lm.x * canvas.width;
      const y = lm.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
      ctx.fill();
    }

    /* Draw key contour connections (jawline, lips, eyes) with subtle lines */
    ctx.strokeStyle = `${color.primary}20`;
    ctx.lineWidth = 0.8;

    const jawline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58,
      132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

    drawContour(ctx, landmarks, jawline, canvas.width, canvas.height);
  }, [landmarks, emotion, videoRef, cameraState]);

  const emotionColor = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

  return (
    <div className="relative w-full" id="webcam-view">
      <div
        className="webcam-frame relative aspect-video bg-charcoal transition-all duration-1000 ease-human"
        style={{
          boxShadow: cameraState === 'active'
            ? `0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${emotionColor.glow}`
            : '0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Video Feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{
            transform: 'scaleX(-1)', /* Mirror mode */
            display: cameraState === 'active' ? 'block' : 'none',
          }}
        />

        {/* Face Mesh Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Vignette Overlay */}
        {cameraState === 'active' && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(10, 10, 10, 0.5) 100%)',
          }} />
        )}

        {/* Camera States */}
        {cameraState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera size={32} className="text-text-muted mx-auto mb-3" strokeWidth={1} />
              <p className="system-label">Initializing camera</p>
            </div>
          </div>
        )}

        {cameraState === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-sage/20 border-t-sage rounded-full animate-spin mx-auto mb-4" />
              <p className="system-label">Requesting camera access</p>
              <p className="text-body-sm text-text-muted mt-2">Please allow camera permission</p>
            </div>
          </div>
        )}

        {cameraState === 'denied' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <CameraOff size={32} className="text-rose mx-auto mb-3" strokeWidth={1} />
              <p className="system-label text-rose mb-2">Camera access denied</p>
              <p className="text-body-sm text-text-muted">
                SomaTone needs camera access for emotion detection. Please enable it in your browser settings.
              </p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-body-sm text-text-secondary hover:bg-white/[0.06] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {cameraState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <CameraOff size={32} className="text-amber mx-auto mb-3" strokeWidth={1} />
              <p className="system-label text-amber mb-2">Camera unavailable</p>
              <p className="text-body-sm text-text-muted">
                Could not access the camera. Please ensure no other app is using it.
              </p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-body-sm text-text-secondary hover:bg-white/[0.06] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Detection Status Indicator */}
        {cameraState === 'active' && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-sage animate-breathe' : 'bg-text-muted/30'}`} />
            <span className="system-label">
              {isDetecting ? 'DETECTING' : 'INITIALIZING MODEL'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Draw a contour path from landmark indices.
 */
function drawContour(ctx, landmarks, indices, width, height) {
  if (!landmarks || indices.length < 2) return;

  ctx.beginPath();
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    if (idx >= landmarks.length) continue;
    const lm = landmarks[idx];
    const x = lm.x * width;
    const y = lm.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
