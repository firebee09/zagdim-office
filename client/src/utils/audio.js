// All sounds generated via Web Audio API — no files needed

class AudioManager {
  constructor() {
    this._ctx = null;
    this._lastFootstep = 0;
    this.FOOTSTEP_INTERVAL = 380;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if browser suspended it (autoplay policy)
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  // 🔔 Friendly two-tone ding for wave notifications
  playDing() {
    try {
      const ctx = this._getCtx();
      const now = ctx.currentTime;

      const play = (freq, startTime, duration) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      play(880, now,        0.35); // high note
      play(660, now + 0.18, 0.45); // lower note follows
    } catch (e) { /* audio blocked by browser policy */ }
  }

  // 👣 Footstep thump — call every frame while moving; internally throttled
  playFootstep() {
    try {
      const now = Date.now();
      if (now - this._lastFootstep < this.FOOTSTEP_INTERVAL) return;
      this._lastFootstep = now;

      const ctx = this._getCtx();
      const t   = ctx.currentTime;

      // Low-frequency sine thump: starts high, drops quickly — classic footstep
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.08);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) { /* silent */ }
  }

  // 👋 You sent a wave — quick confirmation boop
  playWaveSent() {
    try {
      const ctx = this._getCtx();
      const t = ctx.currentTime;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.12);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
    } catch(e) {}
  }

  // 🎉 Celebration — applause burst + fanfare
  playCelebration() {
    try {
      const ctx = this._getCtx();
      const t = ctx.currentTime;

      // Fanfare: four ascending notes
      [[440,0],[554,0.15],[659,0.30],[880,0.45]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.22, t + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.35);
        osc.start(t + delay); osc.stop(t + delay + 0.4);
      });

      // Applause: rapid noise bursts
      for (let i = 0; i < 18; i++) {
        const delay = 0.5 + i * 0.1 + Math.random() * 0.05;
        const bufLen = Math.floor(ctx.sampleRate * 0.06);
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufLen; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufLen, 2);
        }
        const src    = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain   = ctx.createGain();
        src.buffer = buffer;
        filter.type = 'bandpass'; filter.frequency.value = 1800;
        src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        gain.gain.value = 0.18 + Math.random() * 0.08;
        src.start(t + delay);
      }
    } catch(e) {}
  }

  // 🎉 Someone joined the office
  playJoin() {
    try {
      const ctx = this._getCtx();
      const t = ctx.currentTime;
      // Three quick ascending notes — cheerful "bloop bloop bloop"
      [[440, 0], [550, 0.12], [660, 0.24]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.2, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
        osc.start(t + delay);
        osc.stop(t + delay + 0.2);
      });
    } catch (e) { /* silent */ }
  }

  // 👋 Someone left the office
  playLeave() {
    try {
      const ctx = this._getCtx();
      const t = ctx.currentTime;
      // Two descending notes — gentle "bye bye"
      [[440, 0], [330, 0.15]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.15, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.25);
        osc.start(t + delay);
        osc.stop(t + delay + 0.28);
      });
    } catch (e) { /* silent */ }
  }
}

export const audio = new AudioManager();
