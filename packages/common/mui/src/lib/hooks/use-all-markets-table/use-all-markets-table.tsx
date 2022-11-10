import { useCallback, useEffect, useState } from 'react';
import { SystemEvents, Currency } from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { useNotional } from '@notional-finance/notionable-hooks';
import { IconCell } from '../../data-table-cells';
import { FormattedMessage } from 'react-intl';
import { formatMaturity, unique } from '@notional-finance/utils';

type CurrencyProps = Currency;
type CurrencyMarketProps = Market;

export const useAllMarketsTable = () => {
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [tableColumns, setTableColumns] = useState<Record<string, any>[]>([]);
  const { notional } = useNotional();

  const formatTableColumns = useCallback((dates) => {
    const result: Record<string, any>[] = [
      {
        Header: <FormattedMessage defaultMessage="Currency" description={'Currency Header'} />,
        accessor: 'currency',
        Cell: IconCell,
        textAlign: 'left',
      },
    ].concat(
      dates.map((data: any) => {
        return {
          Header: formatMaturity(data),
          accessor: data.toString() as string,
          textAlign: 'right',
        };
      })
    );
    return result;
  }, []);

  const updateAllMarkets = useCallback(() => {
    let dates: number[] = [];
    const currencies: CurrencyProps[] = notional?.system.getTradableCurrencies() ?? [];

    const marketData = currencies.map((c: CurrencyProps) => {
      const currencyMarkets: CurrencyMarketProps[] = notional?.system.getMarkets(c.id) ?? [];
      dates = unique([
        ...dates,
        ...currencyMarkets.map((market: CurrencyMarketProps) => market.maturity),
      ]);

      const maturityData: Record<string, any> = {};
      dates.forEach((d: number) => {
        const currentMaturityData = currencyMarkets.find((el) => el.maturity === d);
        maturityData[d] = currentMaturityData?.midRate;
      });
      return { ...maturityData, currency: c.underlyingSymbol };
    });

    setTableData(marketData);
    setTableColumns(formatTableColumns(dates));
  }, [notional, setTableColumns, setTableData, formatTableColumns]);

  const attachListeners = useCallback(() => {
    notional?.system.eventEmitter.removeListener(SystemEvents.DATA_REFRESH, updateAllMarkets);
    notional?.system.eventEmitter.on(SystemEvents.DATA_REFRESH, updateAllMarkets);
  }, [notional, updateAllMarkets]);

  useEffect(() => {
    if (notional && notional.system) {
      attachListeners();
      updateAllMarkets();
    }
    return () => {
      if (notional && notional.system && notional.system.eventEmitter) {
        notional.system.eventEmitter.removeListener(SystemEvents.DATA_REFRESH, updateAllMarkets);
      }
    };
  }, [notional, attachListeners, updateAllMarkets]);

  return {
    tableData,
    tableColumns,
  };
};
