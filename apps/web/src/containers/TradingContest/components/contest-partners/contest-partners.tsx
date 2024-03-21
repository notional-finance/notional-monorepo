import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { Paragraph, ContestTable } from '@notional-finance/mui';
import { SectionTitle } from '../contest-shared-elements/contest-shared-elements';
import {
  partnersTableColumns,
  partnersTableData,
  messages,
} from '../../contest-data';

export const ContestPartners = () => {
  return (
    <Container>
      <SectionTitle>
        <FormattedMessage defaultMessage={'Community partner prizes'} />
      </SectionTitle>
      <ContentContainer>
        <Paragraph
          sx={{
            color: colors.greenGrey,
            display: 'flex',
            flex: 1,
          }}
        >
          <FormattedMessage {...messages.ContestPartners.bodyText} />
        </Paragraph>
        <TableContainer>
          <ContestTable
            columns={partnersTableColumns}
            data={partnersTableData}
            tableLoading={false}
            hideOnMobile={false}
          />
        </TableContainer>
      </ContentContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(6)};
      margin-bottom: ${theme.spacing(15)};
  `
);

const TableContainer = styled(Box)(
  ({ theme }) => `
    width: ${theme.spacing(72.5)};
    ${theme.breakpoints.down('md')} {
      width: 100%;
      margin-bottom: ${theme.spacing(8)};
    }
  `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing(12)};
  align-items: center;
  margin-bottom: ${theme.spacing(32)};
  ${theme.breakpoints.down('md')} {
    flex-direction: column;
  }
  ${theme.breakpoints.down('sm')} {
    p {
      margin-top: ${theme.spacing(4)};
    }
  }
  
  `
);

export default ContestPartners;
