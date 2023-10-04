import { FormattedMessage } from 'react-intl';
import { TokenBalance, FiatSymbols } from '@notional-finance/core-entities';
import {
  useFiat,
  useAllMarkets,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

export const useTotalsData = (selectedDepositToken: string | undefined) => {
  const network = useSelectedNetwork();
  const data = useAllMarkets();
  const baseCurrency = useFiat();
  const {
    yields: { fCashBorrow, liquidity },
  } = data;

  const tvlData = liquidity?.find(
    (data) => data.underlying?.symbol === selectedDepositToken
  )?.tvl;

  let totalFixedRateDebt;
  if (selectedDepositToken && network) {
    const zeroUnderlying = TokenBalance.fromSymbol(
      0,
      selectedDepositToken,
      network
    );
    totalFixedRateDebt = fCashBorrow
      .filter(({ underlying }) => underlying?.symbol === selectedDepositToken)
      .map(({ token }) => token.totalSupply?.toUnderlying())
      .reduce((sum, balance) => {
        return balance && sum ? sum?.add(balance) : sum;
      }, zeroUnderlying);
  }

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value: tvlData?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Fixed Rate Debt'} />,
      value: totalFixedRateDebt?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrowers'} />,
      value: '-',
    },
  ];
};

export default useTotalsData;
