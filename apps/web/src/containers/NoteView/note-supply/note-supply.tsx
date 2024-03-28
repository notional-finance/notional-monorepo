import { Box } from '@mui/material';
import { SectionTitle, SubText } from '../components';
import { FormattedMessage } from 'react-intl';

export const NoteSupply = () => {
  return (
    <Box>
      <SectionTitle
        title={<FormattedMessage defaultMessage={'NOTE Supply Schedule'} />}
        symbol="note"
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Monitor the impact of token unlocks and liquidity incentives on the circulating supply of NOTE.'
          }
        />
      </SubText>
    </Box>
  );
};

export default NoteSupply;
