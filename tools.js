const fs = require('node:fs').promises;
const pdf = require('pdf-parse');

async function waitFor(time) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

// Function to create page using Puppeteer
async function getBrowserPage(url, browser, settings) {
  // Get the page object corresponding to the new target
  const page = await browser.newPage();
  const randomNumber = Math.floor(Math.random() * 99) + 1;
  const userAgent = `${settings.userAgent}${randomNumber}`;
  await page.setUserAgent(userAgent);
  await page.setExtraHTTPHeaders({ 'Accept-Language': settings.language });

  //PUPPETEER CONSOLE
  if (!settings.headless) {
    await page.on('console', (msg) => {
      for (const arg of msg.args()) {
        arg
          .jsonValue()
          .then((v) => console.log(v))
          .catch((error) => console.log(msg));
      }
    });
  }

  //BLOCK RESOURCES TO LOAD FAST
  await page.setRequestInterception(true);
  await page.on('request', (request) => {
    if (settings.intercept.indexOf(request.resourceType()) !== -1) request.abort();
    else request.continue();
  });

  await page.goto(url, { timeout: 18000 });

  return page;
}

// Function to upload file using Puppeteer
async function uploadFile(page, selector, filePath) {
  const fileInput = await page.$(selector);
  console.log(fileInput);
  await fileInput.uploadFile(filePath);
  await fileInput.evaluate((upload) => upload.dispatchEvent(new Event('change', { bubbles: true })));
}

// Decode base64 file and save it
async function saveBase64File(base64String, filePath) {
  try {
    const base64Data = base64String.replace(/data:(.*?),/g, '');
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filePath, buffer);
    return true;
  } catch (error) {
    console.error(error?.e);
    return false;
  }
}

// Function to remove file
async function removeFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
  }
}

const obtenerLlaves = (arr) => {
  const result = {};
  let currentKey = '';
  for (const item of arr) {
    if (item.includes('/')) {
      if (!result[currentKey]) result[currentKey] = [];
      result[currentKey].push(item);
    } else {
      currentKey += (currentKey ? ' ' : '') + item;
    }
  }
  return result;
};

const opinionCumplimentoInformacion = async (buffer) => {
  const pendientes = [];
  let rfc = '';
  let nombreFiscal = '';
  let estado = '';
  let totalPendientes = 0;

  const data = await pdf(buffer);
  const dataText = data?.text;

  if (typeof dataText === 'string') {
    const textSplit = dataText.split('\n');
    rfc = textSplit?.[11];
    nombreFiscal = textSplit?.[14];

    estado = textSplit?.[21];
    if (typeof estado === 'string') estado = estado.match(/\b[A-ZÁÉÍÓÚÜÑ]+\b/g);
    if (typeof estado === 'object') estado = estado?.[0];

    const pattern = /ObligaciónPeriodoPeriodoPeriodoPeriodoPeriodo([\s\S]*?)(?=Cadena Original)(?!Notas)/g;
    const match = dataText.match(pattern);

    if (typeof match === 'object' && match) {
      let allText = '';
      for (const elem of match) {
        allText += elem
          .replace(/\r?\n|\r/g, ' ')
          .replace(/Notas.*/, '')
          .replace(/ObligaciónPeriodoPeriodoPeriodoPeriodoPeriodo/, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const text = allText.replace(/(\d{4})([A-Za-z]+)/g, '$1 $2');
      //console.log(text);

      const elements = text.split(/\s(?=[A-Z])/);
      const originalObject = obtenerLlaves(elements);
      const dataKeys = Object.keys(originalObject);
      //console.log(dataKeys)

      let clean = '';
      let textClean = '';
      for (const no in dataKeys) {
        if (no === 0) textClean = dataKeys[no];
        else textClean = dataKeys[no].replace(clean, '');
        clean += textClean;

        const periodos = [];
        const dataObject = originalObject?.[dataKeys[no]];

        if (typeof dataObject === 'object') {
          for (const pago of dataObject) {
            const splitPago = pago.split('/');
            let mes = splitPago?.[0];
            if (typeof mes === 'string') mes = mes.toLocaleLowerCase().trim();
            let anio = splitPago?.[1];
            if (typeof anio === 'string') anio = anio.toLocaleLowerCase().trim();

            periodos.push({ mes, anio });
            ++totalPendientes;
          }
        }
        pendientes.push({ obligacion: textClean.trim(), periodos });
      }
    }
  }
  return { rfc, nombreFiscal, estado, pendientes, totalPendientes };
};

const is = {
  array: (array) => {
    return typeof array === 'object' && array !== null && array.length > 0;
  },
  undefined: (elem) => {
    return typeof elem === 'undefined';
  },
  file: (file) => {
    return file instanceof File;
  },
  object: (object) => {
    return typeof object === 'object' && object !== null && Object.keys(object).length > 0;
  },
  function: (fn) => {
    return typeof fn === 'function';
  },
  string: (str) => {
    return typeof str === 'string';
  },
  number: (str) => {
    return typeof str === 'number';
  },
};

const to = {
  string: (str) => {
    if (typeof str === 'string') return str;
    if (typeof str === 'number') return `${str}`;
    return '';
  },
};

module.exports = {
  is,
  to,
  waitFor,
  getBrowserPage,
  saveBase64File,
  uploadFile,
  removeFile,
  obtenerLlaves,
  opinionCumplimentoInformacion,
};
