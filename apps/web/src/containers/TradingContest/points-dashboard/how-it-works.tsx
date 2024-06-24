import { FormattedMessage } from 'react-intl';
import { SectionTitle } from '../components';
import { Faq, FaqHeader } from '@notional-finance/mui';
import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { usePointsFaq } from './hooks';

export const HowItWorks = () => {
  const theme = useTheme();
  const faqData = usePointsFaq();
  return (
    <Box
      sx={{ maxWidth: '850px', margin: 'auto', paddingTop: theme.spacing(4) }}
    >
      <SectionTitle
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(6) }}
      >
        <FormattedMessage defaultMessage={'How It Works'} />
      </SectionTitle>
      <Text>
        <FormattedMessage
          defaultMessage={
            'The ARB points program will distribute 175,000 ARB to Notional users between June 24th and September 16th.'
          }
        />
      </Text>
      <SectionTitle
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(6) }}
      >
        <FormattedMessage defaultMessage={'Seasons'} />
      </SectionTitle>
      <Text>
        <FormattedMessage
          defaultMessage={
            'The ARB Points Program gives ARB rewards to Notional users over three seasons. All points earned in a season will be converted to ARB tokens at the same rate and ARB will be airdropped to users at the end of each season. '
          }
        />
      </Text>
      <Text>
        <FormattedMessage
          defaultMessage={
            'At the beginning of a new season, all point balances will be reset to zero and users will earn new points that count toward the airdrop at the end of that season.'
          }
        />
      </Text>
      <SectionTitle
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(6) }}
      >
        <FormattedMessage defaultMessage={'Qualifying Products'} />
      </SectionTitle>
      <Text>
        <FormattedMessage
          defaultMessage={
            'The ARB points program is focused on lenders, borrowers, and leveraged vault users. Users earn points based on the dollar value of their positions and the boost of the product they’re using. Users earn one point per dollar, per day, multiplied by the product boost.'
          }
        />
      </Text>
      <Text>
        <FormattedMessage
          defaultMessage={
            'For example, if a user is lending 100 USDC at a variable rate and that product has a 3x boost, they will earn 300 points per day.'
          }
        />
      </Text>
      <SectionTitle
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(6) }}
      >
        <FormattedMessage defaultMessage={'Product Boosts'} />
      </SectionTitle>
      <Text>
        <FormattedMessage
          defaultMessage={
            'Different products have different boosts. The higher the product boost, the more points you earn for using that product. A 1x boost means that you earn 1 point per dollar held in that product per day. A 5x boost means that you earn 5 points per dollar held in that product per day.'
          }
        />
      </Text>
      <Text>
        <FormattedMessage
          defaultMessage={
            'See the boost for each product on the “qualifying products” page.'
          }
        />
      </Text>
      <SectionTitle
        sx={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(6) }}
      >
        <FormattedMessage
          defaultMessage={'Excluded Activity: Single-Currency Leverage'}
        />
      </SectionTitle>
      <Text>
        <FormattedMessage
          defaultMessage={
            'If a user lends or provides liquidity in a currency and borrows in the same currency, they will earn <a1>zero</a1> points for their lending or borrowing in that currency. They will still earn points for other products they’re using.'
          }
          values={{
            a1: (msg: React.ReactNode) => (
              <Box component="span" sx={{ fontWeight: 600 }}>
                {msg}
              </Box>
            ),
          }}
        />
      </Text>
      <Box>
        <FaqHeader
          sx={{ h2: { fontWeight: 600 } }}
          title={<FormattedMessage defaultMessage={'FAQ'} />}
        />
        {faqData.map(({ question, answer, componentAnswer }, index) => (
          <Faq
            key={index}
            question={question}
            answer={answer}
            componentAnswer={componentAnswer}
            sx={{
              marginBottom: theme.spacing(2),
              boxShadow: theme.shape.shadowStandard,
              h4: {
                fontSize: '16px',
                fontWeight: 600,
              },
              '#faq-body': {
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const Text = styled(Box)(
  ({ theme }) => `
  font-family: Avenir Next;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${colors.greenGrey};
  margin-bottom: ${theme.spacing(3)};
  `
);

export default HowItWorks;
