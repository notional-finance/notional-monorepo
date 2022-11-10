import { useTheme, Box } from '@mui/material'
import { Paragraph } from '@notional-finance/mui'
import { FormattedMessage } from 'react-intl'

const PrivacyView = () => {
  const theme = useTheme()
  return (
    <Box sx={{ padding: { xs: theme.spacing(8, 4), md: theme.spacing(8, 12), lg: theme.spacing(12, 20) } }}>
      <Paragraph>
        <FormattedMessage
          defaultMessage={`
  <p>NOTIONAL PRIVACY POLICY</p>
  <p>Last Updated: December 5, 2020</p>
  <p>As fellow blockchain and cryptocurrency users, we value your privacy. We also balance that against the need to monitor and improve our product. We will never collect personally identifiable information about you. Our data collection is limited to:</p>
  <br></br>
  <p>1. Anonymized crash and performance monitoring</p>
  <p>2. Anonymized cookie based analytics including anonymized IP addresses</p>
  <p>3. Aggregated, anonymized server logs</p>
  <br></br>
  <p>Our hosting provider and software vendors may have access to data about your activity including your IP address and device information as a result of using our services. These vendors include: Netlify, Google Analytics, Alchemy API, The Graph Protocol, Datadog.</p>
      `}
          values={{
            p: (chunks: React.ReactNode) => <Paragraph>{chunks}</Paragraph>,
            br: () => <br />
          }}
        />
      </Paragraph>
    </Box>
  )
}

export default PrivacyView
