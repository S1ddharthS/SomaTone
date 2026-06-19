import { uuid } from '../utils/helpers.js';

export class VibeShiftJournal {
  constructor() {
    this.entries = [];
  }

  /**
   * Process a user transcript, generate a CBT-inspired reframe if negative,
   * and store it in the journal.
   */
  processTranscript(transcript, emotion, valence) {
    if (!transcript || transcript.trim().length === 0) return null;

    const entry = {
      id: uuid(),
      timestamp: Date.now(),
      transcript,
      emotion,
      valence,
      reframe: null,
      technique: null,
    };

    if (valence < 0) {
      const { reframe, technique } = this.generateReframe(transcript);
      entry.reframe = reframe;
      entry.technique = technique;
    }

    this.entries.unshift(entry); // Add to beginning
    return entry;
  }

  generateReframe(text) {
    const lower = text.toLowerCase();

    // Naive keyword-based CBT reframing
    if (lower.includes('never') || lower.includes('always')) {
      return {
        technique: "All-or-Nothing Thinking → Nuance",
        reframe: "You are using absolute terms like 'never' or 'always'. Try replacing them with 'sometimes' or 'recently'.",
      };
    }
    
    if (lower.includes('my fault') || lower.includes('blame myself')) {
      return {
        technique: "Personalization → Broadened Perspective",
        reframe: "You seem to be taking all the blame. Usually, many factors contribute to a situation, not just your actions.",
      };
    }

    if (lower.includes('idiot') || lower.includes('stupid') || lower.includes('failure')) {
      return {
        technique: "Labeling → Compassionate Observation",
        reframe: "You are applying a harsh label to yourself based on a single event. You are a person who made a mistake, not a 'failure'.",
      };
    }

    if (lower.includes('can\'t handle') || lower.includes('too much') || lower.includes('overwhelming')) {
      return {
        technique: "Catastrophizing → Grounding",
        reframe: "It feels overwhelming right now, but you have survived 100% of your bad days. Focus on just the very next step.",
      };
    }

    if (lower.includes('should') || lower.includes('must')) {
      return {
        technique: "'Should' Statements → Acceptance",
        reframe: "You are holding yourself to a rigid 'should'. Try replacing 'I should' with 'I would like to' or 'It would be nice if'.",
      };
    }

    return {
      technique: "Balanced Perspective",
      reframe: "It's understandable to feel this way. Can you find one small positive or neutral aspect of this situation?",
    };
  }

  getEntries() {
    return this.entries;
  }
}
