import { styled, Box, useTheme, Theme } from '@mui/material';
import { Body, H1, Button } from '@notional-finance/mui';
import { useWalletConnectedNetwork } from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import { Network } from '@notional-finance/util';
import { useWalletActive } from '@notional-finance/wallet';
import { FormattedMessage } from 'react-intl';
import { useFeatureValue } from '@growthbook/growthbook-react';

export const HeroContent = () => {
  const theme = useTheme();
  const network = useWalletConnectedNetwork() || Network.mainnet;
  const walletActive = useWalletActive();
  const showHeroStats = useFeatureValue('hero-stats-visible', true);

  return (
    <ContentWrapper theme={theme} showHeroStats={showHeroStats}>
      <H1 sx={{ textAlign: showHeroStats ? 'left' : 'center' }}>
        <FormattedMessage defaultMessage={'Maximum Returns.'} />
      </H1>
      <H1 sx={{ textAlign: showHeroStats ? 'left' : 'center' }}>
        <FormattedMessage defaultMessage={'Minimum Risk.'} />
      </H1>
      <Body
        sx={{
          marginTop: theme.spacing(3),
          maxWidth: theme.spacing(68),
          textAlign: showHeroStats ? 'left' : 'center',
        }}
      >
        <FormattedMessage
          defaultMessage={`Lend, borrow, and earn leveraged yield with DeFi's leading fixed rate lending protocol.`}
        />
      </Body>
      <ButtonContainer
        sx={
          showHeroStats
            ? {
                justifyContent: 'flex-start',
              }
            : {
                justifyContent: 'center',
                margin: theme.spacing(9),
                '& > a': {
                  width: '100%',
                },
              }
        }
      >
        <Button
          data-dd-action-name="Launch App [Landing Page Hero]"
          size="large"
          to={
            walletActive
              ? `/portfolio/${network}/overview`
              : `/portfolio/${network}/welcome/earn`
          }
          sx={
            showHeroStats
              ? {
                  marginRight: theme.spacing(6),
                }
              : {
                  margin: 'auto',
                  width: '100%',
                  minWidth: 'unset',
                }
          }
        >
          <FormattedMessage defaultMessage={'Launch App'} />
        </Button>
        {showHeroStats && (
          <Button
            data-dd-action-name="View Docs [Landing Page Hero]"
            size="large"
            variant="outlined"
            sx={{
              background: colors.black,
              ':hover': {
                background: colors.matteGreen,
              },
            }}
            href="https://docs.notional.finance/notional-v3"
          >
            <FormattedMessage defaultMessage={'View Docs'} />
          </Button>
        )}
      </ButtonContainer>
    </ContentWrapper>
  );
};

const ContentWrapper = styled(
  Box,
  {}
)(
  ({ theme, showHeroStats }: { theme: Theme; showHeroStats?: boolean }) => `
    z-index: 2;
    margin: ${showHeroStats ? '0 0 0 12vw' : 'auto'};
    padding-top: ${theme.spacing(19.75)};

    ${theme.breakpoints.down('lg')} {
      margin-left: ${showHeroStats ? theme.spacing(8) : 'auto'};  
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
    display: flex;
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
