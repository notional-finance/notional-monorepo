import { SystemEvents, Currency } from '@notional-finance/sdk';
import { NTokenValue, Market } from '@notional-finance/sdk/src/system';
import { useNotional } from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useState } from 'react';
import { IconCell } from '../../data-table-cells';
import { FormattedMessage } from 'react-intl';

interface CurrencyDataProps extends Currency {
  currency: {
    underlyingSymbol: string;
  };
  blendedYield: number;
  incentiveYield: number;
  totalYield: number;
}

export const useLiquidityProviderTable = () => {
  const { notional } = useNotional();
  const [tableData, setTableData] = useState([]);

  const tableColumns = [
    {
      Header: <FormattedMessage defaultMessage="Currency" description={'Currency Header'} />,
      accessor: 'currency',
      Cell: IconCell,
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Variable Rate" description={'Variable Rate Header'} />
      ),
      accessor: 'variableRate',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="NOTE Incentives" description={'NOTE Incentives Header'} />
      ),
      accessor: 'noteIncentives',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Total Return" description={'Total Return Header'} />
      ),
      accessor: 'totalReturn',
      textAlign: 'right',
    },
  ];

  const formatInterestRate = (rate: number) => {
    const formatted = Market.formatInterestRate(rate);
    if (formatted === '') return '0.000%';
    return formatted;
  };

  const formatTableData = useCallback(
    (currencyData) =>
      currencyData.map((d: CurrencyDataProps) => {
        return {
          currency: d.currency.underlyingSymbol,
          variableRate: formatInterestRate(d.blendedYield),
          noteIncentives: formatInterestRate(d.incentiveYield),
          totalReturn: formatInterestRate(d.totalYield),
        };
      }),
    []
  );

  const handleDataRefresh = useCallback(() => {
    const currencies = (notional?.system.getTradableCurrencies() as CurrencyDataProps[]) ?? [];
    const currencyData = currencies
      .filter((filterData) => !!notional?.system.getNToken(filterData.id))
      .map((mapData) => {
        const blendedYield = NTokenValue.getNTokenBlendedYield(mapData.id);
        const incentiveYield = NTokenValue.getNTokenIncentiveYield(mapData.id);
        const totalYield = blendedYield + incentiveYield;

        return {
          currency: mapData,
          blendedYield,
          incentiveYield,
          totalYield,
        };
      });
    setTableData(formatTableData(currencyData));
  }, [setTableData, formatTableData, notional]);

  const attachListeners = useCallback(() => {
    notional?.system.eventEmitter.removeListener(SystemEvents.DATA_REFRESH, handleDataRefresh);
    notional?.system.eventEmitter.on(SystemEvents.DATA_REFRESH, handleDataRefresh);
  }, [notional, handleDataRefresh]);

  useEffect(() => {
    if (notional && notional.system) {
      attachListeners();
      handleDataRefresh();
    }
    return () => {
      if (notional && notional.system && notional.system.eventEmitter) {
        notional.system.eventEmitter.removeListener(SystemEvents.DATA_REFRESH, handleDataRefresh);
      }
    };
  }, [notional, attachListeners, handleDataRefresh]);

  return {
    tableColumns,
    tableData,
  };
};
