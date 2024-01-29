import { useTheme, Box } from '@mui/material';
import { Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';

export const RealizedApyFaq = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        div: {
          fontSize: '14px',
          fontWeight: 500,
        },
      }}
    >
      <Body sx={{ marginBottom: theme.spacing(1) }}>
        <FormattedMessage
          defaultMessage={`Realized APY is calculated using the <a>IRR calculation.</a> The realized APY measures how much money you made relative to the money you started with and in what amount of time.`}
          values={{
            a: (chunk: React.ReactNode) => (
              <Box
                sx={{ color: colors.neonTurquoise }}
                href="https://www.investopedia.com/terms/i/irr.asp"
                component={'a'}
                target="_blank"
              >
                {chunk}
              </Box>
            ),
          }}
        />
      </Body>
      <Body>
        <span>● </span>
        <FormattedMessage
          defaultMessage={
            'Realized APY ignores the starting size of your account. $100 profit on $1,000 is the same realized APY as $1,000 profit on $10,000'
          }
        />
      </Body>
      <Body>
        <span>● </span>
        <FormattedMessage
          defaultMessage={
            'Realized APY rewards you for making money quickly. The realized APY for a user that makes $100 on $1,000 in one week is roughly twice as high as the user who makes $100 on $1,000 in two weeks.'
          }
        />
      </Body>
      <Body>
        <span>● </span>
        <FormattedMessage
          defaultMessage={
            'Realized APY can not be gamed or affected by making deposits or withdrawals.'
          }
        />
      </Body>
    </Box>
  );
};

export default RealizedApyFaq;
