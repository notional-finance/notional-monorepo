import { Box, useTheme } from '@mui/material';
import {
  DataTable,
  PageLoading,
  SliderDisplay,
  TradeActionHeader,
  TradeActionTitle,
  TradeSummaryContainer,
  AreaChart,
} from '@notional-finance/mui';
import { useVault } from '@notional-finance/notionable-hooks';
import { VAULT_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';
import { useContext } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import { VaultDescription, VaultSubNav } from '../components';
import { useHistoricalReturns } from '../hooks/use-historical-returns';
import { VaultActionContext } from './vault-action-provider';
import { useReturnDrivers } from '../hooks/use-return-drivers';
import { useVaultCapacity } from '../hooks/use-vault-capacity';
import { usePerformanceChart } from '../hooks/use-performance-chart';
import { messages } from '../messages';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, vaultConfig } = state || {};

  const vaultName = vaultConfig?.name;

  const { primaryBorrowSymbol } = useVault(vaultAddress);

  const { returnDrivers, headlineApy } = useHistoricalReturns();
  const { areaChartData, areaHeaderData, chartToolTipData } =
    usePerformanceChart();

  const tableColumns = useReturnDrivers();
  const {
    overCapacityError,
    totalCapacityUsed,
    maxVaultCapacity,
    capacityUsedPercentage,
    capacityWithUserBorrowPercentage,
  } = useVaultCapacity();

  if (!vaultName || !primaryBorrowSymbol || !vaultAddress)
    return <PageLoading />;

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
    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
      <VaultSubNav />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: theme.spacing(6),
        }}
      >
        <TradeSummaryContainer>
          <Box id={VAULT_SUB_NAV_ACTIONS.OVERVIEW}>
            <TradeActionHeader
              token={primaryBorrowSymbol}
              actionText={vaultName}
              hideTokenName
            />
            <TradeActionTitle
              value={headlineApy}
              valueSuffix="%"
              title={<FormattedMessage {...messages.summary.expectedYield} />}
            />

            <SliderDisplay
              min={0}
              max={100}
              value={capacityUsedPercentage}
              captionLeft={{
                title: messages.summary.capacityUsed,
                value: totalCapacityUsed,
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
            <AreaChart
              areaChartData={areaChartData}
              areaHeaderData={areaHeaderData}
              chartToolTipData={chartToolTipData}
            />
          </Box>
          <Box
            sx={{ marginTop: theme.spacing(2) }}
            id={VAULT_SUB_NAV_ACTIONS.MARKET_RETURNS}
          >
            <DataTable
              data={returnDrivers}
              columns={tableColumns}
              tableTitle={defineMessage({
                defaultMessage: 'Return Drivers',
                description: 'Return Drivers Table Title',
              })}
            />
          </Box>
          <Box id={VAULT_SUB_NAV_ACTIONS.STRATEGY_DETAILS}>
            <VaultDescription vaultAddress={vaultAddress} />
          </Box>
        </TradeSummaryContainer>
      </Box>
    </Box>
  );
};

export default VaultSummary;
