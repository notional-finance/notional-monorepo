export function firstValue<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

export function lastValue<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export function unique<T>(arr: T[]): T[] {
  return arr.filter((el, index, source) => source.indexOf(el) === index);
}

// Returns an array of the original array batched into arrays of chunkSize
export function batchArray<T>(arr: T[], chunkSize: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, index) =>
    arr.slice(index * chunkSize, index * chunkSize + chunkSize)
  );
}

export function zipByKey<T>(
  a: T[],
  b: T[],
  key: (t: T) => string
): Map<string, [T | undefined, T | undefined]> {
  const map = new Map<string, [T | undefined, T | undefined]>();
  const allKeys = unique<string>(a.map(key).concat(b.map(key)));
  allKeys.forEach((k) => {
    const _a = a.find((v) => key(v) === k);
    const _b = b.find((v) => key(v) === k);
    map.set(k, [_a, _b]);
  });

  return map;
}

export function zipByKeyToArray<T>(
  a: T[],
  b: T[],
  key: (t: T) => string
): Array<[T | undefined, T | undefined]> {
  return Array.from(zipByKey(a, b, key).values());
}

export function groupArrayToMap<K, T>(arr: T[], key: (t: T) => K) {
  return arr.reduce((map, v) => {
    const k = key(v);
    map.set(k, [...(map.get(k) || []), v]);
    return map;
  }, new Map<K, T[]>());
}

export function groupArrayByKey<K, T>(arr: T[], key: (t: T) => K) {
  return Array.from(groupArrayToMap(arr, key).values());
}

export function convertArrayToObject<T extends { [key: string]: unknown }>(
  array: T[],
  key: string
): Record<string, T> {
  const initialValue = {} as Record<string, T>;
  return array.reduce((obj, data) => {
    return {
      ...obj,
      [data[key] as string]: data,
    };
  }, initialValue);
}
