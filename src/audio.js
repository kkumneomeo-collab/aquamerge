/**
 * Procedural Web Audio API Sound & Cozy Woodland BGM Synthesizer
 * Zero external audio dependencies - works completely offline & reliably.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;
    this.isMuted = false;

    this.bgmTimer = null;
    this.isBgmPlaying = false;
    this.bgmStep = 0;

    // Cozy pentatonic frequencies for BGM (C major / A minor pentatonic: C, D, E, G, A)
    this.chords = [
      // Cmaj7 (C3, G3, B3, E4, G4)
      [130.81, 196.00, 246.94, 329.63, 392.00, 523.25],
      // Am7 (A2, E3, G3, C4, E4)
      [110.00, 164.81, 196.00, 261.63, 329.63, 440.00],
      // Fmaj7 (F2, C3, E3, A3, C4)
      [87.31, 130.81, 164.81, 220.00, 261.63, 349.23],
      // G6 (G2, D3, G3, B3, E4)
      [98.00, 146.83, 196.00, 246.94, 329.63, 392.00]
    ];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.startAmbientDrone();
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * Cozy Kalimba / Marimba Pluck Generator
   */
  playPluck(freq, duration = 1.2, gainFactor = 0.3, isMusic = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Warm wooden acoustic timbre
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle 2nd harmonic overtone for kalimba tine metallic ring
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.75, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainFactor, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(gainFactor * 0.25, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gain);
    gain.connect(isMusic ? this.musicGain : this.sfxGain);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + duration + 0.05);
    oscHarmonic.stop(now + duration + 0.05);
  }

  startAmbientDrone() {
    if (!this.ctx || this.ambientFilter) return;
    try {
      // Soft gentle forest air bed
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.15;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start();
      this.ambientFilter = filter;
    } catch (e) {
      // Ignore audio ambient error if unsupported
    }
  }

  startBGM() {
    this.ensureContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    let chordIdx = 0;
    let arpeggioPattern = [0, 2, 4, 3, 1, 3, 2, 4];
    let noteIdx = 0;

    const playBgmTick = () => {
      if (!this.isBgmPlaying) return;
      const chord = this.chords[chordIdx];
      const noteOffset = arpeggioPattern[noteIdx % arpeggioPattern.length];
      const freq = chord[noteOffset % chord.length];

      // Play soft pluck
      this.playPluck(freq, 1.4, 0.16, true);

      // On downbeat, play gentle bass root note
      if (noteIdx === 0) {
        this.playPluck(chord[0] * 0.5, 2.0, 0.22, true);
      }

      noteIdx++;
      if (noteIdx >= arpeggioPattern.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % this.chords.length;
      }

      // Cozy relaxed tempo (~320ms per note = ~94 BPM 8th notes)
      const swing = (noteIdx % 2 === 0 ? 0.02 : -0.02) + (Math.random() * 0.01 - 0.005);
      const delay = (340 + swing * 1000);
      this.bgmTimer = setTimeout(playBgmTick, delay);
    };

    playBgmTick();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /**
   * SFX: Drop Mushroom
   */
  playDrop() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * SFX: Bounce / Squish Impact
   */
  playBounce(radius = 30, velocity = 2) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Pitch inversely proportional to radius
    const baseFreq = Math.max(90, 480 - radius * 2.8);
    const volume = Math.min(0.25, Math.max(0.03, velocity * 0.035));

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.3, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.08);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * SFX: Merge Fungi
   * Ascending joyful crystal chime + bubbly pop
   */
  playMerge(tier = 1) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Harmonic musical pitches corresponding to tiers
    const tierPitches = [
      [261.63, 392.00],         // Tier 1 -> 2 (C4, G4)
      [329.63, 493.88],         // Tier 2 -> 3 (E4, B4)
      [392.00, 587.33],         // Tier 3 -> 4 (G4, D5)
      [440.00, 659.25],         // Tier 4 -> 5 (A4, E5)
      [523.25, 783.99],         // Tier 5 -> 6 (C5, G5)
      [587.33, 880.00],         // Tier 6 -> 7 (D5, A5)
      [659.25, 987.77, 1318.5], // Tier 7 -> 8 (E5, B5, E6)
      [783.99, 1174.66, 1567.98], // Tier 8 -> 9 (G5, D6, G6)
      [880.00, 1318.51, 1760.00], // Tier 9 -> 10 (A5, E6, A6)
      [1046.50, 1567.98, 2093.00, 2637.02], // Tier 10 -> 11 (C6, G6, C7, E7)
    ];

    const notes = tierPitches[Math.min(tier - 1, tierPitches.length - 1)] || [523.25, 783.99];

    // Aquatic watery bubble pop (bloop-pop!)
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(180, now);
    popOsc.frequency.exponentialRampToValueAtTime(780, now + 0.07);
    popGain.gain.setValueAtTime(0.24, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    popOsc.connect(popGain);
    popGain.connect(this.sfxGain);
    popOsc.start(now);
    popOsc.stop(now + 0.09);

    // Second resonant harmonic bubble chime
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(450, now + 0.01);
    clickOsc.frequency.exponentialRampToValueAtTime(950, now + 0.05);
    clickGain.gain.setValueAtTime(0.14, now + 0.01);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);
    clickOsc.start(now + 0.01);
    clickOsc.stop(now + 0.07);

    // Chimes
    notes.forEach((freq, i) => {
      const delay = i * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = tier >= 8 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(0.22, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.65);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.7);
    });
  }

  /**
   * SFX: New Species Discovered!
   */
  playDiscovery() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    fanfareNotes.forEach((freq, idx) => {
      const startTime = now + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.85);
    });
  }

  /**
   * SFX: Danger Warning Pulse
   */
  playDangerTick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * SFX: Game Over
   */
  playGameOver() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440.00, 392.00, 349.23, 293.66]; // A4, G4, F4, D4

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  }

  /**
   * SFX: Button Click
   */
  playClick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * SFX: Shake Power-up
   */
  playShake() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Rattle / shaker noise burst
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  /**
   * SFX: Bomb / Pop Power-up
   */
  playBomb() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const sound = new SoundEngine();
