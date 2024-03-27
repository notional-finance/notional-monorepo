import { BaseTradeState } from '@notional-finance/notionable';
import { useFCashPriceExposure } from '../hooks';
import { NegativeValueCell, DataTableColumn } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useTheme } from '@mui/material';

export const useFCashPriceExposureTable = (state: BaseTradeState) => {
  const theme = useTheme();
  const fCashPriceExposureData = useFCashPriceExposure(state).map(
    ({ interestRate, price, profitLoss }) => {
      return {
        interestRate: formatNumberAsPercent(interestRate),
        price: price.toDisplayString(3),
        profitLoss: {
          isNegative: profitLoss.isNegative(),
          displayValue: profitLoss.toDisplayStringWithSymbol(3, true),
        },
      };
    }
  );
  const fCashPriceExposureColumns: DataTableColumn[] = [
    {
      header: <FormattedMessage defaultMessage="Price" />,
      accessorKey: 'price',
      textAlign: 'left',
      width: theme.spacing(31.75),
      marginRight: theme.spacing(1.25),
    },
    {
      header: <FormattedMessage defaultMessage="Interest Rate" />,
      accessorKey: 'interestRate',
      textAlign: 'right',
      width: theme.spacing(31.75),
      marginRight: theme.spacing(1.25),
    },
    {
      header: <FormattedMessage defaultMessage="Profit / Loss" />,
      cell: NegativeValueCell,
      accessorKey: 'profitLoss',
      textAlign: 'right',
      width: theme.spacing(31.75),
      marginRight: theme.spacing(1.25),
    },
  ];

  return { fCashPriceExposureColumns, fCashPriceExposureData };
};
