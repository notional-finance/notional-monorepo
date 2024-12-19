import { Box, useTheme } from '@mui/material';
import { H5, LargeInputTextEmphasized, CountUp } from '@notional-finance/mui';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useVaultNameInfo } from '../hooks';

export const MobileVaultSummary = () => {
  const theme = useTheme();
  const { primaryBorrowCurrency, name } = useVaultNameInfo() ?? {};
  // TODO: refactor this to get it from the trade action summary
  const headlineApy = undefined;

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        minWidth: '100vw',
        position: 'fixed',
        padding: theme.spacing(3, 2, 2, 2),
        boxShadow: theme.shape.shadowStandard,
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1 }}>
          <H5 sx={{ whiteSpace: 'nowrap' }}>{name}</H5>
          {primaryBorrowCurrency && (
            <LargeInputTextEmphasized
              sx={{ flex: 1, display: 'flex', alignItems: 'center' }}
            >
              {primaryBorrowCurrency}
              <TokenIcon
                symbol={primaryBorrowCurrency}
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
    </Box>
  );
};

export default MobileVaultSummary;
