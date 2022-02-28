import { sleep, type, waitFor, waitForSelector, call } from './dom-utils';

const start = async () => {
  console.log('requesting files');

  const { images } = await call('requestData');

  console.log('adding files');

  const dataTransfer = new DataTransfer();
  for (const { name, mime, bytes } of images) {
    const file = new File([(new Uint8Array(bytes)).buffer], name, {
      type: mime
    });
    dataTransfer.items.add(file);
  }

  console.log('uploading');

  const $btn = await waitForSelector('#\\:i\\.select-files-button>*');
  await new Promise(resolve => {
    setTimeout(() => {
      $btn.click();
      resolve();
    }, 1);
  });

  const $file = await waitForSelector('input[type="file"]');
  $file.files = dataTransfer.files;
  $file.dispatchEvent(new InputEvent('change'));

  console.log('sending');

  await sleep(250);

  (await waitForSelector('#picker\\:ap\\:0[aria-disabled="false"]')).dispatchEvent(new MouseEvent('mousedown'));

  await sleep(250);

  (await waitForSelector('#picker\\:ap\\:0[aria-disabled="false"]')).dispatchEvent(new MouseEvent('mouseup'));

  console.log('sent');
};

start();
