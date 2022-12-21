import { Box } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';

export const WriteCongress = () => {
  return (
    <Box width="100%">
      <Button
        size="large"
        fullWidth
        href="https://www.congress.gov/members/find-your-member"
      >
        <FormattedMessage {...messages.error.blockedGeoCTA} />
      </Button>
    </Box>
  );
};
