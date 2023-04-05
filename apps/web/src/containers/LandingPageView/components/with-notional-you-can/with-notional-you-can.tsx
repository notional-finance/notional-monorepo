import { defineMessages, FormattedMessage } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import iconBarChartWhiteLargeSvg from '@notional-finance/assets/icons/icon-bar-chart-white-large.svg';
import iconCoinsWhiteLargeSvg from '@notional-finance/assets/icons/icon-coins-white-large.svg';
import iconPieChartWhiteLargeSvg from '@notional-finance/assets/icons/icon-pie-chart-white-large.svg';
import { Box, styled, useTheme } from '@mui/material';
import { Button, H1, H3 } from '@notional-finance/mui';

const sections = [
  {
    ...defineMessages({
      heading: {
        defaultMessage: 'Lend',
        description: 'landing page heading',
      },
      text: {
        defaultMessage:
          'Build a stable portfolio with fixed rate income on your assets. No counterparty risk, and no fine print.',
        description: 'landing page text',
      },
    }),
    image: iconBarChartWhiteLargeSvg,
    route: '/lend',
  },
  {
    ...defineMessages({
      heading: {
        defaultMessage: 'Borrow',
        description: 'landing page heading',
      },
      text: {
        defaultMessage:
          'Leverage your crypto positions, protect your personal information, and plan for the future by borrowing at fixed rates.',
        description: 'landing page text',
      },
    }),
    image: iconCoinsWhiteLargeSvg,
    route: '/borrow',
  },
  {
    ...defineMessages({
      heading: {
        defaultMessage: 'Provide Liquidity',
        description: 'landing page heading',
      },
      text: {
        defaultMessage:
          'Provide Liquidity by minting nTokens to earn interest, fees and NOTE incentives.',
        description: 'landing page text',
      },
    }),
    image: iconPieChartWhiteLargeSvg,
    route: '/provide',
  },
];

export const WithNotionalYouCan = () => {
  const theme = useTheme();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const inViewClassName = inView ? 'fade-in' : 'hidden';

  return (
    <Box ref={ref}>
      <BackgroundGradient>
        <StyledContainer className={`section ${inViewClassName}`}>
          <H1 textAlign={'center'} marginBottom={theme.spacing(10)}>
            <FormattedMessage
              defaultMessage={'With Notional You Can'}
              description={'landing page heading'}
            />
          </H1>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: { xs: 'center', lg: 'unset' },
              padding: theme.spacing(0, 4),
              flexDirection: { xs: 'column', lg: 'row' },
            }}
          >
            {sections.map(({ route, image, heading, text }, i) => {
              const isMiddle = i === 1;
              return (
                <StyledCard className={isMiddle ? 'middle' : ''} key={route}>
                  <Link to={route}>
                    <CardInterior>
                      {/* this box defines the top part of the card so the button flexes
                          down to the bottom of the card */}
                      <Box sx={{ zIndex: 1, marginBottom: theme.spacing(4) }}>
                        <img src={image} alt={heading.defaultMessage} />
                        <H3
                          contrast
                          marginTop={theme.spacing(2)}
                          marginBottom={theme.spacing(4)}
                        >
                          <FormattedMessage {...heading} />
                        </H3>
                        <H3 contrast fontWeight="light">
                          <FormattedMessage {...text} />
                        </H3>
                      </Box>
                      <Button
                        variant="contained"
                        disableRipple
                        size="large"
                        sx={{
                          width: '100%',
                          backgroundColor: isMiddle
                            ? theme.palette.primary.dark
                            : theme.palette.info.main,
                          color: isMiddle
                            ? theme.palette.common.white
                            : theme.palette.common.black,
                          // Disable hover states since the whole card is clickable
                          ':hover': {
                            backgroundColor: isMiddle
                              ? theme.palette.primary.dark
                              : theme.palette.info.main,
                            color: isMiddle
                              ? theme.palette.common.white
                              : theme.palette.common.black,
                            boxShadow: 'none',
                          },
                        }}
                      >
                        <FormattedMessage {...heading} />
                      </Button>
                    </CardInterior>
                  </Link>
                </StyledCard>
              );
            })}
          </Box>
        </StyledContainer>
      </BackgroundGradient>
    </Box>
  );
};

const BackgroundGradient = styled(Box)`
  background: conic-gradient(
    from 264.5deg at 50% 49.94%,
    #22b4b5 -41.25deg,
    #013946 22.5deg,
    #49e1e6 203.64deg,
    #0a6671 205.11deg,
    #22b4b5 318.75deg,
    #013946 382.5deg
  );
`;

const StyledContainer = styled(Box)(
  ({ theme }) => `
  border-top: 4px solid ${theme.palette.info.main};
  background: ${theme.palette.background.default};
  width: 90%;
  margin: 0 auto;
  padding: ${theme.spacing(8, 1)};
  position: relative;
  top: ${theme.spacing(-6)};
  box-shadow: ${theme.shape.shadowLandingPage};
`
);
const CardInterior = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(8)};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  img {
    width: 48px;
  }

  a {
    z-index: 1;
  }
`
);

const StyledCard = styled(Box)(
  ({ theme }) => `
  min-height: ${theme.spacing(70)};
  border-radius: ${theme.shape.borderRadius()};
  display: flex;
  width: 100%;
  justify-content: space-evenly;
  min-width: ${theme.spacing(40)};
  max-width: ${theme.spacing(56)};
  margin-top: ${theme.spacing(8)};

  ${theme.breakpoints.up('lg')} {
    width: 28%;
    min-width: ${theme.spacing(48)};
    max-width: ${theme.spacing(70)};
    margin-top: ${theme.spacing(0)};
  }

  :hover {
    box-shadow: ${theme.shape.shadowAccent};
    transition: box-shadow 0.25s;
  }

  &:first-of-type {
    ${theme.gradient.hoverTransition(
      'linear-gradient(279.89deg, #004453 0.19%, #169197 169.33%)',
      'linear-gradient(99.89deg, #004453 0.19%, #169197 169.33%)'
    )}
  }

  &:nth-of-type(2) {
    ${theme.gradient.hoverTransition(
      'linear-gradient(146.93deg, #49e0e6 -51.7%, #21b3b4 60.7%)',
      'linear-gradient(326.93deg, #49e0e6 -51.7%, #21b3b4 60.7%)'
    )}
  }

  &:last-child {
    ${theme.gradient.hoverTransition(
      'linear-gradient(98.98deg, #004453 30.6%, #002b36 128.58%)',
      'linear-gradient(278.98deg, #004453 30.6%, #002b36 128.58%)'
    )}
  }
`
);

export default WithNotionalYouCan;
