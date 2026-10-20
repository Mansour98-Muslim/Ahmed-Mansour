/**
 * Audio feedback utility:
 * 1. Spoken Arabic voice ("الحمد لله" or "جزاك الله خيراً ونفع بك") using Web Speech Synthesis.
 * 2. Harmonic gentle chime using Web Audio API as backup/accent.
 */

export function speakArabicPhrase(phrase: 'الحمد لله' | 'جزاك الله خيراً ونفع بك') {
  if (typeof window === 'undefined') return;

  // First, play a subtle pleasant harmonic chime
  playIslamicChime();

  // Then speak the phrase if speech synthesis is available
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95; // calm, clear pace
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Try to find an Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic') || v.name.toLowerCase().includes('maged') || v.name.toLowerCase().includes('tarik'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn('Speech synthesis unavailable, chime played', e);
  }
}

export function playIslamicChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell chime notes (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  } catch (e) {
    console.warn('Audio chime playback fallback', e);
  }
}
