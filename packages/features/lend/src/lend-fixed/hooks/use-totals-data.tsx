import { FormattedMessage } from 'react-intl';
import { TokenBalance, FiatSymbols } from '@notional-finance/core-entities';
import {
  useFiat,
  useAllMarkets,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

export const useTotalsData = (selectedDepositToken: string | undefined) => {
  const baseCurrency = useFiat();
  const network = useSelectedNetwork();
  const {
    yields: { fCashLend, liquidity },
  } = useAllMarkets();
  const tvlData = liquidity?.find(
    (data) => data.underlying?.symbol === selectedDepositToken
  );

  const filteredFCash = fCashLend
    .filter(({ underlying }) => underlying?.symbol === selectedDepositToken)
    .map(({ token }) => token.totalSupply?.toUnderlying());

  let totalFixedRateDebt;
  if (filteredFCash && selectedDepositToken && network) {
    const zeroUnderlying = TokenBalance.fromSymbol(
      0,
      selectedDepositToken,
      network
    );

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
      value: '-',
    },
  ];
};

export default useTotalsData;
