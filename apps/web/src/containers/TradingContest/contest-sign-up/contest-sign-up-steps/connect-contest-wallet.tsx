import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TitleText, ContestBodyText } from '../../components';

export const ConnectContestWallet = () => {
  const theme = useTheme();
  return (
    <Box>
      <TitleText
        sx={{ marginBottom: theme.spacing(5), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Connect Wallet" />
      </TitleText>
      <ContestBodyText>
        <FormattedMessage defaultMessage="Connect the wallet you want to compete with. If you have a community partner NFT, connect with that wallet to be eligible for special community partner prizes." />
      </ContestBodyText>
    </Box>
  );
};

export default ConnectContestWallet;
