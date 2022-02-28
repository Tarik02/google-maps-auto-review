import '../img/icon-128.png'
import '../img/icon-34.png'

import random from 'random';

let lastUpdatedAt = null;
let dataPromise = null;

const getData = async () => {
  if (Date.now() - lastUpdatedAt > 5 * 60 * 1000) {
    dataPromise = fetch('https://tarik02.pp.ua/data.json?' + Date.now()).then(res => res.json());
    lastUpdatedAt = Date.now();
  }

  return await dataPromise;
};

const randomOf = (items, count = null) => {
  if (count === null) {
    return items[random.int(0, items.length - 1)];
  } else {
    const newItems = [...items];
    newItems.sort(() => random.float(-1, 1));
    return items.slice(0, count);
  }
};

let currentDataPromise = null;

const generateData = async () => {
  const data = await getData();

  const item = randomOf(data.index);
  const text = randomOf(data.text[item.text]);
  const images = randomOf(data.images[item.images], 2);

  return {
    text,
    images: await Promise.all(images.map(async image => {
      return {
        name: image.url.replace(/\/([^/]+)$/, '$1'),
        mime: image.mime,
        bytes: await fetch(image.url)
          .then(it => it.arrayBuffer())
          .then(it => Array.from(new Uint8Array(it)))
      }
    }))
  };
};

const handlers = {
  async generateData() {
    currentDataPromise = generateData();
  },
  async requestData() {
    return await currentDataPromise;
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handlers[request.type](...request.args).then(
    result => sendResponse({ result }),
    error => {
      console.error(error);
      sendResponse({ error: error?.message ?? String(error) });
    }
  );

  return true;
});

chrome.action.onClicked.addListener(async () => {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true
  });

  for (const tab of tabs) {
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'toggle' }
    );
  }
});
