import { FormattedMessage } from 'react-intl';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { DisplayCell, DataTableColumn } from '@notional-finance/mui';
import { getNowSeconds, getDateString } from '@notional-finance/util';
import { RATE_PRECISION } from '@notional-finance/util';
import { formatNumber, formatNumberAsPercent } from '@notional-finance/helpers';
import { TokenDefinition } from '@notional-finance/core-entities';

export const useFixedLiquidityPoolsTable = (
  token: TokenDefinition | undefined
) => {
  const fCashMarket = useFCashMarket(token);
  let tableData: any[] = [];
  let tableColumns: DataTableColumn[] | [] = [];
  const areaChartData: any[] = [];
  if (token) {
    tableColumns = [
      {
        Header: (
          <FormattedMessage
            defaultMessage={'Maturity'}
            description={'Maturity header'}
          />
        ),
        Cell: DisplayCell,
        accessor: 'maturity',
        textAlign: 'left',
      },
      {
        Header: `${token.symbol}`,
        Cell: DisplayCell,
        accessor: 'valueOfCash',
        textAlign: 'left',
      },
      {
        Header: `f${token.symbol}`,
        Cell: DisplayCell,
        accessor: 'valueOfFCash',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage={'f{symbol} PRICE'}
            values={{
              symbol: token.symbol,
            }}
          />
        ),
        Cell: DisplayCell,
        accessor: 'price',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage={'Interest Rate'}
            description={'Interest Rate header'}
          />
        ),
        Cell: DisplayCell,
        displayFormatter: formatNumberAsPercent,
        accessor: 'interestRate',
        textAlign: 'right',
      },
    ];
  }

  if (fCashMarket) {
    const {
      poolParams: { perMarketCash, perMarketfCash },
    } = fCashMarket;

    tableData = perMarketfCash.map((data, index) => {
      const interestRate = fCashMarket.getSpotInterestRate(data.token);
      const currentPrice =
        interestRate !== undefined
          ? RATE_PRECISION /
            fCashMarket.getfCashExchangeRate(
              Math.floor((interestRate * RATE_PRECISION) / 100),
              (data.maturity || 0) - getNowSeconds()
            )
          : '-';

      return {
        maturity: getDateString(data.maturity),
        valueOfCash: perMarketCash[index]
          .toUnderlying()
          .toDisplayString(4, true),
        valueOfFCash: data.toUnderlying().toDisplayString(4, true),
        price: `${formatNumber(currentPrice)} ${token?.symbol}`,
        interestRate: interestRate,
      };
    });
  }

  return { tableColumns, tableData, areaChartData };
};

export default useFixedLiquidityPoolsTable;
