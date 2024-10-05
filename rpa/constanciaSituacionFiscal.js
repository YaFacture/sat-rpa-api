const { is, to, waitFor, getBrowserPage, saveBase64File, uploadFile, removeFile } = require('../tools');
const { processCaptcha } = require('../captcha/captcha');

module.exports = async (args) => {
  const url = 'https://www.sat.gob.mx/aplicacion/login/53027/genera-tu-constancia-de-situacion-fiscal.';
  console.log(url);

  let pdf = '';
  let message = '';
  let status = false;
  let validData = false;
  let loginMethod = '';

  const rfc = to.string(args?.rfc);
  const password = to.string(args?.password);
  const base64Cer = to.string(args?.base64Cer);
  const base64Key = to.string(args?.base64Key);
  const fileName = new Date().toISOString().replace(/[:.-]/g, '');
  const filePathCer = `./${fileName}.cer`;
  const filePathKey = `./${fileName}.key`;

  if (password !== '') {
    if (rfc !== '') {
      console.log('Acceder a login con rfc contraseña...');
      loginMethod = 'password';
      validData = true;
    } else if (base64Cer !== '' && base64Key !== '') {
      console.log('Acceder a login con archivos cer, key y contraseña...');
      loginMethod = 'efirma';

      const isSavedCer = await saveBase64File(base64Cer, filePathCer);
      const isSavedKey = await saveBase64File(base64Key, filePathKey);
      validData = isSavedCer && isSavedKey;
    }
  }

  if (validData) {
    console.log('Creando ajustes para puppeteer...');
    const puppeteer = args.puppeteer;
    const settings = require('../settings.json');
    const headless = settings.headless;
    const puppeteerArgs = settings.puppeteerArgs;

    console.log('Creando browser...');
    const browser = await puppeteer.launch({
      headless: headless,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: puppeteerArgs,
      ignoreHTTPSErrors: true,
      defaultViewport: null,
    });

    try {
      console.log(`Abriendo página ${url} ...`);
      const page = await getBrowserPage(url, browser, settings);

      console.log('Esperar a formulario activo...');

      await page.waitForSelector('iframe', { timeout: 15000 });
      const iframeElement = await page.$('iframe');

      // Switch to the context of the iframe
      const iframe = await iframeElement.contentFrame();

      // Now you are inside the iframe and can interact with its content
      console.log(`Accediendo mediante ${loginMethod}...`);

      let isFormValid = false;

      if (loginMethod === 'password') {
        console.log('Esperando form de contraseña...');
        await iframe.waitForSelector('#password', { visible: true });

        console.log('Escribir rfc...');
        await iframe.waitForSelector('#rfc', { visible: true });
        await iframe.type('#rfc', rfc);

        console.log('Escribir contraseña...');
        await iframe.type('#password', password);

        console.log('Obtener imagen de captcha...');
        const base64 = await iframe.$eval('#divCaptcha img', (img) => img.src);

        console.log('Resolver captcha...');
        const captcha = await processCaptcha(base64);
        console.log(captcha);

        captchaText = captcha.text;
        isFormValid = captcha.isValid;

        if (isFormValid) {
          await iframe.waitForSelector('#userCaptcha', { visible: true });
          await iframe.type('#userCaptcha', captchaText);
        }
      } else if (loginMethod === 'efirma') {
        console.log('Dar click en botón efirma...');
        await waitFor(2000);
        await iframe.click('#buttonFiel');
        await waitFor(2000);

        console.log('Subir archivos cer y key al formulario...');
        await uploadFile(iframe, '#fileCertificate', filePathCer);
        await uploadFile(iframe, '#filePrivateKey', filePathKey);

        console.log('Escribir contraseña...');
        await iframe.waitForSelector('#privateKeyPassword', { visible: true });
        await iframe.type('#privateKeyPassword', password);

        isFormValid = true;
      }

      if (isFormValid) {
        console.log('Submit al formulario...');
        await iframe.click('#submit');
        await waitFor(9000);

        console.log('Inyectar código...');
        const iframeElementLoad = await page.$('#iframetoload');
        const iframeLoad = await iframeElementLoad.contentFrame();
        await iframeLoad.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          $(buttons[4]).click();
        });

        console.log('Obteniendo base64 de PDF...');
        await waitFor(6000);

        pdf = await page.evaluate(async () => {
          try {
            function blobToBase64(blob) {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve(reader.result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            }

            const res = await fetch('https://rfcampc.siat.sat.gob.mx/PTSC/IdcSiat/IdcGeneraConstancia.jsf', {
              method: 'POST',
              mode: 'cors',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              },
            });
            const blob = await res.blob();
            return await blobToBase64(blob);
          } catch (error) {
            console.log('error');
            console.log(error);
            return '';
          }
        });

        if (is.string(pdf) && pdf.includes('application/pdf')) {
          status = true;
          message = 'PDF de constancia generado';
        }

        console.log('Cerrando sesión...');
        try {
          await page.waitForSelector('#campo-busqueda > a', { timeout: 3000 }); // Wait for the first <a> inside #campo-busqueda
          await page.click('#campo-busqueda > a'); // Click on the first <a> found
          await waitFor(1000);
          await page.evaluate(() => {
            document.getElementsByClassName('buttonx')[1].click();
          });
        } catch (er) {
          console.log(er?.message);
          console.log('Error al cerrar sesión');
        }
      }
    } catch (e) {
      const error = e?.message;
      message = error;
    }
    await browser.close();
    console.log('Finalizado');

    if (loginMethod === 'efirma') {
      await removeFile(filePathCer);
      await removeFile(filePathKey);
    }
  } else message = 'No es posible crear archivos cer y key';

  return { status, message, pdf };
};
