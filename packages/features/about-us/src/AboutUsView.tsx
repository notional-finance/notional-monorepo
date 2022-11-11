import { Box, ThemeProvider } from '@mui/material';
import AboutNotional from './AboutNotional';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  EmailCaptureSection,
  LandingFooter,
} from '@notional-finance/notional-web';
import { useNotionalTheme } from '@notional-finance/styles';
import MeetTheTeam from './MeetTheTeam';

export const AboutUsView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

export default AboutUsView;
