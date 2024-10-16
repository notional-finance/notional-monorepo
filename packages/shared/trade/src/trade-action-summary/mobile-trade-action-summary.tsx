import { useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { PRODUCTS } from '@notional-finance/util';
import { H5, LargeInputTextEmphasized, CountUp } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { messages } from './messages';
import {
  BaseTradeState,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';

interface MobileTradeActionSummaryProps {
  tradeAction: PRODUCTS;
  selectedToken?: string;
  state: BaseTradeState;
}

export function MobileTradeActionSummary({
  tradeAction,
  selectedToken,
  state,
}: MobileTradeActionSummaryProps) {
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { debt, collateralOptions, collateral, debtOptions } = state;
  const currentNetworkStore = useCurrentNetworkStore();
  const nonLeveragedYields = currentNetworkStore.getAllNonLeveragedYields();

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate || nonLeveragedYield?.apy.totalAPY;
  const debtAPY =
    debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === debt?.id)?.apy.totalAPY;
  const totalAPY = assetAPY !== undefined ? assetAPY : debtAPY;

  return (
    <Container>
      <Box
        sx={{
          width: '90%',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon
            symbol={selectedToken || ''}
            size="large"
            style={{
              marginRight: theme.spacing(1),
              boxShadow: theme.shape.shadowStandard,
              borderRadius: '50px',
            }}
          />
          <LargeInputTextEmphasized>{selectedToken}</LargeInputTextEmphasized>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <H5>
              <FormattedMessage {...messages[tradeAction].returnType} />
            </H5>
            <LargeInputTextEmphasized sx={{ flex: 1 }}>
              <CountUp value={totalAPY || 0} suffix="%" decimals={2} />
            </LargeInputTextEmphasized>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

const Container = styled(Box)(
  ({ theme }) => `
    display: none;
    ${theme.breakpoints.down('sm')} {
      box-shadow: ${theme.shape.shadowStandard};
      display: flex;
      background: white;
      width: 100vw;
      position: fixed;
      height: ${theme.spacing(10)};
      top: 74px;
      z-index: 3;
    }
    `
);
