import {
  ArrowChangeCell,
  DataTableColumn,
  DisplayCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  useCurrentLiquidationPrices,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export const useLiquidationRisk = () => {
  const network = useSelectedNetwork();
  const { exchangeRateRisk, assetPriceRisk } =
    useCurrentLiquidationPrices(network);
  const Columns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Exchange Rate"
            description={'Exchange Rate column header'}
          />
        ),
        cell: MultiValueIconCell,
        accessorKey: 'exchangeRate',
        expandableTable: true,
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Liquidation Price"
            description={'column header'}
          />
        ),
        cell: DisplayCell,
        accessorKey: 'liquidationPrice',
        expandableTable: true,
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Current Price"
            description={'column header'}
          />
        ),
        cell: DisplayCell,
        accessorKey: 'currentPrice',
        expandableTable: true,
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="24H %"
            description={'column header'}
          />
        ),
        cell: ArrowChangeCell,
        accessorKey: 'oneDayChange',
        expandableTable: true,
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="7D %"
            description={'column header'}
          />
        ),
        cell: ArrowChangeCell,
        accessorKey: 'sevenDayChange',
        expandableTable: true,
        textAlign: 'right',
      },
    ],
    []
  );

  return {
    liquidationRiskColumns: Columns,
    liquidationRiskData: [...exchangeRateRisk, ...assetPriceRisk],
    initialLiquidationState: {
      clickDisabled: true,
    },
  };
};
