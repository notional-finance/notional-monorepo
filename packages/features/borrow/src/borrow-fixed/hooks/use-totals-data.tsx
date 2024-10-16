import { FormattedMessage } from 'react-intl';
import {
  FiatKeys,
  FiatSymbols,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useCurrentNetworkStore } from '@notional-finance/notionable';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  debt: TokenDefinition | undefined,
  baseCurrency: FiatKeys
) => {
  const currentNetworkStore = useCurrentNetworkStore();
  const fCashDebt = currentNetworkStore.getFCashTotalsData(deposit, debt, true);

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value: fCashDebt?.liquidity?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value:
        Math.abs(
          fCashDebt?.totalFixedRateDebt?.toFiat(baseCurrency).toFloat() || 0
        ) || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: '',
      value: '',
    },
  ];
};

export default useTotalsData;
