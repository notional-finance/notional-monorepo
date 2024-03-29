import { Box, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { trackEvent } from '@notional-finance/helpers';
import {
  OurBackers,
  NotionalBlog,
  Hero,
  OurProducts,
  HowItWorks,
  AuditAndSecurity,
  StatsAndTransparency,
  JoinOurCommunity,
} from './components';
import { useNotionalTheme, colors } from '@notional-finance/styles';
import { Header, LaunchAppButton } from '@notional-finance/shared-web';
import { EmailCaptureSection } from '@notional-finance/shared-web';
import { LandingFooter } from '@notional-finance/shared-web';
import { FeatureLoader } from '@notional-finance/mui';

export const LandingPageView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const handleAppLaunch = () => {
    trackEvent('LAUNCH_APP');
  };

  return (
    <ThemeProvider theme={theme}>
      <FeatureLoader backgroundColor={colors.black}>
        <>
          <Header>
            <LaunchAppButton onLaunch={handleAppLaunch} />
          </Header>
          <Box
            sx={{
              overflow: 'hidden',
              background: colors.white,
            }}
          >
            <Hero />
            <OurProducts />
            <HowItWorks />
            <AuditAndSecurity />
            <StatsAndTransparency />
            <OurBackers />
            <JoinOurCommunity />
            <NotionalBlog />
            <EmailCaptureSection />
            <ThemeProvider theme={lightTheme}>
              <LandingFooter />
            </ThemeProvider>
          </Box>
        </>
      </FeatureLoader>
    </ThemeProvider>
  );
};

export default LandingPageView;
