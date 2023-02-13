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
import { useContext } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import CustomTooltip from '../components/custom-tool-tip';
import VaultDescription from '../components/vault-description';
import { useHistoricalReturns } from '../hooks/use-historical-returns';
import { useReturnDrivers } from '../hooks/use-return-drivers';
import { useVaultCapacity } from '../hooks/use-vault-capacity';
import { usePerformanceChart } from '../hooks/use-performance-chart';
import { VaultActionContext } from '../managers';
import { messages } from '../messages';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { vaultAddress } = state || {};
  const { primaryBorrowSymbol, vaultName } = useVault(vaultAddress);
  const { returnDrivers, headlineApy } = useHistoricalReturns();
  const { areaChartData, areaHeaderData } = usePerformanceChart();

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
    <TradeSummaryContainer>
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
        areaHeaderData={areaHeaderData}
        areaChartData={areaChartData}
        CustomTooltip={CustomTooltip}
      />
      <Box sx={{ marginTop: theme.spacing(2) }}>
        <DataTable
          data={returnDrivers}
          columns={tableColumns}
          tableTitle={defineMessage({
            defaultMessage: 'Return Drivers',
            description: 'Return Drivers Table Title',
          })}
        />
      </Box>
      <VaultDescription vaultAddress={vaultAddress} />
    </TradeSummaryContainer>
  );
};

export default VaultSummary;
