let ctx: AudioContext | null = null;
let enabled = true;
let music: HTMLAudioElement | null = null;
export function setSound(on: boolean) {
  enabled = on;
  if (!on) music?.pause();
}
export function initAudio() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume().catch(() => {});
  } catch {
    /* Visual feedback remains available. */
  }
}
export function playTone(freq: number, duration = 0.18, volume = 0.035) {
  if (!enabled) return;
  initAudio();
  if (!ctx) return;
  const c = ctx,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(volume, c.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + duration);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}
export function playAction(
  kind: "walk" | "operate" | "view" | "invalid" | "win",
  step = 0,
) {
  const scale = [220, 261.63, 293.66, 329.63, 392, 440];
  const tone = scale[step % scale.length];
  playTone(
    kind === "invalid"
      ? 110
      : kind === "operate"
        ? tone / 2
        : kind === "view"
          ? tone * 1.5
          : kind === "win"
            ? 660
            : tone,
    kind === "operate" ? 0.5 : 0.2,
  );
}
export async function toggleMusic(on: boolean) {
  music ??= new Audio(`${import.meta.env.BASE_URL}music/thelittlehero.mp3`);
  music.loop = true;
  music.volume = 0.18;
  if (!on) {
    music.pause();
    return false;
  }
  await music.play();
  return true;
}
export function pauseMusic() {
  music?.pause();
}
