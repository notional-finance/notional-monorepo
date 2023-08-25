import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { Button } from '@notional-finance/mui';
import betaPassGif from '../../assets/beta-pass.gif';

export const ContestHero = () => {
  const theme = useTheme();
  return (
    <Container>
      <ContentContainer>
        <ImgContainer>
          <img src={betaPassGif} alt="beta pass gif" />
        </ImgContainer>
        <Box sx={{ marginTop: theme.spacing(5) }}>
          <TitleText>
            <FormattedMessage
              defaultMessage={
                'Connect a Wallet with a Beta Access NFT to Enter '
              }
            />
          </TitleText>
          <Box
            sx={{
              marginTop: theme.spacing(5),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Button
              size="large"
              sx={{
                marginBottom: theme.spacing(3),
                width: '358px',
                fontFamily: 'Avenir Next',
              }}
            >
              <FormattedMessage defaultMessage={'Connect Wallet'} />
            </Button>
            <Button
              size="large"
              variant="outlined"
              sx={{
                width: '358px',
                ':hover': {
                  background: colors.matteGreen,
                },
                fontFamily: 'Avenir Next',
              }}
            >
              <FormattedMessage defaultMessage={'Join Waitlist'} />
            </Button>
          </Box>
        </Box>
      </ContentContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      max-width: ${theme.spacing(120)};
      margin: auto;
      margin-top: ${theme.spacing(5)};
      `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
    margin-top: ${theme.spacing(15)};
    display: flex;
      `
);

const ImgContainer = styled(Box)(
  ({ theme }) => `
    margin-right: ${theme.spacing(15)};

      `
);

const TitleText = styled(Box)(
  `
  color: ${colors.white};
  font-family: Avenir Next;
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
  line-height: 67.2px;
      `
);

export default ContestHero;
