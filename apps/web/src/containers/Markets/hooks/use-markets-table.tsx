import {
  IconCell,
  LinkCell,
  MultiValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/shared-config';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import {
  formatNumberAsPercent,
  getDateString,
  formatLeverageRatio,
} from '@notional-finance/helpers';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useMarketsTable = (marketType: MARKET_TYPE) => {
  const { earnYields, borrowYields } = useAllMarkets();

  const tableColumns: DataTableColumn[] = [
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
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Total APY"
          description={'Total APY header'}
        />
      ),
      displayFormatter: formatNumberAsPercent,
      Cell: MultiValueCell,
      accessor: 'totalAPY',
      textAlign: 'right',
      sortType: 'basic',
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
      sortType: 'basic',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Leverage"
          description={'Leverage header'}
        />
      ),
      Cell: MultiValueCell,
      displayFormatter: formatLeverageRatio,
      accessor: 'leverage',
      textAlign: 'right',
      sortType: 'basic',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Maturity"
          description={'Maturity header'}
        />
      ),
      Cell: MultiValueCell,
      displayFormatter: getDateString,
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
      displayFormatter: formatNumberAsPercent,
      accessor: 'noteAPY',
      textAlign: 'right',
      sortType: 'basic',
    },
    {
      Header: '',
      Cell: LinkCell,
      accessor: 'view',
      textAlign: 'right',
    },
  ];

  const formatData = (arr) => {
    return arr.map(
      ({
        underlying,
        token,
        totalAPY,
        product,
        incentives,
        leveraged,
        tvl,
        link,
      }) => {
        return {
          currency: underlying.symbol,
          product: product,
          // totalAPY: formatNumberAsPercent(totalAPY || 0),
          totalAPY: totalAPY,
          maturity:
            !token.maturity || token.maturity === PRIME_CASH_VAULT_MATURITY
              ? 0
              : token.maturity,
          leverage:
            leveraged && leveraged.leverageRatio ? leveraged.leverageRatio : 0,
          // TODO: Find or write a helper formatter for the TVL value
          totalTVL: tvl ? tvl?.toFiat('USD').toNumber() : 0,
          noteAPY:
            incentives &&
            incentives.length > 0 &&
            incentives[0]?.incentiveAPY > 0
              ? incentives[0]?.incentiveAPY
              : 0,
          view: link,
        };
      }
    );
  };

  const marketTableData =
    marketType === MARKET_TYPE.BORROW
      ? formatData(borrowYields)
      : formatData(earnYields);

  const marketTableColumns =
    marketType === MARKET_TYPE.BORROW
      ? tableColumns.filter(
          ({ accessor }) => accessor !== 'leverage' && accessor !== 'noteAPY'
        )
      : tableColumns;

  return { marketTableColumns, marketTableData };
};
