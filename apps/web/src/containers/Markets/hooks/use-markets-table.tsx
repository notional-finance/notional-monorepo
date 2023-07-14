import {
  IconCell,
  MultiValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/shared-config';
import {
  formatNumberAsPercent,
  getDateString,
  // formatLeverageRatio,
} from '@notional-finance/helpers';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useMarketsTable = (marketType: MARKET_TYPE) => {
  const { earnYields, borrowYields } = useAllMarkets();

  const marketTableColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      Cell: IconCell,
      accessor: 'currency',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Product"
          description={'Product header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'product',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Total APY"
          description={'Total APY header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'totalAPY',
      textAlign: 'right',
      defaultCanSort: true,
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Total TVL"
          description={'Total TVL header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'totalTVL',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Leverage"
          description={'Leverage header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'leverage',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Maturity"
          description={'Maturity header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'maturity',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Note APY"
          description={'Note APY header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'noteAPY',
      textAlign: 'right',
    },
    {
      Header: '',
      Cell: MultiValueCell,
      accessor: 'view',
      textAlign: 'right',
    },
  ];

  const formatData = (arr) => {
    return arr.map(({ underlying, token, totalAPY, product, incentives }) => {
      return {
        currency: underlying.symbol,
        product: product,
        totalAPY: formatNumberAsPercent(totalAPY || 0),
        // totalAPY: totalAPY,
        maturity: token.maturity ? getDateString(token.maturity) : ' - ',
        noteAPY:
          incentives && incentives.length > 0 && incentives[0]?.incentiveAPY > 0
            ? incentives[0]?.incentiveAPY
            : ' - ',
        view: 'View',
      };
    });
  };

  const marketTableData =
    marketType === MARKET_TYPE.BORROW
      ? formatData(borrowYields)
      : formatData(earnYields);

  return { marketTableColumns, marketTableData };
};
