import { BaseTradeState } from '@notional-finance/notionable';
import { NegativeValueCell } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useFCashMarket } from '@notional-finance/notionable-hooks';

export const useNTokenPriceExposure = (state: BaseTradeState) => {
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
      width: '254px',
      marginRight: '10px',
    },
    {
      Header: <FormattedMessage defaultMessage="Avg Interest Rate" />,
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

  return { columns, data };
};
