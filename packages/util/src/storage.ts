export function getFromLocalStorage(item: string) {
  const retrievedItem = globalThis.localStorage.getItem(item);

  if (retrievedItem) {
    return JSON.parse(retrievedItem);
  }
  return {};
}

export function setInLocalStorage(key: string, item: unknown) {
  globalThis.localStorage.setItem(key, JSON.stringify(item));
}
