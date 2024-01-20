import { FormattedMessage } from 'react-intl';
import { TradeState } from '@notional-finance/notionable';
import { FiatSymbols } from '@notional-finance/core-entities';
import {
  useFiat,
  useTokenHistory,
  usePrimeCash,
  usePrimeDebt,
} from '@notional-finance/notionable-hooks';

export const useVariableTotals = (state: TradeState) => {
  const { deposit } = state;
  const isBorrow = state.tradeType === 'BorrowVariable';
  const baseCurrency = useFiat();
  const { apyData } = useTokenHistory(state.debt);

  const primeCash = usePrimeCash(deposit?.network, deposit?.currencyId);
  const primeDebt = usePrimeDebt(deposit?.network, deposit?.currencyId);

  const getSevenDayAvgApy = () => {
    const seventhToLastNum = apyData.length - 8;
    const lastSevenApys = apyData
      .slice(seventhToLastNum, -1)
      .map(({ area }) => area);

    const averageApy = lastSevenApys.length
      ? lastSevenApys.reduce((a, b) => a + b) / lastSevenApys.length
      : 0;

    return averageApy;
  };

  return [
    {
      title: <FormattedMessage defaultMessage={'Total Lent'} />,
      value: primeCash?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Borrowed'} />,
      value: primeDebt?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: isBorrow ? (
        <FormattedMessage defaultMessage={'(7d) Average APY'} />
      ) : (
        <FormattedMessage defaultMessage={'Total Lenders'} />
      ),
      value: isBorrow ? getSevenDayAvgApy() : '-',
      suffix: isBorrow ? '%' : '',
    },
  ];
};

export default useVariableTotals;
