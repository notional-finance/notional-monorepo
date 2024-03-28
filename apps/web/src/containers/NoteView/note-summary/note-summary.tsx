import { Box } from '@mui/material';
import { SectionTitle, SubText } from '../components';
import { FormattedMessage } from 'react-intl';
import { ExternalLink } from '@notional-finance/mui';
import { ReactNode } from 'react';

export const NoteSummary = () => {
  return (
    <Box>
      <SectionTitle
        title={<FormattedMessage defaultMessage={'NOTE Summary'} />}
        symbol="note"
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Track the NOTE buy and burn. Protocol owned tokens are converted into NOTE and burned each week according to <a1>NIP-41</a1>.'
          }
          values={{
            a1: (msg: ReactNode) => (
              <ExternalLink
                accent
                textDecoration
                href="https://forum.notional.finance/t/nip-41-note-token-burn/129/11"
              >
                {msg}
              </ExternalLink>
            ),
          }}
        />
      </SubText>
    </Box>
  );
};

export default NoteSummary;
