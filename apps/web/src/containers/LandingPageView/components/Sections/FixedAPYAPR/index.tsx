import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  H1,
  Button,
  CountUp,
  ExternalLink,
  H4,
  Label,
  BodySecondary,
  HeadingSubtitle,
} from '@notional-finance/mui';
import { trackEvent } from '@notional-finance/helpers';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { Tabs } from '../../Tabs';
import { Boxes } from '../../Boxes';
import { CurrencyInputAndSelectBox } from '../../CurrencyInputAndSelectBox';
import { useLandingPageInput } from '../../../store/use-landing-page-input';
import nexusMutual from '@notional-finance/assets/images/logos/nexus-mutual.png';
import discordLogoSvg from '@notional-finance/assets/images/logos/logo-discord.svg';
import githubLogoSvg from '@notional-finance/assets/images/logos/logo-github-white.svg';
import twitterLogoSvg from '@notional-finance/assets/images/logos/logo-twitter-white.svg';

export const FixedAPYAPR = () => {
  const theme = useTheme();
  const {
    lendOrBorrow,
    ctaLink,
    selectedToken,
    nTokenYieldString,
    tradedRate,
  } = useLandingPageInput();

  const displayInfoText = () => {
    return (
      <Box>
        <H4 contrast>
          {lendOrBorrow === LEND_BORROW.BORROW ? (
            <FormattedMessage defaultMessage="Borrow today for up to 1 year & pay fixed interest." />
          ) : (
            <FormattedMessage defaultMessage="Lend today & earn fixed interest for up to 1 year." />
          )}
        </H4>

        <Button
          to={ctaLink}
          sx={{
            backgroundColor: theme.palette.info.main,
            color: theme.palette.common.black,
            // Disable hover states since the whole card is clickable
            ':hover': {
              backgroundColor: theme.palette.info.main,
              color: theme.palette.common.black,
              boxShadow: 'none',
            },
            margin: theme.spacing(2, 0),
            height: theme.spacing(7),
          }}
          disableRipple
          onClick={() =>
            trackEvent('LANDING_CTA', {
              props: {
                variation: lendOrBorrow,
              },
            })
          }
          fullWidth={true}
        >
          {lendOrBorrow === LEND_BORROW.BORROW ? (
            <FormattedMessage defaultMessage="Borrow" />
          ) : (
            <FormattedMessage defaultMessage="Lend" />
          )}
        </Button>
        <ul className="social">
          <li>
            <ExternalLink href="https://discord.notional.finance">
              <img src={discordLogoSvg} alt="Discord icon" />
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://github.com/notional-finance/contracts-v2">
              <img src={githubLogoSvg} alt="Github icon" />
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://twitter.com/NotionalFinance">
              <img src={twitterLogoSvg} alt="Twitter icon" />
            </ExternalLink>
          </li>
        </ul>
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <ExternalLink href="https://app.nexusmutual.io/cover/buy/get-quote?address=0x1344A36A1B56144C3Bc62E7757377D288fDE0369">
            <img src={nexusMutual} width="180px" alt="Nexus Mutual Logo" />
          </ExternalLink>
          <Label contrast>
            <FormattedMessage defaultMessage={'Insure Your Funds on Nexus'} />
          </Label>
        </Box>
      </Box>
    );
  };

  const displayHeaderText = () => {
    return (
      <HeadingSubtitle
        sx={{ color: theme.palette.info.main }}
        uppercase
        fontWeight="medium"
        textAlign={'center'}
      >
        {lendOrBorrow === LEND_BORROW.BORROW ? (
          <FormattedMessage defaultMessage="Borrow crypto with certainty" />
        ) : (
          <FormattedMessage defaultMessage="Lend crypto with dependable returns" />
        )}
      </HeadingSubtitle>
    );
  };

  return (
    <FixedAPYAPRContainer>
      <div id="section-1" className="section">
        <div className="left-side">
          <div className="content">
            <div className="content-container">
              {displayHeaderText()}
              <H1 contrast textAlign={'center'}>
                <span className="number-animation">
                  {tradedRate && (
                    <CountUp value={(tradedRate * 100) / 1e9} suffix="%" />
                  )}
                </span>
                &nbsp;
                <FormattedMessage defaultMessage={'Fixed APY'} />
              </H1>
              <Tabs />
              <CurrencyInputAndSelectBox />
              <Boxes />
              <BodySecondary>
                <FormattedMessage
                  defaultMessage="Users can also mint <a>nTokens</a> to provide liquidity and earn interest, fees & NOTE incentives. <b>Earn {nTokenYieldString} variable APY.</b>"
                  values={{
                    a: (chunk: React.ReactNode) => {
                      return (
                        <BodySecondary
                          inline
                          accent
                          href="https://docs.notional.finance/notional-v2/ntokens/ntoken-overview"
                        >
                          {chunk}
                        </BodySecondary>
                      );
                    },
                    b: (chunk: React.ReactNode) => {
                      return (
                        <BodySecondary
                          inline
                          accent
                          to={`/provide/${selectedToken}`}
                        >
                          {chunk}
                        </BodySecondary>
                      );
                    },
                    nTokenYieldString,
                  }}
                />
              </BodySecondary>
            </div>
          </div>
        </div>
        <div className="right-side">
          <div className="right-side-container">{displayInfoText()}</div>
        </div>
      </div>
    </FixedAPYAPRContainer>
  );
};

const FixedAPYAPRContainer = styled('div')(
  ({ theme }) => `
  #section-1 {
    display: flex;

    .left-side {
      width: 78%;
    }

    .right-side {
      width: 30%;
    }

    .left-side {
      padding: 50px 0;
      background: linear-gradient(267.16deg, #004453 19.48%, #002b36 105.58%);

      .content {
        max-width: 540px;
        margin: 0 auto;

        .amount-entry {
          font-size: 16px;
          margin-top: 0px;
        }

        .learn-more {
          display: inline-block;
          text-transform: capitalize;
        }
      }
    }

    .right-side {
      background: ${theme.palette.primary.dark};

      .right-side-container {
        padding: 50px;
      }

      p {
        color: ${theme.palette.common.white};

        &:nth-child(3) {
          font-size: 14px;
        }
      }

      ul.social {
        li {
          display: inline-block;
          margin-right: 7%;

          &:first-of-type {
            position: relative;
            top: 4px;
          }

          img {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }

  .progress-indicator {
    display: none;
  }

  @media (max-width: 1250px) {
    #section-1 {
      display: block;

      .content {
        width: 100%;
      }

      .left-side {
        width: 100%;
      }

      .right-side {
        width: 100%;

        .right-side-container {
          padding: 60px 20px;
        }
      }
    }
  }

  @media (max-width: 600px) {
    #section-1 {
      .left-side {
        .content {
          width: 100%;

          .content-container {
            padding: 0 20px;
          }
        }
      }
    }
  }
`
);

export default FixedAPYAPR;
