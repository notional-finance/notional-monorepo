import { Bundle, Marker, Transaction } from '.';

interface TypeMatcher {
  name: string;
  pattern: MatcherPattern[];
  endMarkers?: string[];
}

interface MatcherPattern {
  op: '*' | '.' | '?' | '!$' | '+';
  expression: string[];
}

export const Markers = ['AccountContextUpdate'];

const TransactionMatchers: TypeMatcher[] = [
  {
    name: 'Mint nToken',
    pattern: [
      {
        op: '*',
        expression: [
          'nToken Add Liquidity',
          'nToken Deleverage',
          'nToken Remove Liquidity',
        ],
      },
      { op: '.', expression: ['Mint nToken'] },
    ],
  },
  {
    name: 'Redeem nToken',
    pattern: [
      { op: '+', expression: ['nToken Remove Liquidity'] },
      {
        op: '*',
        expression: [
          'Buy fCash',
          'Sell fCash',
          'nToken Residual Transfer',
          'Borrow fCash',
          'Transfer Incentive',
          'Repay Prime Cash',
          'Repay fCash',
        ],
      },
      { op: '.', expression: ['Redeem nToken'] },
    ],
  },
  {
    name: 'Initialize Markets',
    endMarkers: ['MarketsInitialized'],
    pattern: [
      { op: '.', expression: ['Global Settlement'] },
      {
        op: '+',
        expression: [
          'Settle fCash nToken',
          'Settle Cash nToken',
          'nToken Remove Liquidity',
        ],
      },
      { op: '?', expression: ['Repay Prime Cash'] },
      { op: '+', expression: ['nToken Add Liquidity'] },
    ],
  },
  {
    name: 'Initialize Markets [First Init]',
    endMarkers: ['MarketsInitialized'],
    pattern: [{ op: '+', expression: ['nToken Add Liquidity'] }],
  },
  {
    name: 'Sweep Cash into Markets',
    endMarkers: ['SweepCashIntoMarkets'],
    pattern: [{ op: '+', expression: ['nToken Add Liquidity'] }],
  },
  {
    name: 'Settle Account',
    endMarkers: ['AccountSettled'],
    pattern: [{ op: '+', expression: ['Settle fCash', 'Settle Cash'] }],
  },
  {
    name: 'Liquidation',
    endMarkers: [
      'LiquidateLocalCurrency',
      'LiquidateCollateralCurrency',
      'LiquidatefCashEvent',
    ],
    pattern: [
      { op: '?', expression: ['Deposit and Transfer'] },
      {
        op: '+',
        expression: [
          'Transfer Asset',
          'Transfer Incentive',
          'Repay Prime Cash',
          'Borrow Prime Cash',
          'Repay fCash',
        ],
      },
      { op: '?', expression: ['Withdraw'] },
    ],
  },
  {
    name: 'Vault Entry',
    pattern: [
      { op: '?', expression: ['Deposit and Transfer'] },
      {
        op: '+',
        expression: [
          'Sell fCash [Vault]',
          'Vault Fees',
          'Vault Entry Transfer',
          'Borrow fCash [Vault]',
          'Settle Cash',
          'Settle fCash',
          'Borrow Prime Cash [Vault]',
          'Vault Secondary Borrow',
          'Vault Burn Cash',
        ],
      },
      { op: '.', expression: ['Vault Entry'] },
    ],
  },
  {
    name: 'Vault Exit',
    pattern: [
      {
        op: '+',
        expression: [
          'Buy fCash [Vault]',
          'Vault Redeem',
          'Repay fCash [Vault]',
          'Vault Secondary Repay',
          'Vault Fees',
          'Settle Cash',
          'Settle fCash',
          'Borrow Prime Cash [Vault]',
          'Repay Prime Cash [Vault]',
          'Deposit and Transfer',
          'Withdraw',
          'Vault Lend at Zero',
          'Vault Burn Cash',
          'Vault Withdraw Cash',
        ],
      },
      { op: '.', expression: ['Vault Exit'] },
    ],
  },
  {
    name: 'Vault Roll',
    pattern: [
      {
        op: '+',
        expression: [
          'Buy fCash [Vault]',
          'Deposit and Transfer',
          'Sell fCash [Vault]',
          'Vault Fees',
          'Vault Entry Transfer',
          'Borrow fCash [Vault]',
          'Repay fCash [Vault]',
          'Vault Secondary Borrow',
          'Vault Secondary Repay',
          'Vault Lend at Zero',
          'Repay Prime Cash [Vault]',
          'Borrow Prime Cash [Vault]',
          'Vault Burn Cash',
        ],
      },
      { op: '.', expression: ['Vault Roll'] },
    ],
  },
  {
    name: 'Vault Settle',
    pattern: [
      {
        op: '*',
        expression: [
          'Vault Secondary Settle',
          'Borrow Prime Cash [Vault]',
          'Vault Fees',
          'Settle Cash',
          'Settle fCash',
          'Repay Prime Cash [Vault]',
          'Deposit and Transfer',
          'Vault Settle Cash',
        ],
      },
      { op: '.', expression: ['Vault Settle'] },
    ],
  },
  {
    name: 'Vault Deleverage [Prime]',
    pattern: [
      { op: '?', expression: ['Borrow Prime Cash [Vault]'] },
      { op: '?', expression: ['Vault Fees'] },
      { op: '.', expression: ['Deposit and Transfer'] },
      { op: '.', expression: ['Vault Deleverage Prime Debt'] },
      { op: '.', expression: ['Repay Prime Cash [Vault]'] },
    ],
  },
  {
    name: 'Vault Deleverage [fCash]',
    pattern: [
      { op: '.', expression: ['Deposit and Transfer'] },
      { op: '.', expression: ['Vault Deleverage fCash'] },
    ],
  },
  {
    name: 'Vault Liquidate Cash',
    pattern: [{ op: '.', expression: ['Vault Liquidate Cash'] }],
  },
  {
    name: 'Vault Liquidate Excess Cash',
    pattern: [{ op: '.', expression: ['Vault Liquidate Excess Cash'] }],
  },
  {
    name: 'Account Action',
    endMarkers: ['AccountContextUpdate'],
    pattern: [
      {
        op: '+',
        expression: [
          'Borrow Prime Cash',
          'Repay Prime Cash',
          'Borrow fCash',
          'Repay fCash',
          'Buy fCash',
          'Sell fCash',
          'nToken Purchase Negative Residual',
          'nToken Purchase Positive Residual',
          'Transfer Asset',
          'Transfer Incentive',
          'Deposit',
          'Withdraw',
        ],
      },
    ],
  },
];

export function parseTransactionType(bundles: Bundle[], markers: Marker[]) {
  const transactions: Transaction[] = [];
  let nextStartIndex = 0;

  while (nextStartIndex < bundles.length) {
    const { nextStartIndex: _start, matched } = scanBundles(
      nextStartIndex,
      bundles,
      markers
    );

    if (matched) {
      transactions.push(matched);
      nextStartIndex = _start;
    } else {
      break;
    }
  }

  return transactions;
}

function scanBundles(startIndex: number, bundles: Bundle[], markers: Marker[]) {
  for (const matcher of TransactionMatchers) {
    const { startMatch, endIndex, marker } = match(
      matcher,
      bundles,
      startIndex,
      markers
    );

    if (startMatch === undefined) continue;

    const { startLogIndex } = bundles[startMatch];
    const { endLogIndex } = bundles[endIndex];
    const matchedBundles = bundles.slice(startMatch, endIndex + 1);

    return {
      matched: {
        name: matcher.name,
        startLogIndex,
        endLogIndex,
        marker,
        bundles: matchedBundles,
        transfers: matchedBundles.flatMap((b) => b.transfers),
      },
      nextStartIndex: endIndex + 1,
    };
  }

  return { matched: undefined, nextStartIndex: startIndex };
}

function match(
  matcher: TypeMatcher,
  bundles: Bundle[],
  startIndex: number,
  markers: Marker[]
) {
  let startMatch = startIndex;

  while (startMatch < bundles.length) {
    const bundlesLeft = match_here(matcher.pattern, bundles.slice(startMatch));
    if (bundlesLeft === -1) {
      startMatch += 1;
      continue;
    }

    const endIndex = bundles.length - bundlesLeft - 1;
    if (matcher.endMarkers) {
      const { endLogIndex } = bundles[endIndex];
      // Find the first marker past the end index that matches the pattern
      const marker = markers.find(
        (m) => endLogIndex < m.logIndex && matcher.endMarkers?.includes(m.name)
      );
      if (marker) {
        return { startMatch, endIndex, marker };
      } else {
        startMatch += 1;
      }
    } else {
      return { startMatch, endIndex, marker: undefined };
    }
  }

  return { startMatch: undefined, endIndex: undefined, marker: undefined };
}

function match_here(pattern: MatcherPattern[], bundles: Bundle[]): number {
  if (pattern.length === 0) {
    // End of pattern, return the end index
    return bundles.length;
  }
  const { op, expression } = pattern[0];

  if (op === '.') {
    if (bundles.length > 0 && expression.includes(bundles[0].bundleName)) {
      // Did match, go one level deeper
      return match_here(pattern.slice(1), bundles.slice(1));
    } else {
      // Failed to match, exit
      return -1;
    }
  } else if (op === '?') {
    if (bundles.length > 0 && expression.includes(bundles[0].bundleName)) {
      // Did match, move to next pattern
      return match_here(pattern.slice(1), bundles.slice(1));
    } else {
      // Did not match, move to next pattern on current bundle
      return match_here(pattern.slice(1), bundles);
    }
  } else if (op === '!$') {
    if (pattern.length > 1) throw Error('!$ must terminate pattern');
    // No match
    if (bundles.length === 0) return -1;
    // Expression does not terminate the bundle array
    else !expression.includes(bundles[0].bundleName) ? 0 : -1;
  } else if (op === '+') {
    // Must match on the current bundle or fail
    if (bundles.length === 0 || !expression.includes(bundles[0].bundleName))
      return -1;

    // Otherwise match like if it is a star op
    let index = 0;
    while (
      index < bundles.length &&
      expression.includes(bundles[index]['bundleName'])
    ) {
      index += 1;
    }

    return match_here(pattern.slice(1), bundles.slice(index));
  } else if (op === '*') {
    let index = 0;
    while (
      index < bundles.length &&
      expression.includes(bundles[index]['bundleName'])
    ) {
      index += 1;
    }

    return match_here(pattern.slice(1), bundles.slice(index));
  }

  throw Error(`Unknown op ${op}`);
}
