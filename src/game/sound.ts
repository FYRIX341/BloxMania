/**
 * Classic Roblox Sound Manager
 * Plays authentic audio files from RCCService client archive
 */

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.8;
  private audioCtx: AudioContext | null = null;
  private footstepLoop: HTMLAudioElement | null = null;
  private isWalking: boolean = false;

  constructor() {
    this.initSounds();
  }

  private initSounds() {
    const soundList: Record<string, string> = {
      oof: '/sounds/uuhhh.mp3',
      explosion: '/sounds/impact_explosion_03.mp3',
      jump: '/sounds/action_jump.mp3',
      land: '/sounds/action_jump_land.mp3',
      footsteps: '/sounds/action_footsteps_plastic.mp3',
    };

    for (const [key, path] of Object.entries(soundList)) {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds.set(key, audio);
      } catch (err) {
        console.warn(`Could not preload audio: ${key}`, err);
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.footstepLoop) {
      this.footstepLoop.pause();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public play(name: 'oof' | 'explosion' | 'jump' | 'land', volumeScale: number = 1.0) {
    if (!this.enabled) return;

    try {
      const original = this.sounds.get(name);
      if (original) {
        // Clone for polyphonic overlapping sounds (e.g. multiple explosions or oofs)
        const clone = original.cloneNode() as HTMLAudioElement;
        clone.volume = Math.max(0, Math.min(1, this.volume * volumeScale));
        clone.play().catch(() => {
          this.playSyntheticFallback(name);
        });
        return;
      }
    } catch {
      // Fallback
    }
    this.playSyntheticFallback(name);
  }

  public updateWalking(isMovingOnGround: boolean) {
    if (!this.enabled) {
      if (this.footstepLoop) this.footstepLoop.pause();
      return;
    }

    if (isMovingOnGround && !this.isWalking) {
      this.isWalking = true;
      try {
        if (!this.footstepLoop) {
          const original = this.sounds.get('footsteps');
          if (original) {
            this.footstepLoop = original.cloneNode() as HTMLAudioElement;
            this.footstepLoop.loop = true;
          }
        }
        if (this.footstepLoop) {
          this.footstepLoop.volume = this.volume * 0.45;
          this.footstepLoop.play().catch(() => {});
        }
      } catch {
        // Ignored
      }
    } else if (!isMovingOnGround && this.isWalking) {
      this.isWalking = false;
      if (this.footstepLoop) {
        this.footstepLoop.pause();
      }
    }
  }

  // Pure Web Audio synthesized fallback in case of strict browser autoplay policies
  private playSyntheticFallback(name: string) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (name === 'oof') {
        // Iconic pitch dip "uuhhh"
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
        gain.gain.setValueAtTime(this.volume * 0.6, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (name === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (name === 'explosion') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
        gain.gain.setValueAtTime(this.volume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // Audio not permitted yet
    }
  }
}

export const soundManager = new SoundManager();
