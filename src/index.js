import "./styles.css";

const audioContext = new (window.webkitAudioContext || window.AudioContext)();
const SAMPLE_RATE = audioContext.sampleRate;
const whiteNoiseTime = 1; // measured in seconds

const whiteNoiseBuffer = audioContext.createBuffer(
  1,
  SAMPLE_RATE * whiteNoiseTime,
  SAMPLE_RATE
);
const whiteNoiseChannelData = whiteNoiseBuffer.getChannelData(0);
for (let i = 0; i < whiteNoiseBuffer.length; i++) {
  whiteNoiseChannelData[i] = Math.random() * 2 - 1;
}

// Connect all of our audio nodes to this gain node so their volume is lower.
const primaryGainControl = audioContext.createGain();
primaryGainControl.gain.setValueAtTime(0.05, 0);
primaryGainControl.connect(audioContext.destination);

const button = document.createElement("button");
button.innerText = "White Noise";
button.addEventListener("click", () => {
  const whiteNoiseSource = audioContext.createBufferSource();
  whiteNoiseSource.buffer = whiteNoiseBuffer;
  whiteNoiseSource.connect(primaryGainControl);

  whiteNoiseSource.start();
});
document.body.appendChild(button);

// Snare Drum Button
const snareFilter = audioContext.createBiquadFilter();
snareFilter.type = "highpass";
snareFilter.frequency.value = 1500; // Measured in Hz
snareFilter.connect(primaryGainControl);

const snareButton = document.createElement("button");
snareButton.innerText = "Snare";
snareButton.addEventListener("click", () => {
  const whiteNoiseSource = audioContext.createBufferSource();
  whiteNoiseSource.buffer = whiteNoiseBuffer;

  // Control the gain of our snare white noise
  const whiteNoiseGain = audioContext.createGain();
  whiteNoiseGain.gain.setValueAtTime(1, audioContext.currentTime);
  whiteNoiseGain.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2
  );
  whiteNoiseSource.connect(whiteNoiseGain);
  whiteNoiseGain.connect(snareFilter);
  whiteNoiseSource.start();
  whiteNoiseSource.stop(audioContext.currentTime + 0.2);

  // Set up an oscillator to provide a 'snap' sound
  const snareOscillator = audioContext.createOscillator();
  snareOscillator.type = "triangle";
  snareOscillator.frequency.setValueAtTime(100, audioContext.currentTime);

  // Control the gain of our snare oscillator
  const oscillatorGain = audioContext.createGain();
  oscillatorGain.gain.setValueAtTime(0.7, audioContext.currentTime);
  oscillatorGain.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );
  snareOscillator.connect(oscillatorGain);
  oscillatorGain.connect(primaryGainControl);
  snareOscillator.start();
  snareOscillator.stop(audioContext.currentTime + 0.2);
});
document.body.appendChild(snareButton);

// Kick Drum Button
const kickButton = document.createElement("button");
kickButton.innerText = "Kick";
kickButton.addEventListener("click", () => {
  const kickOscillator = audioContext.createOscillator();
  // Frequency in Hz. This corresponds to a C note.
  kickOscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  kickOscillator.frequency.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.5
  );

  const kickGain = audioContext.createGain();
  kickGain.gain.setValueAtTime(1, 0);
  kickGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.5
  );
  kickOscillator.connect(kickGain);
  kickGain.connect(primaryGainControl);

  kickOscillator.start();
  // This will stop the oscillator after half a second.
  kickOscillator.stop(audioContext.currentTime + 0.5);
});
document.body.appendChild(kickButton);
