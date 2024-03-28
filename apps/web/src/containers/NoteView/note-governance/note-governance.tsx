import { Box } from '@mui/material';
import { SectionTitle, SubText } from '../components';
import { FormattedMessage } from 'react-intl';

export const NoteGovernance = () => {
  return (
    <Box>
      <SectionTitle
        title={<FormattedMessage defaultMessage={'Governance'} />}
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Participate in Notional governance by discussing proposals in the Notional forum and voting on them on Snapshot.'
          }
        />
      </SubText>
    </Box>
  );
};

export default NoteGovernance;
