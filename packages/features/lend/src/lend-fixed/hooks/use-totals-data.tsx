import { FormattedMessage } from 'react-intl';
import {
  TokenBalance,
  FiatSymbols,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  useFiat,
  useAllMarkets,
  useTotalHolders,
} from '@notional-finance/notionable-hooks';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  collateral: TokenDefinition | undefined
) => {
  const baseCurrency = useFiat();
  const {
    yields: { fCashLend, liquidity },
  } = useAllMarkets(deposit?.network);
  const tvlData = liquidity?.find(
    (data) => data.underlying?.id === deposit?.id
  );
  const lenders = useTotalHolders(collateral);

  const filteredFCash = fCashLend
    .filter(({ underlying }) => underlying?.id === deposit?.id)
    .map(({ token }) => token.totalSupply?.toUnderlying());

  let totalFixedRateDebt;
  if (filteredFCash && deposit) {
    const zeroUnderlying = TokenBalance.fromFloat(0, deposit);

    totalFixedRateDebt = filteredFCash?.reduce((sum, balance) => {
      return balance && sum ? sum?.add(balance) : sum;
    }, zeroUnderlying);
  }

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value: tvlData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value: totalFixedRateDebt?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Lenders'} />,
      value: lenders ? `${lenders}` : '-',
    },
  ];
};

export default useTotalsData;
