import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { TradeState } from '@notional-finance/notionable';
import { useFiat, useCurrency } from '@notional-finance/notionable-hooks';

export const useVariableTotals = (state: TradeState) => {
  const { pathname } = useLocation();
  const isBorrow = pathname.includes('borrow');
  const baseCurrency = useFiat();
  const { primeCash, primeDebt } = useCurrency();

  const totalLentData = primeCash.find(
    ({ underlying }) => underlying === state.deposit?.address
  );

  const totalBorrowedData = primeDebt.find(
    ({ underlying }) => underlying === state.deposit?.address
  );

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
      value: '-',
    },
  ];
};

export default useVariableTotals;
