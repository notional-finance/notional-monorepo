import { useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import {
  PageLoading,
  H5,
  LargeInputTextEmphasized,
  CountUp,
  H4,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useNotional } from '@notional-finance/notionable-hooks';
import { TokenIcon } from '@notional-finance/icons';
import { messages } from './messages';

interface MobileTradeActionSummaryProps {
  tradeAction: NOTIONAL_CATEGORIES;
  selectedToken: string;
  dataPointOne: number | undefined;
  dataPointOnePrefix?: string;
  dataPointOneSuffix: string;
  dataPointTwo: number | undefined;
  dataPointTwoPrefix?: string;
  dataPointTwoSuffix: string;
  fixedAPY: number | undefined;
}

export function MobileTradeActionSummary({
  tradeAction,
  selectedToken,
  dataPointOne,
  dataPointOnePrefix,
  dataPointOneSuffix,
  dataPointTwo,
  dataPointTwoPrefix,
  dataPointTwoSuffix,
  fixedAPY,
}: MobileTradeActionSummaryProps) {
  const theme = useTheme();
  const { loaded } = useNotional();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!loaded || !selectedToken) return <PageLoading />;

  return (
    <Container>
      <Box
        sx={{
          background: theme.palette.background.paper,
          width: '100%',
          padding: theme.spacing(3, 2),
          boxShadow: theme.shape.shadowStandard,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <H5>
              <FormattedMessage {...messages[tradeAction].returnType} />
            </H5>
            <LargeInputTextEmphasized sx={{ flex: 1 }}>
              <CountUp value={fixedAPY} suffix="% APY" decimals={2} />
            </LargeInputTextEmphasized>
          </Box>
          <TokenIcon
            symbol={selectedToken}
            size="large"
            style={{
              borderRadius: '50%',
              boxShadow: theme.shape.shadowStandard,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', marginTop: theme.spacing(3) }}>
          <Box sx={{ flex: 1 }}>
            <H5>
              <FormattedMessage {...messages[tradeAction].dataPointOneTitle} />
            </H5>
            <H4 sx={{ flex: 1 }}>
              <CountUp
                value={dataPointOne}
                prefix={dataPointOnePrefix}
                suffix={`${dataPointOneSuffix}`}
                decimals={2}
              />
            </H4>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <H5>
              <FormattedMessage {...messages[tradeAction].dataPointTwoTitle} />
            </H5>
            <H4 sx={{ flex: 1 }}>
              <CountUp
                value={dataPointTwo}
                prefix={dataPointTwoPrefix}
                suffix={`${dataPointTwoSuffix}`}
                decimals={2}
              />
            </H4>
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
      position: fixed;
      display: flex;
      z-index: 3;
    }
    `
);
