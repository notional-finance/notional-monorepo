import { Box, Typography } from '@mui/material';
import {
  BoxDisplay,
  TradeActionHeader,
  TradeActionTitle,
  PageLoading,
  TradeSummaryContainer,
} from '@notional-finance/mui';
import { LiquidityFaq } from './liquidity-faq';
import { FormattedMessage } from 'react-intl';
import { useLiquidity } from '../store/use-liquidity';

export const LiquiditySummary = () => {
  const { nTokenSymbol, loading, totalYield, blendedYield, incentiveYield } = useLiquidity();

  return (
    <TradeSummaryContainer>
      {loading ? (
        <PageLoading></PageLoading>
      ) : (
        <>
          <Box sx={{ marginLeft: '15px' }}>
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
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: { xs: 'wrap', sm: 'wrap', md: 'nowrap', lg: 'nowrap', xl: 'nowrap' },
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
              title={<FormattedMessage defaultMessage="NOTE Incentive Yield" />}
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
          margin: '100px 12px',
        }}
      >
        <Typography variant="h3" sx={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          <FormattedMessage defaultMessage="nToken FAQ" />
        </Typography>
        <LiquidityFaq />
      </Box>
    </TradeSummaryContainer>
  );
};

export default LiquiditySummary;
