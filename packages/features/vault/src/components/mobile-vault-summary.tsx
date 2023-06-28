import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  H5,
  LargeInputTextEmphasized,
  CountUp,
  SliderBasic,
} from '@notional-finance/mui';
import { useHistoricalReturns } from '../hooks/use-historical-returns';
import { useVaultCapacity } from '../hooks/use-vault-capacity';
import { TokenIcon } from '@notional-finance/icons';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { FormattedMessage } from 'react-intl';

export const MobileVaultSummary = () => {
  const theme = useTheme();
  const {
    state: { deposit, vaultConfig },
  } = useContext(VaultActionContext);
  const vaultName = vaultConfig?.name;
  const { headlineApy } = useHistoricalReturns();
  const { maxVaultCapacity, capacityUsedPercentage } = useVaultCapacity();

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        minWidth: '100vw',
        position: 'fixed',
        padding: theme.spacing(3, 2, 0, 2),
        boxShadow: theme.shape.shadowStandard,
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1 }}>
          <H5 sx={{ whiteSpace: 'nowrap' }}>{vaultName}</H5>
          {deposit && (
            <LargeInputTextEmphasized
              sx={{ flex: 1, display: 'flex', alignItems: 'center' }}
            >
              {deposit.symbol}
              <TokenIcon
                symbol={deposit.symbol}
                size="large"
                style={{
                  marginLeft: theme.spacing(2),
                  borderRadius: '50%',
                  boxShadow: theme.shape.shadowStandard,
                }}
              />
            </LargeInputTextEmphasized>
          )}
        </Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <H5>
            <FormattedMessage defaultMessage={'Current Yield'} />
          </H5>

          <LargeInputTextEmphasized sx={{ flex: 1 }}>
            <CountUp value={headlineApy || 0} suffix="% APY" decimals={2} />
          </LargeInputTextEmphasized>
        </Box>
      </Box>
      <Box sx={{ marginTop: theme.spacing(2) }}>
        <Box sx={{ display: 'flex' }}>
          <H5 sx={{ whiteSpace: 'nowrap', flex: 1 }}>
            <FormattedMessage {...messages.summary.totalCapacity} />
          </H5>
          <H5
            sx={{
              flex: 1,
              textAlign: 'right',
              color: theme.palette.typography.main,
            }}
          >
            {maxVaultCapacity}
          </H5>
        </Box>
        <SliderBasic
          min={0}
          max={100}
          step={0.01}
          value={capacityUsedPercentage}
          disabled={true}
          hideThumb={true}
          sx={{
            height: theme.spacing(5),
            padding: '0px',
            marginBottom: '0px',
          }}
        />
      </Box>
    </Box>
  );
};

export default MobileVaultSummary;
