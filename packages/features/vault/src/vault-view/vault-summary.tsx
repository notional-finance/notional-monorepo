import { Box, useTheme } from '@mui/material';
import {
  DataTable,
  PageLoading,
  SliderDisplay,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { VAULT_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  VaultDescription,
  VaultSubNav,
  MobileVaultSummary,
} from '../components';
import { VaultActionContext } from './vault-action-provider';
import { useReturnDrivers } from '../hooks/use-return-drivers';
import { useVaultCapacity } from '../hooks/use-vault-capacity';
import { messages } from '../messages';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, vaultConfig } = state;
  const vaultName = vaultConfig?.name;
  const { tableColumns, returnDrivers } = useReturnDrivers(vaultAddress);

  const {
    overCapacityError,
    totalCapacityRemaining,
    maxVaultCapacity,
    capacityUsedPercentage,
    capacityWithUserBorrowPercentage,
  } = useVaultCapacity();

  if (!vaultName || !vaultAddress) return <PageLoading />;

  const userCapacityMark = capacityWithUserBorrowPercentage
    ? [
        {
          value: capacityWithUserBorrowPercentage,
          label: '',
          color: overCapacityError
            ? theme.palette.error.main
            : theme.palette.primary.light,
        },
      ]
    : undefined;

  return (
    <Box>
      <Box
        sx={{
          zIndex: 10,
          position: 'fixed',
          maxWidth: '100vw',
          display: {
            xs: 'block',
            sm: 'block',
            md: 'none',
          },
        }}
      >
        <MobileVaultSummary />
      </Box>
      <Box
        sx={{
          display: {
            xs: 'none',
            sm: 'none',
            md: 'block',
          },
        }}
      >
        <VaultSubNav />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(6),
          }}
        >
          <TradeActionSummary state={state}>
            <Box id={VAULT_SUB_NAV_ACTIONS.OVERVIEW}>
              <SliderDisplay
                min={0}
                max={100}
                value={capacityUsedPercentage}
                captionLeft={{
                  title: messages.summary.capacityRemaining,
                  value: totalCapacityRemaining,
                }}
                captionRight={{
                  title: messages.summary.totalCapacity,
                  value: maxVaultCapacity,
                }}
                marks={userCapacityMark}
                sx={{
                  border: overCapacityError
                    ? `2px solid ${theme.palette.error.main}`
                    : theme.shape.borderStandard,
                }}
              />
            </Box>
            <PerformanceChart state={state} />
            <LiquidationChart state={state} />
            <Box id={VAULT_SUB_NAV_ACTIONS.MARKET_RETURNS}>
              <DataTable
                data={returnDrivers}
                columns={tableColumns}
                tableVariant={TABLE_VARIANTS.TOTAL_ROW}
                tableTitle={
                  <div>
                    <FormattedMessage
                      defaultMessage="Return Drivers"
                      description="Return Drivers Table Title"
                    />
                  </div>
                }
              />
            </Box>
            <Box id={VAULT_SUB_NAV_ACTIONS.STRATEGY_DETAILS}>
              <VaultDescription vaultAddress={vaultAddress} />
            </Box>
          </TradeActionSummary>
        </Box>
      </Box>
    </Box>
  );
};

export default VaultSummary;
