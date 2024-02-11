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
  debt: TokenDefinition | undefined
) => {
  const data = useAllMarkets(deposit?.network);
  const baseCurrency = useFiat();
  const {
    yields: { fCashBorrow, liquidity },
  } = data;
  const totalBorrowers = useTotalHolders(debt);

  const tvlData = liquidity?.find(
    (data) => data.underlying?.id === deposit?.id
  )?.tvl;

  let totalFixedRateDebt;
  if (deposit) {
    const zeroUnderlying = TokenBalance.fromFloat(0, deposit);
    totalFixedRateDebt = fCashBorrow
      .filter(({ underlying }) => underlying?.id === deposit.id)
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
      value: totalBorrowers ? `${totalBorrowers}` : '-',
    },
  ];
};

export default useTotalsData;
