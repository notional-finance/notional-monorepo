import { BaseTradeState } from '@notional-finance/notionable';
import { useFCashPriceExposure } from '../hooks';
import { NegativeValueCell } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useFCashPriceExposureTable = (state: BaseTradeState) => {
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
  const fCashPriceExposureColumns = [
    {
      Header: <FormattedMessage defaultMessage="Price" />,
      accessor: 'price',
      textAlign: 'left',
      width: '254px',
      marginRight: '10px',
    },
    {
      Header: <FormattedMessage defaultMessage="Interest Rate" />,
      accessor: 'interestRate',
      textAlign: 'right',
      width: '254px',
      marginRight: '10px',
    },
    {
      Header: <FormattedMessage defaultMessage="Profit / Loss" />,
      Cell: NegativeValueCell,
      accessor: 'profitLoss',
      textAlign: 'right',
      width: '254px',
      marginRight: '10px',
    },
  ];

  return { fCashPriceExposureColumns, fCashPriceExposureData };
};
