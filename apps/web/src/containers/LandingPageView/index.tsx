import { Box, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  AskedQuestionsAccordion,
  VentureCapitalPartners,
  FromTheBlog,
  Hero,
  OurProducts,
  HowItWorks,
  AuditAndSecurity,
} from './components';
import { useNotionalTheme, colors } from '@notional-finance/styles';
import { EmailCaptureSection } from '@notional-finance/shared-web';
import { LandingFooter } from '@notional-finance/shared-web';

export const LandingPageView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ overflow: 'hidden', background: colors.white }}>
        <Hero />
        <OurProducts />
        <HowItWorks />
        <AuditAndSecurity />
        {/* NOTE* This is a temporary fix to get the old landing page components to render correctly. Will remove this once the rest of the components are updated */}
        <ThemeProvider theme={lightTheme}>
          <VentureCapitalPartners />
          <AskedQuestionsAccordion />
          <FromTheBlog />
          <EmailCaptureSection />
          <LandingFooter />
        </ThemeProvider>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPageView;
