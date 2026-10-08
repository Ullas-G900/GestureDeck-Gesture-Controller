export const tracks = ['Glass Current', 'Soft Machines', 'Night Transit', 'Low Orbit'];

const frequencies = [174.61, 220, 261.63, 146.83];
const waveforms: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'sine'];

export function createTone(
  context: AudioContext,
  index: number,
  amplitude: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = waveforms[index % waveforms.length];
  oscillator.frequency.value = frequencies[index % frequencies.length];
  gain.gain.value = amplitude;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  return { oscillator, gain };
}
