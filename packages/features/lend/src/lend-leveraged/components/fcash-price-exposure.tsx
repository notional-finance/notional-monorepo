import { BaseTradeState } from '@notional-finance/notionable';
import { useFCashPriceExposure } from '../hooks/use-fcash-price-exposure';
import { DataTable, NegativeValueCell } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const FCashPriceExposure = ({ state }: { state: BaseTradeState }) => {
  const data = useFCashPriceExposure(state).map(
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

  return (
    <DataTable
      tableTitle={
        <FormattedMessage defaultMessage={'fUSDC/USDC Price Exposure'} />
      }
      stateZeroMessage={
        <FormattedMessage
          defaultMessage={'Fill in inputs to see price exposure'}
        />
      }
      data={data}
      columns={[
        {
          Header: <FormattedMessage defaultMessage="Price" />,
          accessor: 'price',
          textAlign: 'right',
        },
        {
          Header: <FormattedMessage defaultMessage="Interest Rate" />,
          accessor: 'interestRate',
          textAlign: 'right',
        },
        {
          Header: <FormattedMessage defaultMessage="Profit / Loss" />,
          Cell: NegativeValueCell,
          accessor: 'profitLoss',
          textAlign: 'right',
        },
      ]}
    />
  );
};
