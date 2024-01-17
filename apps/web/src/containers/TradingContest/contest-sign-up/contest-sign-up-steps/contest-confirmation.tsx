import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TitleText } from '../../components';

export const ContestConfirmation = () => {
  return (
    <Box>
      <TitleText>
        <FormattedMessage defaultMessage="You are in!" />
      </TitleText>
    </Box>
  );
};

export default ContestConfirmation;
