import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import fatCat from '../../assets/fatCat.png';
import highRoller from '../../assets/highRoller.png';
import sadSack from '../../assets/sadSack.png';

interface ContestNftsProps {
  hideButton?: boolean;
}

export const ContestNfts = ({ hideButton }: ContestNftsProps) => {
  const theme = useTheme();
  return (
    <Container>
      <TitleText>
        <FormattedMessage defaultMessage={'Cash & NFT Prizes'} />
      </TitleText>
      <NftContainer>
        <NftDisplay>
          <img
            src={highRoller}
            alt="high roller"
            style={{ width: '275px', height: '329px' }}
          />

          <NftTitle>
            <FormattedMessage defaultMessage={'High Roller 1st Place'} />
          </NftTitle>
          <NftSubTitle>$5,000 NOTE</NftSubTitle>
        </NftDisplay>
        <NftDisplay>
          <img
            src={fatCat}
            alt="fat cat"
            style={{ width: '275px', height: '329px' }}
          />

          <NftTitle>
            <FormattedMessage defaultMessage={'FAT CAT 1st Place'} />
          </NftTitle>
          <NftSubTitle>$5,000 NOTE</NftSubTitle>
        </NftDisplay>
        <NftDisplay>
          <img
            src={sadSack}
            alt="sad sack"
            style={{ width: '275px', height: '329px' }}
          />

          <NftTitle>
            <FormattedMessage defaultMessage={'SAD SACK 1st Place'} />
          </NftTitle>
          <NftSubTitle>$5,000 NOTE</NftSubTitle>
        </NftDisplay>
      </NftContainer>
      {!hideButton && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: theme.spacing(15),
          }}
        >
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
            <FormattedMessage defaultMessage={'Full Leaderboard'} />
          </Button>
        </Box>
      )}
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(6)};
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

const NftContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing(10)};
  margin: 60px;
  @media (max-width: 875px) {
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: ${theme.spacing(5)};
  }
  `
);

const NftDisplay = styled(Box)(
  `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  `
);

const NftTitle = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  text-align: center;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 2.4px;
  margin-top: ${theme.spacing(2)};
  `
);
const NftSubTitle = styled(Box)(
  `
  color: ${colors.greenGrey};
  text-align: center;
  font-family: Avenir Next;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  `
);

export default ContestNfts;
