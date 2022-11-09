import { AboutActions } from './AboutActions/AboutActions';
import { OurMission } from './OurMission/OurMission';
import { SectionOne } from './SectionOne/SectionOne';
import { Box } from '@mui/material';

const AboutNotional = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <SectionOne />
      <OurMission />
      <AboutActions />
    </Box>
  );
};

export default AboutNotional;
