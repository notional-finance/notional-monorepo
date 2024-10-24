import { FormattedMessage } from 'react-intl';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { DisplayCell, DataTableColumn } from '@notional-finance/mui';
import { getNowSeconds, getDateString } from '@notional-finance/util';
import { RATE_PRECISION } from '@notional-finance/util';
import { formatNumber, formatNumberAsPercent } from '@notional-finance/helpers';
import { TokenDefinition } from '@notional-finance/core-entities';
import { useMemo } from 'react';

export const useFixedLiquidityPoolsTable = (
  token: TokenDefinition | undefined
) => {
  const fCashMarket = useFCashMarket(token);
  let tableData: any[] = [];
  const areaChartData: any[] = [];
  const tableColumns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage={'Maturity'}
            description={'Maturity header'}
          />
        ),
        cell: DisplayCell,
        accessorKey: 'maturity',
        textAlign: 'left',
      },
      {
        header: token ? `${token.symbol}` : '',
        cell: DisplayCell,
        accessorKey: 'valueOfCash',
        textAlign: 'left',
      },
      {
        header: token ? `f${token.symbol}` : '',
        cell: DisplayCell,
        accessorKey: 'valueOfFCash',
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage={'f{symbol} PRICE'}
            values={{
              symbol: token?.symbol || '',
            }}
          />
        ),
        cell: DisplayCell,
        accessorKey: 'price',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage={'Interest Rate'}
            description={'Interest Rate header'}
          />
        ),
        cell: DisplayCell,
        displayFormatter: formatNumberAsPercent,
        accessorKey: 'interestRate',
        textAlign: 'right',
      },
    ],
    [token]
  );

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
