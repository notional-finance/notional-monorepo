import { Bundle, Transfer } from '.';
import { BundleCriteria } from './bundle';

export function computeBundles(transfers: Transfer[]) {
  const bundles: Bundle[] = [];

  // Scan unbundled transfers
  let nextStartIndex = 0;
  transfers.forEach((_, i) => {
    nextStartIndex = scanTransferBundle(
      nextStartIndex,
      transfers.slice(0, i),
      bundles
    );
  });

  return bundles;
}

function scanTransferBundle(
  startIndex: number,
  transferArray: Transfer[],
  bundleArray: Bundle[]
) {
  for (const criteria of BundleCriteria) {
    // Go to the next criteria if the window size does not match
    if (transferArray.length - startIndex < criteria.windowSize) continue;

    let lookBehind = criteria.lookBehind;
    // Check if the lookbehind is satisfied
    if (startIndex < lookBehind) {
      if (criteria.canStart && startIndex == 0) {
        // If the criteria can start, then set the look behind to zero
        lookBehind = 0;
      } else {
        // Have not satisfied the lookbehind, go to the next criteria
        continue;
      }
    }

    const window = transferArray.slice(
      startIndex - lookBehind,
      startIndex + criteria.windowSize
    );

    if (criteria.func(window)) {
      const windowStartIndex = criteria.rewrite ? 0 : lookBehind;
      const windowEndIndex = lookBehind + criteria.bundleSize - 1;
      const startLogIndex = window[windowStartIndex].logIndex;
      const endLogIndex = window[windowEndIndex].logIndex;

      const bundle: Bundle = {
        bundleName: criteria.bundleName,
        startLogIndex,
        endLogIndex,
        transfers: [],
      };

      for (let i = windowStartIndex; i <= windowEndIndex; i++) {
        // Update the bundle id on all the transfers
        bundle.transfers.push(window[i]);
      }

      if (criteria.rewrite) bundleArray.pop();
      bundleArray.push(bundle);

      // Marks the next start index in the transaction level transfer array
      return startIndex + criteria.bundleSize;
    }
  }

  return startIndex;
}
