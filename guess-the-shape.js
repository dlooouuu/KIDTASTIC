let model;
let recognizer;
let initialized = false;

async function initVosk() {
  const Vosk = await createModel(); // createModel comes from vosk.js

  model = new Vosk.Model("model"); // path to model folder
  recognizer = new model.Recognizer(16000); // 16kHz audio input

  initialized = true;
  document.getElementById('output').innerText = "Model loaded. Click Start.";
}

document.getElementById('start').addEventListener('click', async () => {
  if (!initialized) {
    document.getElementById('output').innerText = "Loading model...";
    await initVosk();
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = function (e) {
    const input = e.inputBuffer.getChannelData(0);
    recognizer.acceptWaveform(input);
    const result = recognizer.result();
    if (result && result.text) {
      document.getElementById('output').innerText = result.text;
    }
  };
});
