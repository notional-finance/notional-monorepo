import { AmountKey } from '@notional-finance/notionable';

export function getAmountKeys(symbol: string): AmountKey[] {
  let amountKeys: AmountKey[] = [];

  switch (symbol) {
    case 'ETH':
    case 'cETH':
      amountKeys = [
        { key: '10', value: '10' },
        { key: '100', value: '100' },
        { key: '1k', value: '1000' },
        { key: '10k', value: '10000' },
      ];
      break;

    case 'WBTC':
    case 'cWBTC':
      amountKeys = [
        { key: '0.5', value: '0.5' },
        { key: '1', value: '1' },
        { key: '10', value: '10' },
        { key: '100', value: '100' },
      ];
      break;

    default:
      amountKeys = [
        { key: '10k', value: '10000' },
        { key: '100k', value: '100000' },
        { key: '1M', value: '1000000' },
        { key: '10M', value: '10000000' },
      ];
  }

  return amountKeys;
}
