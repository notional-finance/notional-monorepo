import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Paragraph,
  ContestTable,
  IconCell,
} from '@notional-finance/mui';
import { SectionTitle } from '../contest-shared-elements/contest-shared-elements';

interface ContestPartnersProps {
  hideButton?: boolean;
}

const columns = [
  {
    Header: 'Community',
    Cell: IconCell,
    accessor: 'community',
    textAlign: 'left',
    fontSize: '20px',
  },
  {
    Header: 'High roller prize',
    accessor: 'hrPrize',
    textAlign: 'right',
    fontSize: '16px',
  },
  {
    Header: 'Fat cat prize',
    accessor: 'fcPrize',
    textAlign: 'right',
    fontSize: '16px',
  },
];

const data = [
  {
    community: 'Layer2DAO',
    hrPrize: '4,000 NOTE',
    fcPrize: '4,000 NOTE',
  },
  {
    community: 'Llamas',
    hrPrize: '4,000 NOTE',
    fcPrize: '4,000 NOTE',
  },
  {
    community: 'Cryptotesters',
    hrPrize: '4,000 NOTE',
    fcPrize: '4,000 NOTE',
  },
];

export const ContestPartners = ({ hideButton }: ContestPartnersProps) => {
  const theme = useTheme();
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
          <FormattedMessage
            defaultMessage={
              'The following 3 communities have the chance to earn special prizes in addition to the grand prizes open to everyone. The top high roller and fat cat from each community will each win 4,000 $NOTE!'
            }
          />
        </Paragraph>
        <TableContainer>
          <ContestTable
            maxHeight={theme.spacing(16.25)}
            columns={columns}
            data={data}
            tableLoading={false}
            hideOnMobile={false}
          />
        </TableContainer>
      </ContentContainer>
      {/* TODO: Show this if the user has minted a contest pass */}
      {!hideButton && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="large"
            variant="outlined"
            to="/contest-leaderboard"
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
        </Box>
      )}
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
