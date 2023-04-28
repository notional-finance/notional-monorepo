import { styled, Box, useTheme } from '@mui/material';
import { Body, H1, Button } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

export const HeroContent = () => {
  const theme = useTheme();

  return (
    <ContentWrapper>
      <H1>
        <FormattedMessage defaultMessage={'Maximum Returns.'} />
      </H1>
      <H1>
        <FormattedMessage defaultMessage={'Minimum Risk.'} />
      </H1>
      <Body sx={{ marginTop: theme.spacing(3), maxWidth: theme.spacing(68) }}>
        <FormattedMessage
          defaultMessage={`Lend, borrow, and earn leveraged yield with DeFi's only fixed and variable rate lending protocol.`}
        />
      </Body>
      <ButtonContainer>
        <Button
          size="large"
          to="/portfolio/overview"
          sx={{
            marginRight: theme.spacing(6),
          }}
        >
          <FormattedMessage defaultMessage={'Launch App'} />
        </Button>
        <Button
          size="large"
          variant="outlined"
          sx={{
            background: colors.black,
          }}
          href="https://docs.notional.finance/notional-v2/"
        >
          <FormattedMessage defaultMessage={'View Docs'} />
        </Button>
      </ButtonContainer>
    </ContentWrapper>
  );
};

const ContentWrapper = styled(Box)(
  ({ theme }) => `
    z-index: 2;
    margin-left: 12vw;
    padding-top: ${theme.spacing(19.75)};
  
    ${theme.breakpoints.down('lg')} {
      margin-left: ${theme.spacing(8)};  
    }
  
    ${theme.breakpoints.down('mdLanding')} {
      padding-top: ${theme.spacing(5)};
    }
  
    @media(max-height: 800px) {
      padding-top: ${theme.spacing(5)};
    }
  
  
    ${theme.breakpoints.down('md')} {
      width: fit-content;
      margin: auto;
      margin-top: 0px;
    }
    ${theme.breakpoints.down('sm')} {
      width: 90%;
      margin-top: ${theme.spacing(6)};
      h1 {
        font-size: 2.25rem;
      }
      p {
        font-size: 1.125rem;
      }
    }
  `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
    margin-top: ${theme.spacing(9)};
    margin-bottom: ${theme.spacing(9)};
    ${theme.breakpoints.down('smLanding')} {
      button {
        width: 100%;
        margin-bottom: ${theme.spacing(4)};
      }
    }
    `
);

export default HeroContent;
