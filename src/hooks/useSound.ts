/**
 * useSound — generates mechanical keyboard click sounds using the Web Audio API.
 *
 * No external audio files needed. We synthesise a realistic key-click
 * using a quick noise burst + a very short oscillator transient.
 *
 * Three sound styles:
 *  'click'  → Classic mechanical (Cherry MX Blue-style)
 *  'soft'   → Quiet thock (linear switch style)
 *  'none'   → Silent
 */

import { useCallback, useRef } from 'react';

export type SoundStyle = 'click' | 'soft' | 'none';

export function useSound(style: SoundStyle) {
  // We lazily create the AudioContext on first use (to satisfy browser autoplay policy)
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (style === 'none') return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Safari / Chrome can suspend the context if user hasn't interacted yet
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, [style]);

  const playClick = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (style === 'click') {
      // ── Noise burst ────────────────────────────────────────────
      const bufferSize = ctx.sampleRate * 0.05; // 50ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 3;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Band-pass filter to shape it into a click
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 3200;
      bpf.Q.value = 0.8;

      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(0.6, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noiseSource.connect(bpf);
      bpf.connect(gainNoise);
      gainNoise.connect(ctx.destination);
      noiseSource.start(now);
      noiseSource.stop(now + 0.06);

      // ── Short oscillator transient (click body) ────────────────
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

      const gainOsc = ctx.createGain();
      gainOsc.gain.setValueAtTime(0.15, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);

    } else if (style === 'soft') {
      // ── Soft thock — just a low-freq noise puff ────────────────
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      source.connect(lpf);
      lpf.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
      source.stop(now + 0.08);
    }
  }, [getCtx, style]);

  return { playClick };
}
