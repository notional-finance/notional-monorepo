import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="235"
            height="289"
            viewBox="0 0 235 289"
            fill="none"
          >
            <path
              d="M3 28.1407C3 27.5305 3.21768 26.9403 3.61391 26.4763L22.8907 3.8989C23.3777 3.32849 24.0901 3 24.8402 3H210.16C210.91 3 211.622 3.32849 212.109 3.8989L231.386 26.4763C231.782 26.9403 232 27.5305 232 28.1407V260.86C232 261.47 231.782 262.061 231.386 262.525L212.109 285.102C211.622 285.672 210.91 286.001 210.16 286.001H24.8402C24.0901 286.001 23.3777 285.672 22.8907 285.102L3.61391 262.525C3.21769 262.061 3 261.47 3 260.86V28.1407Z"
              fill="#33F8FF"
              fillOpacity="0.25"
              stroke="#33F8FF"
              strokeWidth="6"
            />
          </svg>
          <NftTitle>
            <FormattedMessage defaultMessage={'ACE 1st Place'} />
          </NftTitle>
          <NftSubTitle>$5,000 NOTE</NftSubTitle>
        </NftDisplay>
        <NftDisplay>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="235"
            height="289"
            viewBox="0 0 235 289"
            fill="none"
          >
            <path
              d="M3 28.1407C3 27.5305 3.21768 26.9403 3.61391 26.4763L22.8907 3.8989C23.3777 3.32849 24.0901 3 24.8402 3H210.16C210.91 3 211.622 3.32849 212.109 3.8989L231.386 26.4763C231.782 26.9403 232 27.5305 232 28.1407V260.86C232 261.47 231.782 262.061 231.386 262.525L212.109 285.102C211.622 285.672 210.91 286.001 210.16 286.001H24.8402C24.0901 286.001 23.3777 285.672 22.8907 285.102L3.61391 262.525C3.21769 262.061 3 261.47 3 260.86V28.1407Z"
              fill="#33F8FF"
              fillOpacity="0.25"
              stroke="#33F8FF"
              strokeWidth="6"
            />
          </svg>
          <NftTitle>
            <FormattedMessage defaultMessage={'FAT CAT 1st Place'} />
          </NftTitle>
          <NftSubTitle>$5,000 NOTE</NftSubTitle>
        </NftDisplay>
        <NftDisplay>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="235"
            height="289"
            viewBox="0 0 235 289"
            fill="none"
          >
            <path
              d="M3 28.1407C3 27.5305 3.21768 26.9403 3.61391 26.4763L22.8907 3.8989C23.3777 3.32849 24.0901 3 24.8402 3H210.16C210.91 3 211.622 3.32849 212.109 3.8989L231.386 26.4763C231.782 26.9403 232 27.5305 232 28.1407V260.86C232 261.47 231.782 262.061 231.386 262.525L212.109 285.102C211.622 285.672 210.91 286.001 210.16 286.001H24.8402C24.0901 286.001 23.3777 285.672 22.8907 285.102L3.61391 262.525C3.21769 262.061 3 261.47 3 260.86V28.1407Z"
              fill="#33F8FF"
              fillOpacity="0.25"
              stroke="#33F8FF"
              strokeWidth="6"
            />
          </svg>
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
