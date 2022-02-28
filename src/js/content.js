import { call, sleep, type, waitFor, waitForSelector, waitForXPath } from './dom-utils';

const writeReview = async () => {
  const { text } = await call('requestData');

  const $el = await waitForSelector('[aria-label="Написати відгук"]');
  $el.click();

  const $frame = await waitForSelector('[name="goog-reviews-write-widget"]');

  const label = [
    'Одна зірка',
    'Дві зірки',
    'Три зірки',
    'Чотири зірки',
    'П’ять зірок'
  ][2 + Math.round(Math.random() * 2)];
  (await waitForSelector(`[aria-label="${label}"]`, { root: () => $frame.contentWindow.document })).click();

  await type(
    await waitForSelector('[aria-label="Enter review"]', { root: () => $frame.contentWindow.document }),
    text
  );

  (await waitForSelector('[alt="Додати фотографії"]', { root: () => $frame.contentWindow.document })).click();

  console.log('waiting for picker');

  await waitFor(
    () => $frame.contentWindow.document.querySelector('.picker-dialog iframe') ? null : true,
    { root: () => $frame.contentWindow.document }
  );

  (await waitForXPath(
    `//span[contains(text(), 'Опублікувати')]`,
    { root: () => $frame.contentWindow.document }
  )).click();

  await sleep(2000);

  (await waitForXPath(
    `//span[contains(text(), 'ГОТОВО')]|//span[contains(text(), 'НІ, ДЯКУЮ')]`,
    { root: () => $frame.contentWindow.document }
  )).click();

  await sleep(1000);
};

let cancelCallback = () => {};
let isRunning = false;

const onStart = () => {
  isRunning = true;

  const $div = document.createElement('div');
  $div.classList.add('google-maps-auto-review');
  $div.innerText = 'Google Maps Auto Review Enabled';
  $div.style.position = 'fixed';
  $div.style.top = 0;
  $div.style.left = 0;
  $div.style.right = 0;
  $div.style.padding = '5px';
  $div.style.fontSize = '10px';
  $div.style.textAlign = 'center';
  $div.style.backgroundColor = 'black';
  $div.style.color = 'white';
  document.body.appendChild($div);
};

const onStop = () => {
  console.log('stopped');
  isRunning = false;

  for (const node of document.querySelectorAll('.google-maps-auto-review')) {
    node.remove();
  }
};

const start = async () => {
  cancelCallback();

  while (true) {
    try {
      onStart();
      await Promise.race([
        waitForSelector('[aria-label="Написати відгук"]', { timeout: 0 }),
        new Promise((_resolve, reject) => {
          cancelCallback = () => {
            onStop();
            reject(new Error('cancel'));
          };
        })
      ]);

      await call('generateData');
      await writeReview();
    } catch (e) {
      if (e.message === 'cancel') {
        return;
      }
      console.error(e);
    }
  }
};

const stop = async () => {
  cancelCallback();
};

chrome.runtime.onMessage.addListener(async request => {
  switch (request.type) {
    case 'start':
      await start();
      break;

    case 'stop':
      await stop();
      break;

    case 'toggle':
      if (isRunning) {
        await stop();
      } else {
        await start();
      }
      break;
  }
});
