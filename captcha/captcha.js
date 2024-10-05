/*
* Original code from https://github.com/BoxFactura/sat-captcha-ai-model/blob/master/demos/nodejs/demo.js 
  Modified code to accept base64 image instead path and return text
*/

const ort = require('onnxruntime-node');
const sharp = require('sharp');
const modelPath = './captcha/model.onnx';
const alphabet = 'Y65WRD98SMBG3NJ21CP4KF7ZXHVTQL'.split('');

// Softmax function
const softmax = (logits) => {
  const exps = logits.map(Math.exp);
  const sumExps = exps.reduce((a, b) => a + b);
  return exps.map((exp) => exp / sumExps);
};

// Convert Base64 image to Buffer and process it
const processCaptcha = async (base64) => {
  let isValid = false;
  let text = '';
  if (typeof base64 === 'string' && base64 !== '') {
    try {
      // Convert Base64 string to Buffer
      const base64Image = base64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Image, 'base64');

      // Use sharp to process the image
      const img = sharp(imageBuffer);
      const pixels = await img.raw().toBuffer();
      const input = Array.from(pixels);

      // Load ONNX model
      const model = await ort.InferenceSession.create(modelPath);

      // Create tensor for ONNX model
      const tensor = new ort.Tensor('float32', Float32Array.from(input), [1, 60, 160, 3]);
      const outputs = await model.run({ input: tensor });
      const output = outputs.output;

      const { cpuData, dims } = output;
      const [, , logitsSize] = dims;
      const numOfLogits = cpuData.length / logitsSize;

      const processedOutput = [];
      for (let i = 0; i < numOfLogits; i++) {
        const logitsArray = cpuData.slice(i * logitsSize, (i + 1) * logitsSize);
        processedOutput.push(logitsArray);
      }

      const ocrText = [];
      for (const logits of processedOutput) {
        const probs = softmax(logits);
        const maxIndex = probs.indexOf(Math.max(...probs));
        if (maxIndex !== -1 && alphabet[maxIndex] !== ocrText[ocrText.length - 1]) {
          ocrText.push(alphabet[maxIndex]);
        }
      }

      text = ocrText.join('');
      isValid = true;
    } catch (e) {
      console.error('Error processing CAPTCHA:', e?.message);
    }
  }
  return { text, isValid };
};

module.exports = {
  processCaptcha,
};
