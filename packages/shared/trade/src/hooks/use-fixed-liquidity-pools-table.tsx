import { FormattedMessage } from 'react-intl';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { DisplayCell, DataTableColumn } from '@notional-finance/mui';
import { getNowSeconds } from '@notional-finance/util';
import { RATE_PRECISION } from '@notional-finance/util';
import {
  getDateString,
  formatNumber,
  formatNumberAsPercent,
} from '@notional-finance/helpers';

export const useFixedLiquidityPoolsTable = (
  selectedDepositToken: string | undefined,
  currencyId: number | undefined
) => {
  const fCashMarket = useFCashMarket(currencyId);
  let tableData: any[] = [];
  let tableColumns: DataTableColumn[] | [] = [];
  const areaChartData: any[] = [];
  if (selectedDepositToken) {
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
        Header: `${selectedDepositToken}`,
        Cell: DisplayCell,
        accessor: 'valueOfCash',
        textAlign: 'left',
      },
      {
        Header: `F${selectedDepositToken}`,
        Cell: DisplayCell,
        accessor: 'valueOfFCash',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage={'F{selectedDepositToken} PRICE'}
            values={{
              selectedDepositToken,
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
          .toDisplayString(3, true),
        valueOfFCash: data.toUnderlying().toDisplayString(3, true),
        price: `${formatNumber(currentPrice)} ${selectedDepositToken}`,
        interestRate: interestRate,
      };
    });
  }

  return { tableColumns, tableData, areaChartData };
};

export default useFixedLiquidityPoolsTable;
