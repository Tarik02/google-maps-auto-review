export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const waitFor = async (fn, { timeout = 30000, interval = 100 } = {}) => {
  const until = timeout === 0 ? Infinity : Date.now() + timeout;

  do {
    try {
      const res = fn();
      if (res !== null) {
        return res;
      }
    } catch (e) {
      console.error(e);
    }

    await sleep(interval);
  } while (Date.now() < until);

  throw new Error(`timeout ${timeout} expired`)
};

export const waitForSelector = async (selector, { root = document, timeout = 30000, interval = 100 } = {}) => await waitFor(
  () => (typeof root === 'function' ? root() : root).querySelector(selector) ?? null,
  { timeout, interval }
);

export const waitForXPath = async (selector, { root = document, timeout = 30000, interval = 100 } = {}) => await waitFor(
  () => {
    const resolvedRoot = typeof root === 'function' ? root() : root;
    return document.evaluate(
      selector,
      resolvedRoot,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue ?? null;
  },
  { timeout, interval }
);

/**
 * @param {HTMLInputElement|HTMLTextAreaElement} element
 * @param {String} text
 */
export const type = async (element, text) => {
  element.focus();

  await sleep(5);

  element.value = text;

  await sleep(5);

  element.dispatchEvent(new Event('input', { bubbles: true }));

  await sleep(5);
};

export const call = (type, ...args) => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage({ type, args }, ({ result, error }) => {
    if (error) {
      reject(new Error(error));
    } else {
      resolve(result);
    }
  });
});
