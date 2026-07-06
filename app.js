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
function frequencyToNote(frequency) {
const A4 = 440;
const C0 = A4 * Math.pow(2, -4.75);
const h = 12 * Math.log2(frequency / C0);
const octave = Math.floor(h / 12);
const n = Math.round(h % 12);
return noteNames[n] + octave;
}

function toggleMetronome() {
isMetronomeOn = !isMetronomeOn;
if (isMetronomeOn) playMetronome();
}

function playMetronome() {
if (!isMetronomeOn) return;
const bpm = parseInt(document.getElementById('bpm').value);
const beatDuration = (60 / bpm) * 1000;
setTimeout(playMetronome, beatDuration);
}

function toggleRecord() {
isRecording = !isRecording;
if (isRecording) detectedNotes = [];
}
function toggleMetronome() {
isMetronomeOn = !isMetronomeOn;
const bpm = parseInt(document.getElementById('bpm').value);
const beatDuration = (60 / bpm) * 1000;

if (isMetronomeOn) {
playMetronome();
}
}

function playMetronome() {
if (!isMetronomeOn) return;

const osc = audioContext.createOscillator();
const gain = audioContext.createGain();
osc.connect(gain);
gain.connect(audioContext.destination);

osc.frequency.value = 1000;
gain.gain.setValueAtTime(0.3, audioContext.currentTime);
gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

osc.start(audioContext.currentTime);
osc.stop(audioContext.currentTime + 0.1);
}
function drawMelody() {
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = 400;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;

const staffTop = 50;
const lineSpacing = 15;
for (let i = 0; i < 5; i++) {
ctx.beginPath();
ctx.moveTo(0, staffTop + i * lineSpacing);
ctx.lineTo(canvas.width, staffTop + i * lineSpacing);
ctx.stroke();
}

detectedNotes.forEach((note, index) => {
const x = (index / detectedNotes.length) * canvas.width;
const noteValue = getNotePosition(note.note);
const y = staffTop + (4 - noteValue) * lineSpacing;

ctx.fillStyle = '#0000ff';
ctx.beginPath();
ctx.arc(x, y, 8, 0, Math.PI * 2);
ctx.fill();
});
}

function getNotePosition(note) {
const positions = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
return positions[note.charAt(0)] % 7;
}

function harmonizeMelody() {
const key = document.getElementById('key').value;
const level = parseInt(document.getElementById('harmonizeLevel').value);

document.getElementById('harmonizationDisplay').textContent =
`Armonización Nivel ${level} en ${key}`;
}

async function init() {
await initAudio();
}

window.addEventListener('load', init);
