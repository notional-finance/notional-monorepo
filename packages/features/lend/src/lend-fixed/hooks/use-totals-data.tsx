import { FormattedMessage } from 'react-intl';
import {
  FiatKeys,
  FiatSymbols,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useCurrentNetworkStore } from '@notional-finance/notionable';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  collateral: TokenDefinition | undefined,
  baseCurrency: FiatKeys
) => {
  const currentNetworkStore = useCurrentNetworkStore();
  const fCashLend = currentNetworkStore.getFCashTotalsData(
    deposit,
    collateral,
    false
  );

  return [
    {
      title: <FormattedMessage defaultMessage={'Market Liquidity'} />,
      value: fCashLend?.liquidity?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value:
        fCashLend?.totalFixedRateDebt?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
      value: fCashLend?.capacityRemaining
        ? fCashLend?.capacityRemaining.toFloat()
        : '-',
      suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
      decimals: 0,
    },
  ];
};

export default useTotalsData;
