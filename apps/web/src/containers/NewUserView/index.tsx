import { Box, styled, useTheme } from '@mui/material';
import { Body, H1 } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import rocket from './rocket.svg';

export const NewUserView = () => {
  const theme = useTheme();
  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '120px', height: '120px' }}>
          <img src={rocket} alt="rocket" />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: theme.spacing(4),
          }}
        >
          <H1>
            <FormattedMessage defaultMessage={'Newcomer'} />
          </H1>
          <H1>
            <FormattedMessage defaultMessage={'Starter Boost'} />
          </H1>
        </Box>
      </Box>

      <Body
        sx={{ fontSize: '20px', width: '620px', marginTop: theme.spacing(4) }}
      >
        <FormattedMessage
          defaultMessage={
            'Lend now on Notional and receive an APY boost for all new users for the first 30 days.'
          }
        />
      </Body>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    max-width: 1200px;
    margin: 0px auto;
    padding-top: ${theme.spacing(24)};
    `
);

export default NewUserView;
