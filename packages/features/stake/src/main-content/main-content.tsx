import { Box, useTheme } from '@mui/material';
import {
  TradeActionTitle,
  TradeActionHeader,
  BoxDisplay,
  Faq,
  TradeSummaryContainer,
  H3,
  H4,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';
import { useStakedNoteReturns } from './use-staked-note-returns';

export const MainContent = () => {
  const theme = useTheme();
  const { totalStakedNOTEValueUSD, annualInvestmentRate, stakedNOTEApy } = useStakedNoteReturns();
  return (
    <TradeSummaryContainer>
      <Box sx={{ margin: '0 15px' }}>
        <TradeActionHeader actionText={<FormattedMessage defaultMessage="Stake" />} token="sNOTE" />
        <TradeActionTitle
          title="APY"
          value={stakedNOTEApy}
          valueSuffix="%"
          subtitle={<FormattedMessage {...messages.summary.subtitle} />}
        />
      </Box>
      <Box
        sx={{
          marginTop: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          flexWrap: { xs: 'wrap', sm: 'wrap', md: 'nowrap', lg: 'nowrap', xl: 'nowrap' },
        }}
      >
        <BoxDisplay
          title={<FormattedMessage {...messages.summary.totalStakedNoteValue} />}
          value={totalStakedNOTEValueUSD}
          symbol={'USD'}
          valuePrefix={'$'}
          decimals={0}
        />
        <BoxDisplay
          title={<FormattedMessage {...messages.summary.annualRewardRate} />}
          value={annualInvestmentRate}
          symbol={'USD'}
          valuePrefix={'$'}
          decimals={0}
        />
      </Box>
      <Box
        sx={{
          marginTop: '6rem',
          maxWidth: '800px',
          paddingBottom: {
            xs: '50px',
            sm: '50px',
            md: '200px',
            lg: '200px',
            xl: '200px',
          },
          marginRight: '15px',
          marginLeft: '15px',
        }}
      >
        <H3 gutter="default">
          <FormattedMessage {...messages.summary.faqHeading} />
        </H3>
        <H4
          accent
          marginBottom={theme.spacing(4)}
          href="https://docs.notional.finance/notional-v2/governance/note-staking"
        >
          <FormattedMessage {...messages.summary.moreFAQ} />
        </H4>
        {messages.faq.map(({ question, answer }) => {
          return (
            <Faq
              question={<FormattedMessage {...question} />}
              answer={<FormattedMessage {...answer} />}
            />
          );
        })}
      </Box>
    </TradeSummaryContainer>
  );
};
