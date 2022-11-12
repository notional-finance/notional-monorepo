import { Box } from '@mui/material';
import AboutCompany from '../about-company/about-company';
import AboutSecurity from '../about-security/about-security';
import ConnectCommunity from '../../connect-community/connect-community';

export function AboutContent() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <AboutCompany />
        <AboutSecurity />
      </Box>
      <ConnectCommunity />
    </Box>
  );
}

export default AboutContent;
