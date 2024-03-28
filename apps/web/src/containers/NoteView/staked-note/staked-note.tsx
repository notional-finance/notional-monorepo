import { Box } from '@mui/material';
import { SectionTitle, SubText } from '../components';
import { FormattedMessage } from 'react-intl';

export const StakedNote = () => {
  return (
    <Box>
      <SectionTitle
        title={<FormattedMessage defaultMessage={'sNOTE'} />}
        symbol="snote"
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Stake your NOTE to receive sNOTE and earn liquidity fees and reinvestment rewards. NOTE stakers provide liquidity for NOTE on Balancer and backstop the Notional protocol.'
          }
        />
      </SubText>
    </Box>
  );
};

export default StakedNote;
