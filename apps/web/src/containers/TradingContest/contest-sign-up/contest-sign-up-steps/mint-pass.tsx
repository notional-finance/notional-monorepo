import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TitleText } from '../../components';

export const MintPass = () => {
  const theme = useTheme();
  return (
    <Box>
      <TitleText
        sx={{ marginBottom: theme.spacing(5), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Mint Pass" />
      </TitleText>
    </Box>
  );
};

export default MintPass;
