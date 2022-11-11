import { useMemo } from 'react';
import { useRiskThresholds } from '@notional-finance/notionable-hooks';
import {
  IconCell,
  MultiValueCell,
  NegativeValueCell,
} from '@notional-finance/mui';
import {
  formatFiatWithPercent,
  formatNumberAsPercent,
  formatNumber,
} from '@notional-finance/helpers';
import { useCryptoPriceState } from '@notional-finance/notional-web';

export const usePriceRiskTable = () => {
  const riskThresholds = useRiskThresholds();
  const { cryptoPrices } = useCryptoPriceState();
  const fiatKey = 'USD';
  const tableColumns: Record<string, any>[] = useMemo(() => {
    return [
      {
        Header: 'Debt',
        Cell: IconCell,
        accessor: 'debt',
        textAlign: 'left',
      },
      {
        Header: 'Collateral',
        Cell: IconCell,
        accessor: 'collateral',
        textAlign: 'left',
      },
      {
        Header: 'Current Price',
        accessor: 'currentPrice',
        textAlign: 'right',
      },
      {
        Header: '24H %',
        Cell: NegativeValueCell,
        accessor: '24H',
        textAlign: 'right',
      },
      {
        Header: '7D %',
        Cell: NegativeValueCell,
        accessor: '7D',
        textAlign: 'right',
      },
      {
        Header: 'Liquidation Price',
        Cell: MultiValueCell,
        accessor: 'liquidationPrice',
        textAlign: 'right',
      },
      {
        Header: 'Penalty',
        Cell: MultiValueCell,
        accessor: 'penalty',
        textAlign: 'right',
      },
    ];
  }, []);

  const formatNegativeValueCell = (percent: number | undefined) => {
    return !percent || percent === 0
      ? { displayValue: '-' }
      : {
          displayValue: formatNumberAsPercent(percent),
          isNegative: percent < 0,
          displayValueGreen: true,
        };
  };

  const tableData = useMemo(() => {
    if (riskThresholds.liquidationPrices.length) {
      return riskThresholds.liquidationPrices?.map((data) => {
        const cryptoPriceBySymbol = data?.collateralSymbol
          ? cryptoPrices[data?.collateralSymbol.toLocaleLowerCase()]
          : { price: 0, '24H': 0, '7D': 0 };
        return {
          debt: data.debtSymbol,
          collateral: data.collateralSymbol,
          currentPrice:
            cryptoPriceBySymbol && cryptoPriceBySymbol.price > 0
              ? `${formatNumber(cryptoPriceBySymbol?.price, 2)} ${fiatKey}`
              : '-',
          '24H': cryptoPriceBySymbol
            ? formatNegativeValueCell(cryptoPriceBySymbol['24H'])
            : { displayValue: '-' },
          '7D': cryptoPriceBySymbol
            ? formatNegativeValueCell(cryptoPriceBySymbol['7D'])
            : { displayValue: '-' },
          liquidationPrice: formatFiatWithPercent(data.liquidationPrice),
          penalty: formatFiatWithPercent(
            data.totalPenaltyETHValueAtLiquidationPrice
          ),
        };
      });
    }
    return [];
  }, [riskThresholds.liquidationPrices, cryptoPrices]);

  return { tableData, tableColumns };
};
