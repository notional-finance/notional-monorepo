import { FormattedMessage } from 'react-intl';
import {
  TokenBalance,
  FiatSymbols,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  useUserSettings,
  useAllMarkets,
  useMaxSupply,
} from '@notional-finance/notionable-hooks';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  collateral: TokenDefinition | undefined
) => {
  const { baseCurrency } = useUserSettings();
  const {
    yields: { fCashLend },
  } = useAllMarkets(deposit?.network);
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);

  const filteredFCash = fCashLend
    .filter(({ underlying }) => underlying?.id === deposit?.id)
    .map(({ token }) => token.totalSupply?.toUnderlying());
  const liquidity = fCashLend.find(({ token }) => token.id === collateral?.id);

  let totalFixedRateDebt;
  if (filteredFCash && deposit) {
    const zeroUnderlying = TokenBalance.fromFloat(0, deposit);

    totalFixedRateDebt = filteredFCash?.reduce((sum, balance) => {
      return balance && sum ? sum?.add(balance) : sum;
    }, zeroUnderlying);
  }

  return [
    {
      title: <FormattedMessage defaultMessage={'Market Liquidity'} />,
      value: liquidity?.liquidity?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value: totalFixedRateDebt?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
      value: maxSupplyData?.capacityRemaining
        ? maxSupplyData?.capacityRemaining.toFloat()
        : '-',
      suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
      decimals: 0,
    },
  ];
};

export default useTotalsData;
