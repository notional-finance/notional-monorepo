import { BaseTradeState } from '@notional-finance/notionable';
import { NegativeValueCell } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { useTheme } from '@mui/material';

export const useNTokenPriceExposure = (state: BaseTradeState) => {
  const theme = useTheme();
  const { deposit, collateralBalance } = state;
  const fCashMarket = useFCashMarket(deposit?.currencyId);
  const data =
    fCashMarket && collateralBalance
      ? fCashMarket
          .getNTokenPriceExposure(collateralBalance)
          .map(({ interestRate, price, profitLoss }) => {
            return {
              interestRate: formatNumberAsPercent(interestRate),
              price: price.toDisplayString(3),
              profitLoss: {
                isNegative: profitLoss.isNegative(),
                displayValue: profitLoss.toDisplayStringWithSymbol(3, true),
              },
            };
          })
      : [];

  const columns = [
    {
      Header: <FormattedMessage defaultMessage="Price" />,
      accessor: 'price',
      textAlign: 'left',
      width: theme.spacing(31.75),
      marginRight: '10px',
    },
    {
      Header: <FormattedMessage defaultMessage="Avg Interest Rate" />,
      accessor: 'interestRate',
      textAlign: 'right',
      width: theme.spacing(31.75),
      marginRight: '10px',
    },
    {
      Header: <FormattedMessage defaultMessage="Profit / Loss" />,
      Cell: NegativeValueCell,
      accessor: 'profitLoss',
      textAlign: 'right',
      width: theme.spacing(31.75),
      marginRight: '10px',
    },
  ];

  return { columns, data };
};
