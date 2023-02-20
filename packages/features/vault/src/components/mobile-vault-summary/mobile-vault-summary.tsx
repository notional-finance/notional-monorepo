import { useContext } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import {
  H5,
  LargeInputTextEmphasized,
  CountUp,
  SliderBasic,
} from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { useVault } from '@notional-finance/notionable-hooks';
import { useHistoricalReturns } from '../../hooks/use-historical-returns';
// import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useVaultCapacity } from '../../hooks/use-vault-capacity';
import { TokenIcon } from '@notional-finance/icons';
import { VaultActionContext } from '../../managers';
import { messages } from '../../side-drawers/messages';
import { FormattedMessage } from 'react-intl';

export const MobileVaultSummary = () => {
  const theme = useTheme();
  const {
    state: { vaultAddress },
  } = useContext(VaultActionContext);
  const { primaryBorrowSymbol, vaultName } = useVault(vaultAddress);
  const { headlineApy } = useHistoricalReturns();
  const {
    // overCapacityError,
    maxVaultCapacity,
    capacityUsedPercentage,
    // capacityWithUserBorrowPercentage,
  } = useVaultCapacity();

  // const { clearSideDrawer } = useSideDrawerManager();

  // const handleDrawer = () => {
  //   clearSideDrawer(`/vaults/${vaultAddress}`);
  // };

  // const userCapacityMark = capacityWithUserBorrowPercentage
  //   ? [
  //       {
  //         value: capacityWithUserBorrowPercentage,
  //         label: '',
  //         color: overCapacityError
  //           ? theme.palette.error.main
  //           : theme.palette.primary.light,
  //       },
  //     ]
  //   : undefined;

  return (
    <Container>
      <Box
        sx={{
          background: theme.palette.background.paper,
          width: '100%',
          padding: theme.spacing(3, 2, 0, 2),
          boxShadow: theme.shape.shadowStandard,
        }}
      >
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <H5 sx={{ whiteSpace: 'nowrap' }}>{vaultName}</H5>
            {primaryBorrowSymbol && (
              <LargeInputTextEmphasized
                sx={{ flex: 1, display: 'flex', alignItems: 'center' }}
              >
                {primaryBorrowSymbol}
                <TokenIcon
                  symbol={primaryBorrowSymbol}
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
            sx={{
              height: '40px',
              padding: '0px',
              marginBottom: '0px',
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default MobileVaultSummary;

const Container = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    display: flex;
    min-width: 100vw;
    top: 50;
    position: fixed;
    left: 0;
    z-index: 999999;
  }
`
);
