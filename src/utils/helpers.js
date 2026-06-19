/**
 * Linear interpolation between two values.
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Exponential moving average for smoothing noisy signals.
 * @param {number} prev - Previous smoothed value
 * @param {number} next - New raw value
 * @param {number} alpha - Smoothing factor (0-1, lower = smoother)
 * @returns {number}
 */
export function ema(prev, next, alpha = 0.3) {
  return alpha * next + (1 - alpha) * prev;
}

/**
 * Clamp a value between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Debounce a function call.
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Throttle a function call.
 * @param {Function} fn - Function to throttle
 * @param {number} ms - Minimum interval in milliseconds
 * @returns {Function}
 */
export function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * Map a value from one range to another.
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return clamp(
    ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin,
    Math.min(outMin, outMax),
    Math.max(outMin, outMax)
  );
}

/**
 * Generate a UUID v4.
 * @returns {string}
 */
export function uuid() {
  return crypto.randomUUID();
}

/**
 * Format a timestamp to a human-readable relative time.
 * @param {string|Date} timestamp
 * @returns {string}
 */
export function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Pick a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
