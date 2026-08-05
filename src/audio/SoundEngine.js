// Horologia - Synthesized Web Audio Sound Engine

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isTicking = true;
    this.tickInterval = null;
    this.tickCount = 0;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.15;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;

      // Start tick loop at 250ms (4Hz = 28,800 VPH)
      this.startTicking();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  startTicking() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      if (this.isTicking && !this.isMuted) {
        this.playTick();
      }
    }, 250); // 4 ticks per second = 4Hz / 28,800 VPH
  }

  playTick() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const isTick = (this.tickCount % 2 === 0);
    this.tickCount++;

    // High frequency click for mechanical pallet jewel engagement
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isTick ? 1200 : 950, now);
    osc.frequency.exponentialRampToValueAtTime(isTick ? 200 : 150, now + 0.015);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.015);

    // Micro metallic decay noise
    this.playMetallicClick(now, isTick ? 0.2 : 0.12);
  }

  playMetallicClick(time, intensity = 0.2) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.01;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(intensity * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.01);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  playRatchetWinding() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.03;
      this.playMetallicClick(t, 0.4);
    }
  }

  playExpansionWhoosh() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }
}

export const soundEngine = new SoundEngine();
