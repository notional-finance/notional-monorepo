import { Box, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  OurBackers,
  NotionalBlog,
  Hero,
  // OurProducts,
  HowItWorks,
  AuditAndSecurity,
  StatsAndTransparency,
  JoinOurCommunity,
} from './components';
import { useNotionalTheme, colors } from '@notional-finance/styles';
import {
  // Header,
  // LaunchAppButton,
  EmailCaptureSection,
  LandingFooter,
  // FeatureLoader,
} from '@notional-finance/shared-web';

export const LandingPageView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT);

  return (
    <ThemeProvider theme={theme}>
      {/* <FeatureLoader backgroundColor={colors.black}> */}
      <>
        {/* <Header>
          <LaunchAppButton />
        </Header> */}
        <Box
          sx={{
            overflow: 'hidden',
            background: colors.white,
          }}
        >
          <Hero />
          {/* <OurProducts /> */}
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
      {/* </FeatureLoader> */}
    </ThemeProvider>
  );
};

export default LandingPageView;
