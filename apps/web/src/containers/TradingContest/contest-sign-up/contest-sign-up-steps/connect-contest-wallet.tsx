import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Button } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { TitleText, ContestBodyText, StepContainer } from '../../components';

export const ConnectContestWallet = () => {
  const theme = useTheme();
  return (
    <StepContainer>
      <TitleText
        sx={{ marginBottom: theme.spacing(5), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Connect Wallet" />
        <ContestBodyText sx={{ marginTop: theme.spacing(5) }}>
          <FormattedMessage defaultMessage="Connect the wallet you want to compete with. If you have a community partner NFT, connect with that wallet to be eligible for special community partner prizes." />
        </ContestBodyText>
      </TitleText>

      <Box sx={{ display: 'flex', gap: theme.spacing(6), margin: '0px auto' }}>
        <Button
          size="large"
          variant="outlined"
          to="/contest"
          sx={{
            width: '358px',
            border: `1px solid ${colors.neonTurquoise}`,
            cursor: 'pointer',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
        >
          <FormattedMessage defaultMessage={'Back'} />
        </Button>
        <Button
          size="large"
          sx={{
            marginBottom: theme.spacing(3),
            width: '358px',
            fontFamily: 'Avenir Next',
            cursor: 'pointer',
          }}
        >
          <FormattedMessage defaultMessage={'Connect Wallet'} />
        </Button>
      </Box>
    </StepContainer>
  );
};

export default ConnectContestWallet;
