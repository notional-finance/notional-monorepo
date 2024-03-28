import { Box } from '@mui/material';
import { SectionTitle, SubText } from '../components';
import { FormattedMessage } from 'react-intl';

export const NoteDelegate = () => {
  return (
    <Box>
      <SectionTitle title={<FormattedMessage defaultMessage={'Delegate'} />} />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Delegate your votes to active governance participants. Explore the profiles and principles of Notional delegates.'
          }
        />
      </SubText>
    </Box>
  );
};

export default NoteDelegate;
