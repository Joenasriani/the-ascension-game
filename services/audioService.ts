let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playTone = (freq: number, type: OscillatorType = 'sine', duration: number = 0.3, vol: number = 0.1) => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playStep = () => playTone(600 + Math.random() * 100, 'sine', 0.1, 0.05);
export const playRotate = () => playTone(150, 'triangle', 0.5, 0.05);
export const playWin = () => {
  playTone(440, 'sine', 0.5, 0.1);
  setTimeout(() => playTone(554, 'sine', 0.5, 0.1), 200);
  setTimeout(() => playTone(659, 'sine', 0.8, 0.1), 400);
};
export const playSlide = () => playTone(200, 'square', 0.2, 0.03);
