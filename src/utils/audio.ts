class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
  private fadeInterval: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playPresetSynth(frequency: number = 440, volume: number = 0.3) {
    this.stopAll();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    // Create a rich harmonic ambient chord (Root, Major Third, Fifth, Octave)
    const baseFreq = frequency;
    const chords = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    this.oscillators = chords.map((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      // Low pass filter for warm analog feel
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      return osc;
    });

    this.isPlaying = true;
  }

  public playCustomAudio(url: string, settings: { loop?: boolean; volume?: number; fadeIn?: boolean } = {}) {
    this.stopAll();
    this.htmlAudio = new Audio(url);
    this.htmlAudio.loop = settings.loop ?? true;
    const targetVol = settings.volume ?? 0.5;

    if (settings.fadeIn) {
      this.htmlAudio.volume = 0;
      this.htmlAudio.play().then(() => {
        let currentVol = 0;
        this.fadeInterval = setInterval(() => {
          if (!this.htmlAudio) return clearInterval(this.fadeInterval);
          currentVol += 0.05;
          if (currentVol >= targetVol) {
            this.htmlAudio.volume = targetVol;
            clearInterval(this.fadeInterval);
          } else {
            this.htmlAudio.volume = currentVol;
          }
        }, 100);
      }).catch((e) => {
        console.warn('Autoplay blocked by browser:', e);
      });
    } else {
      this.htmlAudio.volume = targetVol;
      this.htmlAudio.play().catch((e) => {
        console.warn('Autoplay blocked by browser:', e);
      });
    }
    this.isPlaying = true;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
    if (this.htmlAudio) {
      this.htmlAudio.volume = volume;
    }
  }

  public fadeOut(durationMs: number = 1500) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);
      setTimeout(() => this.stopAll(), durationMs);
    } else if (this.htmlAudio) {
      let vol = this.htmlAudio.volume;
      const step = vol / (durationMs / 50);
      const interval = setInterval(() => {
        if (!this.htmlAudio) return clearInterval(interval);
        vol -= step;
        if (vol <= 0) {
          this.htmlAudio.volume = 0;
          this.stopAll();
          clearInterval(interval);
        } else {
          this.htmlAudio.volume = vol;
        }
      }, 50);
    } else {
      this.stopAll();
    }
  }

  public stopAll() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.oscillators = [];

    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio = null;
    }

    this.isPlaying = false;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const soundEngine = new SoundEngine();
