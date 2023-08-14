import { useEffect } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import AboutNotional from './AboutNotional';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  Header,
  LaunchAppButton,
  FeatureLoader,
  EmailCaptureSection,
  LandingFooter,
} from '@notional-finance/shared-web';
import { trackEvent } from '@notional-finance/helpers';
import { useNotionalTheme } from '@notional-finance/styles';
import MeetTheTeam from './MeetTheTeam';

export const AboutUsView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const handleAppLaunch = () => {
    trackEvent('LAUNCH_APP');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <FeatureLoader>
        <>
          <Header>
            <LaunchAppButton onLaunch={handleAppLaunch} />
          </Header>
          <Box
            sx={{
              backgroundColor: theme.palette.background.default,
              marginTop: theme.spacing(-10),
              height: '100%',
            }}
          >
            <AboutNotional />
            <MeetTheTeam />
            <EmailCaptureSection />
            <LandingFooter />
          </Box>
        </>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export default AboutUsView;
