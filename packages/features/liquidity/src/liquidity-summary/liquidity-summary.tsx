import { Box, useTheme } from '@mui/material';
import {
  BoxDisplay,
  TradeActionHeader,
  TradeActionTitle,
  PageLoading,
  TradeSummaryContainer,
  H3,
} from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { MobileTradeActionSummary } from '@notional-finance/trade';
import { LiquidityFaq } from './liquidity-faq';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../store/liquidity-context';

export const LiquiditySummary = () => {
  const theme = useTheme();
  const {
    state: { nTokenSymbol, isReady, totalYield, blendedYield, incentiveYield },
  } = useContext(LiquidityContext);

  return (
    <>
      <TradeSummaryContainer>
        {!isReady ? (
          <PageLoading></PageLoading>
        ) : (
          <>
            <Box sx={{ marginLeft: theme.spacing(2) }}>
              <TradeActionHeader
                token={nTokenSymbol || ''}
                actionText={<FormattedMessage defaultMessage={'Mint'} />}
              />

              <TradeActionTitle
                value={totalYield}
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
          <H3 sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage defaultMessage="nToken FAQ" />
          </H3>
          <LiquidityFaq />
        </Box>
      </TradeSummaryContainer>
      {/* @matthew-garrett can we put this entire thing inside the isReady container? */}
      <MobileTradeActionSummary
        tradeAction={NOTIONAL_CATEGORIES.PROVIDE_LIQUIDITY}
        selectedToken={nTokenSymbol || ''}
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
