import { defineMessages, FormattedMessage } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import landingPageAnchorIconSvg from '@notional-finance/assets/icons/marketing/landing-page-anchor-icon.svg';
import landingPageComputerScreenIconSvg from '@notional-finance/assets/icons/marketing/landing-page-computer-screen-icon.svg';
import landingPageGlobeRailRoadIconSvg from '@notional-finance/assets/icons/marketing/landing-page-globe-railroad-icon.svg';
import { Box, useTheme } from '@mui/material';
import { H3 } from '@notional-finance/mui';

const sections = [
  {
    ...defineMessages({
      heading: {
        defaultMessage: 'Fixed Means Fixed',
        description: 'landing page heading',
      },
      text: {
        defaultMessage:
          "Don't rely on variable rates that are subject to volatile swings - your fixed rate on Notional can't and won't change.",
        description: 'landing page text',
      },
    }),
    image: landingPageGlobeRailRoadIconSvg,
  },
  {
    ...defineMessages({
      heading: {
        defaultMessage: 'Truly Open and Transparent',
        description: 'landing page heading',
      },
      text: {
        defaultMessage:
          "Rather than collect user data, we expose ours. Anyone can audit Notional's code and balances to ensure that everyone's funds are secure.",
        description: 'landing page text',
      },
    }),
    image: landingPageComputerScreenIconSvg,
  },
  {
    ...defineMessages({
      heading: {
        defaultMessage: 'Eliminate Volatility',
        description: 'landing page heading',
      },
      text: {
        defaultMessage:
          'Interest rates in crypto swing wildly - lock in fixed rates on Notional and lay the foundation for your financial success.',
        description: 'landing page text',
      },
    }),
    image: landingPageAnchorIconSvg,
  },
];

export const FixedOpenAndTransparent = () => {
  const theme = useTheme();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const inViewClassName = inView ? 'fade-in' : 'hidden';

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Box
        className={`section ${inViewClassName}`}
        sx={{
          width: '100%',
          background: theme.palette.background.default,
          padding: { xs: theme.spacing(4, 4), lg: theme.spacing(12, 12) },
        }}
      >
        {sections.map(({ image, heading, text }, i) => {
          const imageRight = i % 2 === 1;
          const imageEl = <img src={image} alt={heading.defaultMessage} />;
          const imageDesktop = (
            <Box sx={{ display: { xs: 'none', lg: 'block' }, width: '30%' }}>
              {imageEl}
            </Box>
          );
          const imageMobile = (
            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>{imageEl}</Box>
          );
          const sectionText = (
            <Box
              sx={{
                marginTop: theme.spacing(8),
                width: { xs: '100%', lg: '60%' },
                textAlign: { xs: 'center', lg: 'left' },
              }}
            >
              <H3 accent uppercase marginBottom={theme.spacing(2)}>
                <FormattedMessage {...heading} />
              </H3>
              <H3 fontWeight="light" lineHeight={2}>
                <FormattedMessage {...text} />
              </H3>
            </Box>
          );

          return (
            <Box
              key={`section-${i}`}
              sx={{
                display: 'flex',
                marginBottom: { xs: theme.spacing(16), lg: theme.spacing(32) },
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', lg: 'row' },
              }}
            >
              {imageMobile}
              {imageRight ? sectionText : imageDesktop}
              {imageRight ? imageDesktop : sectionText}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default FixedOpenAndTransparent;
