import { FormattedMessage } from 'react-intl';
import {
  TokenBalance,
  FiatSymbols,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  useFiat,
  useAllMarkets,
  useMaxSupply,
} from '@notional-finance/notionable-hooks';

export const useTotalsData = (deposit: TokenDefinition | undefined) => {
  const baseCurrency = useFiat();
  const {
    yields: { fCashLend, liquidity },
  } = useAllMarkets(deposit?.network);
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);

  const tvlData = liquidity?.find(
    (data) => data.underlying?.id === deposit?.id
  );

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
      title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
      value: maxSupplyData?.capacityRemaining
        ? maxSupplyData?.capacityRemaining.toFloat()
        : '-',
      suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
    },
  ];
};

export default useTotalsData;
