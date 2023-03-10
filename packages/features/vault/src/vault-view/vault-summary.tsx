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
import {
  VAULT_SUB_NAV_ACTIONS,
  VAULT_ACTIONS,
} from '@notional-finance/shared-config';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  VaultDescription,
  VaultSubNav,
  MobileVaultSummary,
} from '../components';
import { useHistoricalReturns } from '../hooks/use-historical-returns';
import { VaultActionContext } from './vault-action-provider';
import { useReturnDrivers } from '../hooks/use-return-drivers';
import { useVaultCapacity } from '../hooks/use-vault-capacity';
import { usePerformanceChart } from '../hooks/use-performance-chart';
import { VaultParams } from './vault-view';
import { useParams } from 'react-router';
import { messages } from '../messages';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, vaultConfig, primaryBorrowSymbol } = state;
  const { sideDrawerKey } = useParams<VaultParams>();
  const vaultName = vaultConfig?.name;

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
    <Box>
      {sideDrawerKey && (
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
      )}
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
          </TradeSummaryContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default VaultSummary;
