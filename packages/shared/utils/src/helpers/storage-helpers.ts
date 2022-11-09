export function getFromLocalStorage(item: string) {
  const retrievedItem = window.localStorage.getItem(item);

  if (retrievedItem) {
    return JSON.parse(retrievedItem);
  }
  return {};
}

export function setInLocalStorage(key: string, item: unknown) {
  window.localStorage.setItem(key, JSON.stringify(item));
}

export async function getInRemoteStorage<T = string>(url: string) {
  return new Promise<T>((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        resolve(req.response);
      } else {
        reject(new Error(`Response ${req.statusText} at ${url}`));
      }
    };

    req.onerror = () => {
      reject(new Error(`Response ${req.statusText} at ${url}`));
    };

    req.send();
  });
}
