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
