export class CircadianSoundEngine {
  constructor() {
    this.currentBand = 'Morning';
    this.modifiers = {
      binauralFreq: 0,
      filterBias: 1.0,
      reverbBias: 1.0,
      label: 'Neutral',
    };
    this.update();
  }

  update() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      // Morning: 6am–12pm -> Alpha-biased grounding (10–12 Hz)
      this.currentBand = 'Morning';
      this.modifiers = {
        binauralFreq: 11, // Alpha
        filterBias: 1.1, // Slightly brighter
        reverbBias: 0.8, // Less wash, more clarity
        label: 'Alpha Focus',
      };
    } else if (hour >= 12 && hour < 18) {
      // Afternoon: 12pm–6pm -> Beta-adjacent focus (14–18 Hz)
      this.currentBand = 'Afternoon';
      this.modifiers = {
        binauralFreq: 16, // Low Beta
        filterBias: 1.2, // Brighter
        reverbBias: 0.7, // Even more clarity
        label: 'Active Pulse',
      };
    } else if (hour >= 18 && hour < 22) {
      // Evening: 6pm–10pm -> Alpha-theta transition (8–10 Hz)
      this.currentBand = 'Evening';
      this.modifiers = {
        binauralFreq: 9, // Alpha-Theta
        filterBias: 0.8, // Warmer/darker
        reverbBias: 1.2, // More wash
        label: 'Wind Down',
      };
    } else {
      // Night: 10pm–6am -> Deep Theta/Delta binaural (4–7 Hz)
      this.currentBand = 'Night';
      this.modifiers = {
        binauralFreq: 5, // Theta
        filterBias: 0.5, // Darkest
        reverbBias: 1.5, // Maximum wash
        label: 'Deep Theta',
      };
    }

    return this.modifiers;
  }

  getModifiers() {
    return this.modifiers;
  }

  getCurrentBand() {
    return this.currentBand;
  }
}
