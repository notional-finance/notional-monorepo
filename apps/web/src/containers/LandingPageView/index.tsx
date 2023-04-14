import { Box, ThemeProvider } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  AskedQuestionsAccordion,
  WithNotionalYouCan,
  VentureCapitalPartners,
  MultidisciplinarySecurityApproach,
  FromTheBlog,
  Hero,
  OurProducts,
} from './components';
import { useNotionalTheme } from '@notional-finance/styles';
import { EmailCaptureSection } from '@notional-finance/shared-web';
import { LandingFooter } from '@notional-finance/shared-web';

export const LandingPageView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT, 'landing');
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ overflow: 'hidden' }}>
        <Hero />
        <OurProducts />
        <WithNotionalYouCan />
        <VentureCapitalPartners />
        <AskedQuestionsAccordion />
        <MultidisciplinarySecurityApproach />
        <FromTheBlog />
        <EmailCaptureSection />
        <LandingFooter />
      </Box>
    </ThemeProvider>
  );
};

export default LandingPageView;
