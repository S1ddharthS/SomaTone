import { ema } from '../utils/helpers.js';

/**
 * AcousticAnalyzer — Real-time vocal biomarker extraction.
 * Processes microphone input to detect acoustic anomalies like flat prosody (depression marker)
 * or micro-tremors (anxiety/stress marker).
 */
export class AcousticAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    
    this.dataArray = null;
    this.isListening = false;
    
    this.history = {
      energy: [],
      pitch: [],
    };
    this.historySize = 60; // Approx 2 seconds at 30 checks per second

    this.onAnomalyDetected = null;
    this.lastAnomalyTime = 0;
    this.anomalyCooldown = 15000; // Only trigger once every 15s

    this.metrics = {
      energy: 0,
      variance: 0,
      jitter: 0,
    };

    this.anomalyState = null;       // 'tremor' | 'flat' | null
    this.anomalyTimestamp = 0;
    this.anomalyDecayMs = 10000;    // Anomaly state auto-clears after 10s
  }

  async start() {
    if (this.isListening) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isListening = true;
      
      this._analyzeLoop();
    } catch (err) {
      console.error('Failed to initialize AcousticAnalyzer:', err);
    }
  }

  stop() {
    this.isListening = false;
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  _analyzeLoop() {
    if (!this.isListening) return;

    requestAnimationFrame(() => this._analyzeLoop());

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate overall energy (volume)
    let sum = 0;
    let maxFreqBin = 0;
    let maxFreqVal = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const val = this.dataArray[i];
      sum += val;
      if (val > maxFreqVal) {
        maxFreqVal = val;
        maxFreqBin = i;
      }
    }

    const energy = sum / this.dataArray.length;
    
    // Approximate pitch by finding the dominant frequency bin
    // (This is a naive approximation; real pitch detection would use autocorrelation)
    const nyquist = this.audioContext.sampleRate / 2;
    const binSize = nyquist / this.dataArray.length;
    const dominantPitch = maxFreqBin * binSize;

    this.metrics.energy = ema(this.metrics.energy, energy, 0.2);

    // Only record history if the user is actually speaking (energy > threshold)
    if (energy > 15) {
      this.history.energy.push(energy);
      this.history.pitch.push(dominantPitch);

      if (this.history.energy.length > this.historySize) {
        this.history.energy.shift();
        this.history.pitch.shift();
      }

      this._checkAnomalies();
    }
  }

  _checkAnomalies() {
    if (this.history.energy.length < this.historySize) return;

    const now = Date.now();
    if (now - this.lastAnomalyTime < this.anomalyCooldown) return;

    // Calculate Pitch Variance & Jitter
    let pitchSum = 0;
    for (let p of this.history.pitch) pitchSum += p;
    const pitchMean = pitchSum / this.historySize;

    let varianceSum = 0;
    let jitterSum = 0;

    for (let i = 0; i < this.historySize; i++) {
      varianceSum += Math.pow(this.history.pitch[i] - pitchMean, 2);
      if (i > 0) {
        jitterSum += Math.abs(this.history.pitch[i] - this.history.pitch[i - 1]);
      }
    }

    const variance = varianceSum / this.historySize;
    const jitter = jitterSum / (this.historySize - 1);

    this.metrics.variance = ema(this.metrics.variance, variance, 0.1);
    this.metrics.jitter = ema(this.metrics.jitter, jitter, 0.1);

    // Detection heuristics
    const isFlat = variance < 50 && this.metrics.energy < 40 && this.metrics.energy > 15;
    const isTremor = jitter > 150;

    if (isTremor) {
      this.lastAnomalyTime = now;
      this.anomalyState = 'tremor';
      this.anomalyTimestamp = now;
      if (this.onAnomalyDetected) this.onAnomalyDetected('tremor');
    } else if (isFlat) {
      this.lastAnomalyTime = now;
      this.anomalyState = 'flat';
      this.anomalyTimestamp = now;
      if (this.onAnomalyDetected) this.onAnomalyDetected('flat');
    }
  }

  /**
   * Return current acoustic metrics for consumption by EmotionClassifier and Dashboard.
   */
  /**
   * Return the current anomaly state with automatic decay.
   * @returns {'tremor'|'flat'|null}
   */
  getAnomalyState() {
    if (!this.anomalyState) return null;
    if (Date.now() - this.anomalyTimestamp > this.anomalyDecayMs) {
      this.anomalyState = null;
      return null;
    }
    return this.anomalyState;
  }

  getMetrics() {
    return {
      energy: this.metrics.energy,
      variance: this.metrics.variance,
      jitter: this.metrics.jitter,
      anomaly: this.getAnomalyState(),
    };
  }

  getWaveformData() {
    if (!this.isListening || !this.analyser) return new Uint8Array(128).fill(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }
}
