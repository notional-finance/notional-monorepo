import { FormattedMessage } from 'react-intl';
import { TradeState } from '@notional-finance/notionable';
import {
  useFiat,
  useCurrency,
  useTokenHistory,
} from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useVariableTotals = (state: TradeState) => {
  const isBorrow = state.tradeType === 'BorrowVariable';
  const baseCurrency = useFiat();
  const { primeCash, primeDebt } = useCurrency();
  const { apyData } = useTokenHistory(state.debt);

  const totalLentData = primeCash.find(
    ({ underlying }) => underlying === state.deposit?.id
  );

  const totalBorrowedData = primeDebt.find(
    ({ underlying }) => underlying === state.deposit?.id
  );

  const getSevenDayAvgApy = () => {
    const seventhToLastNum = apyData.length - 8;
    const lastSevenApys = apyData
      .slice(seventhToLastNum, -1)
      .map(({ area }) => area);

    const averageApy = lastSevenApys.length
      ? lastSevenApys.reduce((a, b) => a + b) / lastSevenApys.length
      : 0;

    return formatNumberAsPercent(averageApy);
  };

  return [
    {
      title: <FormattedMessage defaultMessage={'Total Lent'} />,
      value:
        totalLentData?.totalSupply
          ?.toFiat(baseCurrency)
          .toDisplayStringWithSymbol() || '-',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Borrowed'} />,
      value:
        totalBorrowedData?.totalSupply
          ?.toFiat(baseCurrency)
          .toDisplayStringWithSymbol() || '-',
    },
    {
      title: isBorrow ? (
        <FormattedMessage defaultMessage={'Average APY'} />
      ) : (
        <FormattedMessage defaultMessage={'Total Lenders'} />
      ),
      value: isBorrow ? getSevenDayAvgApy() : '-',
    },
  ];
};

export default useVariableTotals;
