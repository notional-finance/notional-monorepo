import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { Paragraph, ContestTable, Button } from '@notional-finance/mui';
import { SectionTitle } from './contest-shared-elements';
import {
  useContestPass,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import {
  partnersTableColumns,
  partnersTableData,
  messages,
} from '../contest-data';

export const ContestPartners = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { hasContestPass } = useContestPass();
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
      {!hasContestPass && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="large"
            variant="outlined"
            sx={{
              width: theme.spacing(41.25),
              border: `1px solid ${colors.neonTurquoise}`,
              ':hover': {
                background: colors.matteGreen,
              },
              fontFamily: 'Avenir Next',
            }}
            to={`/contest-leaderboard/${network}`}
          >
            <FormattedMessage defaultMessage={'View Leaderboard'} />
          </Button>
        </Box>
      )}
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(6)};
      margin-bottom: ${theme.spacing(32)};
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
