import { Box, useTheme } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  ErrorMessage,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { TradeState } from '@notional-finance/notionable';
import {
  useAccountReady,
  usePortfolioLiquidationRisk,
} from '@notional-finance/notionable-hooks';
import { tradeErrors } from '../../tradeErrors';
import { FormattedMessage } from 'react-intl';

export const LiquidationRisk = ({ state }: { state: TradeState }) => {
  const theme = useTheme();
  const { tradeType, inputsSatisfied, calculationSuccess, selectedNetwork } =
    state;
  const isAccountReady = useAccountReady(selectedNetwork);
  const {
    onlyCurrent,
    priorAccountNoRisk,
    postAccountNoRisk,
    tableData,
    tooRisky,
  } = usePortfolioLiquidationRisk(state);
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
    // If showing updated values, but the prior account has no risk then
    // remove the "current" column to reduce the "noisiness" of the table
    if (priorAccountNoRisk) columns.pop();

    columns.push({
      Header: <FormattedMessage defaultMessage={'Updated'} />,
      Cell: ArrowIndicatorCell,
      tooRisky,
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
  } else if (
    !isAccountReady &&
    (tradeType === 'BorrowFixed' || tradeType === 'BorrowVariable')
  ) {
    // Don't show liquidation risk on borrow pages if the account is not connected, it has
    // no meaning without collateral information
    return null;
  } else if (priorAccountNoRisk && postAccountNoRisk) {
    return null;
  } else if (!inputsSatisfied || !calculationSuccess) {
    // Show state zero
    return (
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
      />
    );
  }

  return (
    <Box>
      {tooRisky && (
        <ErrorMessage
          variant="error"
          title={<FormattedMessage {...tradeErrors.liquidationRisk} />}
          message={
            tradeType === 'BorrowFixed' || tradeType === 'BorrowVariable' ? (
              <FormattedMessage {...tradeErrors.borrowLiquidationRiskMsg} />
            ) : (
              <FormattedMessage {...tradeErrors.leverageLiquidationRiskMsg} />
            )
          }
          marginBottom
        />
      )}
      <DataTable
        sx={{
          border: tooRisky
            ? `1px solid ${theme.palette.error.main}`
            : theme.shape.borderStandard,
        }}
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
    </Box>
  );
};
