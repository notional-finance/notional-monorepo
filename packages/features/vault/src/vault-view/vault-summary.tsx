import { Box, useTheme } from '@mui/material';
import {
  DataTable,
  PageLoading,
  SliderDisplay,
  TradeActionHeader,
  TradeActionTitle,
  TradeSummaryContainer,
} from '@notional-finance/mui';
import { useVault } from '@notional-finance/notionable-hooks';
import { useContext } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import { PerformanceChart, VaultDescription, VaultSubNav } from '../components';
import { useHistoricalReturns } from '../hooks/use-historical-returns';
import { useReturnDrivers } from '../hooks/use-return-drivers';
import { useVaultCapacity } from '../hooks/use-vault-capacity';
import { VaultActionContext } from '../managers';
import { messages } from '../messages';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, leverageRatio } = state || {};
  const { primaryBorrowSymbol, vaultName } = useVault(vaultAddress);
  const { historicalReturns, currentBorrowRate, returnDrivers, headlineApy } =
    useHistoricalReturns();
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
      <VaultSubNav />
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}
      >
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
          <PerformanceChart
            historicalReturns={historicalReturns}
            leverageRatio={leverageRatio}
            currentBorrowRate={currentBorrowRate}
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
      </Box>
    </Box>
  );
};

export default VaultSummary;
