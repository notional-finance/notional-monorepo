import { Box, ThemeProvider } from '@mui/material'
import { THEME_VARIANTS } from '@notional-finance/utils'
import FixedAPYAPR from './components/Sections/FixedAPYAPR'
import TopNotionalStats from './components/Sections/TopNotionalStats'
import FixedOpenAndTransparent from './components/Sections/FixedOpenAndTransparent'
import AskedQuestionsAccordion from './components/Sections/AskedQuestionsAccordion'
import WithNotionalYouCan from './components/Sections/WithNotionalYouCan'
import VentureCapitalPartners from './components/Sections/VentureCapitalPartners'
import MultidisciplinarySecurityApproach from './components/Sections/MultidisciplinarySecurityApproach'
import FromTheBlogSection from './components/Sections/FromTheBlogSection'
import { useNotionalTheme } from '@notional-finance/styles'
import { EmailCaptureSection } from '@notional-finance/notional-web'
import { LandingFooter } from '@notional-finance/notional-web'

export const LandingPageView = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT)
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <FixedAPYAPR />
        <TopNotionalStats />
        <FixedOpenAndTransparent />
        <WithNotionalYouCan />
        <VentureCapitalPartners />
        <AskedQuestionsAccordion />
        <MultidisciplinarySecurityApproach />
        <FromTheBlogSection />
        <EmailCaptureSection />
        <LandingFooter />
      </Box>
    </ThemeProvider>
  )
}

export default LandingPageView
