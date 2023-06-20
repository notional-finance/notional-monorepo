import { Box, useTheme } from '@mui/material';
import {
  BoxDisplay,
  TradeActionHeader,
  TradeActionTitle,
  PageLoading,
  TradeSummaryContainer,
  H2,
} from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { MobileTradeActionSummary } from '@notional-finance/trade';
import { LiquidityFaq } from './liquidity-faq';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../liquidity-action';

export const LiquiditySummary = () => {
  const theme = useTheme();
  const {
    state: { collateral, isReady },
  } = useContext(LiquidityContext);

  const totalYield = 0;
  const blendedYield = 0;
  const incentiveYield = 0;

  return (
    <>
      <TradeSummaryContainer>
        {!isReady ? (
          <PageLoading />
        ) : (
          <>
            <Box sx={{ marginLeft: theme.spacing(2) }}>
              <TradeActionHeader
                token={collateral?.symbol || ''}
                actionText={<FormattedMessage defaultMessage={'Mint'} />}
              />

              <TradeActionTitle
                value={0}
                valueSuffix="%"
                title={<FormattedMessage defaultMessage="Total APY" />}
              />
            </Box>
            <Box
              sx={{
                marginTop: theme.spacing(5),
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                flexWrap: {
                  xs: 'wrap',
                  sm: 'wrap',
                  md: 'nowrap',
                  lg: 'nowrap',
                  xl: 'nowrap',
                },
              }}
            >
              <BoxDisplay
                title={<FormattedMessage defaultMessage="Variable APY" />}
                value={blendedYield}
                symbol={<FormattedMessage defaultMessage="APY" />}
                nonValueDisplay="0.00%"
                valueSuffix="%"
              />

              <BoxDisplay
                title={
                  <FormattedMessage defaultMessage="NOTE Incentive Yield" />
                }
                value={incentiveYield}
                symbol={<FormattedMessage defaultMessage="APY" />}
                nonValueDisplay="0.00%"
                valueSuffix="%"
              />
            </Box>
          </>
        )}
        <Box
          sx={{
            margin: theme.spacing(12, 2),
          }}
        >
          <H2 sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage defaultMessage="Provide Liquidity FAQ" />
          </H2>
          <LiquidityFaq />
        </Box>
      </TradeSummaryContainer>
      <MobileTradeActionSummary
        tradeAction={NOTIONAL_CATEGORIES.PROVIDE_LIQUIDITY}
        selectedToken={collateral?.symbol || ''}
        dataPointOne={blendedYield}
        dataPointOneSuffix="% APY"
        dataPointTwo={incentiveYield}
        dataPointTwoSuffix="% APY"
        fixedAPY={totalYield}
      />
    </>
  );
};

export default LiquiditySummary;
