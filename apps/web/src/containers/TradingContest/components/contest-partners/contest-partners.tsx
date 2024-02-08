import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { Button, Paragraph, ContestTable } from '@notional-finance/mui';
import { SectionTitle } from '../contest-shared-elements/contest-shared-elements';
import { useSelectedNetwork } from '@notional-finance/wallet';
import {
  partnersTableColumns,
  partnersTableData,
  messages,
} from '../../contest-data';
import { contestActive } from '@notional-finance/notionable-hooks';

export const ContestPartners = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
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
            maxHeight={theme.spacing(16.25)}
            columns={partnersTableColumns}
            data={partnersTableData}
            tableLoading={false}
            hideOnMobile={false}
          />
        </TableContainer>
      </ContentContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {contestActive && (
          <Button
            size="large"
            variant="outlined"
            to={`/contest-leaderboard/${network}`}
            sx={{
              width: theme.spacing(41.25),
              border: `1px solid ${colors.neonTurquoise}`,
              ':hover': {
                background: colors.matteGreen,
              },
              fontFamily: 'Avenir Next',
            }}
          >
            <FormattedMessage defaultMessage={'View Leader Board'} />
          </Button>
        )}
      </Box>
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
  margin-bottom: ${theme.spacing(11)};
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
