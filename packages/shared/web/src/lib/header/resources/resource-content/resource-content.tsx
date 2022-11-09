import { Box } from '@mui/material';
import ConnectCommunity from '../../connect-community/connect-community';
import ResourcesCommunity from '../resources-community/resources-community';
import ResourcesGovernance from '../resources-governance/resources-governance';
import ResourcesLearn from '../resources-learn/resources-learn';

export function ResourceContent() {
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
        <ResourcesLearn />
        <ResourcesGovernance />
        <ResourcesCommunity />
      </Box>
      <ConnectCommunity />
    </Box>
  );
}

export default ResourceContent;
