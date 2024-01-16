import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Paragraph,
  ContestTable,
  IconCell,
} from '@notional-finance/mui';

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
      <TitleText>
        <FormattedMessage defaultMessage={'Community partner prizes'} />
      </TitleText>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '95px',
          alignItems: 'center',
          marginBottom: theme.spacing(11),
        }}
      >
        <Paragraph sx={{ color: colors.greenGrey, display: 'flex', flex: 1 }}>
          <FormattedMessage
            defaultMessage={
              'The following 3 communities have the chance to earn special prizes in addition to the grand prizes open to everyone. The top high roller and fat cat from each community will each win 4,000 $NOTE!'
            }
          />
        </Paragraph>
        <Box sx={{ width: '580px' }}>
          <ContestTable columns={columns} data={data} tableLoading={false} />
        </Box>
      </Box>
      {!hideButton && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="large"
            variant="outlined"
            to="/contest-leaderboard"
            sx={{
              width: '358px',
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
      margin-bottom: 120px;
  `
);

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  text-align: left;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 10px;
  text-transform: uppercase;
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('md')} {
    text-align: center;
    text-wrap: nowrap;
    letter-spacing: 5px;
  }
`
);

export default ContestPartners;
