import { Box, useTheme } from '@mui/material';
import { DataTable, ErrorMessage, TABLE_VARIANTS } from '@notional-finance/mui';
import { VaultTradeState } from '@notional-finance/notionable';
import { useVaultLiquidationRisk } from '@notional-finance/notionable-hooks';
import { tradeErrors } from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';

export const CreateVaultLiquidationRisk = ({
  state,
}: {
  state: VaultTradeState;
}) => {
  const theme = useTheme();
  const { tableData, tooRisky, postAccountNoRisk } =
    useVaultLiquidationRisk(state);
  const columns: any[] = [
    {
      header: <FormattedMessage defaultMessage={'Detail'} />,
      accessorKey: 'label',
      textAlign: 'left',
    },
    {
      header: <FormattedMessage defaultMessage={'Current'} />,
      accessorKey: 'current',
      textAlign: 'right',
    },
  ];

  if (postAccountNoRisk) {
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
            <FormattedMessage {...tradeErrors.leverageLiquidationRiskMsg} />
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
        data={tableData.map(({ label, updated }) => ({
          label,
          current: updated,
        }))}
        columns={columns}
      />
    </Box>
  );
};
