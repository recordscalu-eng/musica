const config = {
sampleRate: 44100,
fftSize: 4096
};

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let audioContext = null;
let analyser = null;
let microphone = null;
let isRecording = false;
let melody = [];

async function initAudio() {
if (audioContext) return;
audioContext = new (window.AudioContext || window.webkitAudioContext)();
analyser = audioContext.createAnalyser();
analyser.fftSize = config.fftSize;

try {
microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioContext.createMediaStreamSource(microphone);
source.connect(analyser);
detectPitch();
} catch (e) {
alert('Necesito acceso al micrófono');
}
}

function detectPitch() {
const dataArray = new Float32Array(analyser.fftSize);
analyser.getFloatTimeDomainData(dataArray);
const { frequency, confidence } = autoCorrelate(dataArray, audioContext.sampleRate);

if (frequency && confidence > 0.1) {
const note = frequencyToNote(frequency);
document.getElementById('noteDisplay').textContent = note;
document.getElementById('freqDisplay').textContent = frequency.toFixed(1) + ' Hz';
}

requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
const SIZE = buffer.length;
let maxSamples = Math.floor(SIZE / 2);
let best_offset = -1;
let best_correlation = 0;
let rms = 0;

for (let i = 0; i < SIZE; i++) {
let val = buffer[i];
rms += val * val;
}
rms = Math.sqrt(rms / SIZE);
if (rms < 0.01) return { frequency: null, confidence: 0 };

for (let offset = 1; offset < maxSamples; offset++) {
let correlation = 0;
for (let i = 0; i < maxSamples; i++) {
correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
}
correlation = 1 - (correlation / maxSamples);
if (correlation > best_correlation) {
best_correlation = correlation;
best_offset = offset;
}
}

if (best_correlation > 0.01) {
return {
frequency: sampleRate / best_offset,
confidence: best_correlation
};
}
return { frequency: null, confidence: 0 };
}

function frequencyToNote(frequency) {
const A4 = 440;
const C0 = A4 * Math.pow(2, -4.75);
const h = 12 * Math.log2(frequency / C0);
const octave = Math.floor(h / 12);
const n = Math.round(h % 12);
return noteNames[n] + octave;
}

function toggleRecord() {
isRecording = !isRecording;
const btn = document.getElementById('recordBtn');

if (isRecording) {
melody = [];
document.getElementById('statusDisplay').textContent = 'Grabando...';
btn.textContent = '⏹️ Detener';
btn.style.background = '#cc0000';
} else {
document.getElementById('statusDisplay').textContent = 'Grabación completa';
btn.textContent = '⚫ Grabar';
btn.style.background = '';
}
}

document.addEventListener('DOMContentLoaded', function() {
document.getElementById('startBtn').addEventListener('click', initAudio);
document.getElementById('recordBtn').addEventListener('click', toggleRecord);
});
function autoCorrelate(buffer, sampleRate) {
const SIZE = buffer.length;
let maxSamples = Math.floor(SIZE / 2);
let best_offset = -1;
let best_correlation = 0;
let rms = 0;

for (let i = 0; i < SIZE; i++) {
let val = buffer[i];
rms += val * val;
}
rms = Math.sqrt(rms / SIZE);
if (rms < 0.01) return { frequency: null, confidence: 0 };

let lastCorrelation = 1;
for (let offset = 1; offset < maxSamples; offset++) {
let correlation = 0;
for (let i = 0; i < maxSamples; i++) {
correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
}
correlation = 1 - (correlation / maxSamples);
if (correlation > 0.9 && correlation > lastCorrelation) {
let foundGoodCorrelation = false;
if (correlation > best_correlation) {
best_correlation = correlation;
best_offset = offset;
foundGoodCorrelation = true;
}
}
lastCorrelation = correlation;
}

if (best_correlation > 0.01) {
return {
frequency: sampleRate / best_offset,
confidence: best_correlation
};
}
return { frequency: null, confidence: 0 };
}

function frequencyToNote(frequency) {
const A4 = 440;
const C0 = A4 * Math.pow(2, -4.75);
const h = 12 * Math.log2(frequency / C0);
const octave = Math.floor(h / 12);
const n = Math.round(h % 12);
return noteNames[n] + octave;
}
