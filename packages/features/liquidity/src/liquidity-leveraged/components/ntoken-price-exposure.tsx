import { BaseTradeState } from '@notional-finance/notionable';
import { DataTable, NegativeValueCell } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useFCashMarket } from '@notional-finance/notionable-hooks';

export const NTokenPriceExposure = ({ state }: { state: BaseTradeState }) => {
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

  return (
    <DataTable
      tableTitle={
        <FormattedMessage
          defaultMessage={'n{symbol}/{symbol} Price Exposure'}
          values={{ symbol: deposit?.symbol || '' }}
        />
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
          Header: <FormattedMessage defaultMessage="Avg Interest Rate" />,
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
