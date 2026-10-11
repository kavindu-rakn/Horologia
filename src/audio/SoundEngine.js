// Horologia - Synthesized Zero-Allocation Web Audio Sound Engine
// Authentic 28,800 VPH (4 Hz / 8 beats/sec) Dual-Pallet Swiss Lever Escapement

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isTicking = true;
    this.tickInterval = null;
    this.tickCount = 0;
    this.masterGain = null;
    this.initialized = false;

    // Pre-allocated immutable AudioBuffers (Zero runtime GC allocation)
    this.entryPalletBuffer = null;
    this.exitPalletBuffer = null;
    this.ratchetBuffer = null;
    this.whooshBuffer = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.18;
      this.masterGain.connect(this.ctx.destination);

      // Pre-synthesize all metallic transients at boot
      this.initBuffers();

      this.initialized = true;

      // Start 28,800 VPH tick loop: 8 beats per second = exactly 125 ms
      this.startTicking();

      // Pause tick scheduler when tab is hidden to prevent background throttling drift
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
          }
        } else {
          if (this.isTicking && !this.isMuted && !this.tickInterval) {
            this.startTicking();
          }
        }
      });
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  initBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;

    // ── Helper: Pre-render metallic pallet jewel impulse transient ──
    const renderPalletTransient = (fundamentalFreq, decayRate, dampingRate) => {
      const duration = 0.032;
      const length = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Harmonic partials of synthetic ruby striking hardened steel tooth
        const partial1 = Math.sin(2 * Math.PI * fundamentalFreq * t);
        const partial2 = 0.38 * Math.sin(2 * Math.PI * fundamentalFreq * 2.18 * t);
        const partial3 = 0.18 * Math.sin(2 * Math.PI * fundamentalFreq * 3.45 * t);
        // Initial micro friction transient (first 2.5ms)
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * dampingRate);
        // Envelope: ultra-fast 0.2ms attack, exponential mechanical decay
        const envelope = Math.min(t / 0.0002, 1.0) * Math.exp(-t * decayRate);

        data[i] = (partial1 + partial2 + partial3 + noise * 0.65) * envelope * 0.42;
      }
      return buffer;
    };

    // 1. Entry Pallet Jewel: 3,200 Hz crisp strike with higher resonance
    this.entryPalletBuffer = renderPalletTransient(3200, 175, 950);

    // 2. Exit Pallet Jewel: 2,750 Hz release with warmer acoustic envelope
    this.exitPalletBuffer = renderPalletTransient(2750, 140, 780);

    // 3. Tactile Ratchet Click: 4,100 Hz sharp detent for crown and slider
    const ratchetLen = Math.floor(sampleRate * 0.018);
    const ratchetBuf = this.ctx.createBuffer(1, ratchetLen, sampleRate);
    const rData = ratchetBuf.getChannelData(0);
    for (let i = 0; i < ratchetLen; i++) {
      const t = i / sampleRate;
      const snap = Math.sin(2 * Math.PI * 4100 * t);
      const noise = (Math.random() * 2 - 1);
      const env = Math.min(t / 0.00015, 1.0) * Math.exp(-t * 280);
      rData[i] = (snap * 0.65 + noise * 0.55) * env * 0.38;
    }
    this.ratchetBuffer = ratchetBuf;

    // 4. Smooth Expansion Whoosh: Band-pass filtered ambient pink noise
    const whooshLen = Math.floor(sampleRate * 0.28);
    const whooshBuf = this.ctx.createBuffer(1, whooshLen, sampleRate);
    const wData = whooshBuf.getChannelData(0);
    let b0 = 0, b1 = 0;
    for (let i = 0; i < whooshLen; i++) {
      const t = i / whooshLen;
      const white = Math.random() * 2 - 1;
      const env = Math.sin(t * Math.PI);
      b0 = 0.72 * b0 + 0.28 * white;
      b1 = 0.72 * b1 + 0.28 * b0;
      wData[i] = (b0 - b1) * env * 0.32;
    }
    this.whooshBuffer = whooshBuf;
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // ── Exact 28,800 VPH (4 Hz / 8 beats per second) Cadence ─────────────────
  startTicking() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    // 1000ms / 8 beats/sec = 125ms per mechanical semi-oscillation
    this.tickInterval = setInterval(() => {
      if (this.isTicking && !this.isMuted) {
        this.playTick();
      }
    }, 125);
  }

  // ── Dual-Pallet Zero-Allocation Playback ──────────────────────────────────
  playTick() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    // Alternate between Entry Pallet Jewel (tick) and Exit Pallet Jewel (tock)
    const isEntry = (this.tickCount % 2 === 0);
    this.tickCount++;

    const buffer = isEntry ? this.entryPalletBuffer : this.exitPalletBuffer;
    if (!buffer) return;

    // Zero allocations: lightweight AudioBufferSourceNode referencing pre-built buffer
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    // Micro velocity variation (natural ±5% escapement resonance jitter)
    const gainNode = this.ctx.createGain();
    const velocity = 0.90 + (Math.random() * 0.10);
    gainNode.gain.setValueAtTime(velocity, this.ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.onended = () => {
      try {
        source.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };
    source.start();
  }

  // ── Single Tactile Ratchet Detent (for slider scrubbing & crown turns) ───
  playRatchetTick(intensity = 0.35) {
    if (!this.ctx || this.isMuted || !this.ratchetBuffer) return;
    this.resumeContext();

    const source = this.ctx.createBufferSource();
    source.buffer = this.ratchetBuffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(intensity, this.ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.onended = () => {
      try {
        source.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };
    source.start();
  }

  // Backwards compatibility alias for RaycasterManager hover interaction
  playMetallicClick(time, intensity = 0.2) {
    this.playRatchetTick(intensity);
  }

  // ── Triple Ratchet Burst (for manual crown winding) ──────────────────────
  playRatchetWinding() {
    if (!this.ctx || this.isMuted || !this.ratchetBuffer) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.ratchetBuffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.38 + Math.random() * 0.12, now + i * 0.032);

      source.connect(gain);
      gain.connect(this.masterGain);
      source.onended = () => {
        try {
          source.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
      source.start(now + i * 0.032);
    }
  }

  // ── Zero-Allocation Expansion Whoosh ─────────────────────────────────────
  playExpansionWhoosh() {
    if (!this.ctx || this.isMuted || !this.whooshBuffer) return;
    this.resumeContext();

    const source = this.ctx.createBufferSource();
    source.buffer = this.whooshBuffer;
    source.connect(this.masterGain);
    source.onended = () => {
      try {
        source.disconnect();
      } catch (e) {}
    };
    source.start();
  }
}

export const soundEngine = new SoundEngine();
if (typeof window !== 'undefined') {
  window.soundEngine = soundEngine;
}
