import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { TradeState } from '@notional-finance/notionable';
import {
  useAccountReady,
  usePortfolioLiquidationRisk,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const LiquidationRisk = ({ state }: { state: TradeState }) => {
  const isAccountReady = useAccountReady();
  const { tradeType } = state;
  const { onlyCurrent, priorAccountNoRisk, postAccountNoRisk, tableData } =
    usePortfolioLiquidationRisk(state);
  const columns: any[] = [
    {
      Header: <FormattedMessage defaultMessage={'Detail'} />,
      accessor: 'label',
      textAlign: 'left',
    },
    {
      Header: <FormattedMessage defaultMessage={'Current'} />,
      accessor: 'current',
      textAlign: 'right',
    },
  ];

  if (!onlyCurrent) {
    columns.push({
      Header: <FormattedMessage defaultMessage={'Updated'} />,
      Cell: ArrowIndicatorCell,
      accessor: 'updated',
      textAlign: 'right',
    });
  }

  if (
    (priorAccountNoRisk || !isAccountReady) &&
    (tradeType === 'Deposit' ||
      tradeType === 'LendFixed' ||
      tradeType === 'LendVariable' ||
      tradeType === 'MintNToken')
  ) {
    // Don't show the risk table for these pages
    return null;
  } else if (priorAccountNoRisk && postAccountNoRisk) {
    return null;
  } else if (priorAccountNoRisk) {
    // Show state zero
    <DataTable
      tableVariant={TABLE_VARIANTS.MINI}
      tableTitle={<FormattedMessage defaultMessage={'Liquidation Risk'} />}
      stateZeroMessage={
        <FormattedMessage
          defaultMessage={'Input parameters to see your liquidation risk.'}
        />
      }
      data={[]}
      columns={columns}
    />;
  }

  return (
    <DataTable
      tableVariant={TABLE_VARIANTS.MINI}
      tableTitle={<FormattedMessage defaultMessage={'Liquidation Risk'} />}
      stateZeroMessage={
        <FormattedMessage
          defaultMessage={'Input parameters to see your liquidation risk.'}
        />
      }
      data={
        onlyCurrent
          ? tableData
          : tableData.map(
              ({ label, current, updated, changeType, greenOnArrowUp }) => {
                return {
                  label,
                  current,
                  updated: {
                    value: updated,
                    arrowUp: changeType === 'increase',
                    checkmark: changeType === 'cleared',
                    greenOnCheckmark: true,
                    greenOnArrowUp,
                  },
                };
              }
            )
      }
      columns={columns}
    />
  );
};
