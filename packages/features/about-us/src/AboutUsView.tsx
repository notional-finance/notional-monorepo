import { useEffect } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import AboutNotional from './AboutNotional';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  LandingHeader,
  LaunchAppButton,
  EmailCaptureSection,
  LandingFooter,
} from '@notional-finance/shared-web';
import { useNotionalTheme } from '@notional-finance/styles';
import MeetTheTeam from './MeetTheTeam';

export const AboutUsView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <>
        <LandingHeader>
          <LaunchAppButton />
        </LandingHeader>
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            height: '100%',
          }}
        >
          <AboutNotional />
          <MeetTheTeam />
          <EmailCaptureSection />
          <LandingFooter />
        </Box>
      </>
    </ThemeProvider>
  );
};

export default AboutUsView;
