import { useEffect } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import AboutNotional from './AboutNotional';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  Header,
  LaunchAppButton,
  FeatureLoader,
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
      <FeatureLoader>
        <>
          <Header>
            <LaunchAppButton />
          </Header>
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
      </FeatureLoader>
    </ThemeProvider>
  );
};

export default AboutUsView;
