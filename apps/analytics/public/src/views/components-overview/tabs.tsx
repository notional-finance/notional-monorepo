// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

import BasicTabs from 'sections/components-overview/tabs/BasicTabs';
import ScrollableTabs from 'sections/components-overview/tabs/ScrollableTabs';
import IconTabs from 'sections/components-overview/tabs/IconTabs';
import CenteredTabs from 'sections/components-overview/tabs/CenteredTabs';
import VerticalTabs from 'sections/components-overview/tabs/VerticalTabs';

// ==============================|| COMPONENTS - TABS ||============================== //

export default function ComponentTabs() {
  return (
    <>
      <ComponentHeader
        title="Tabs"
        caption="Tabs make it easy to explore and switch between different views."
        directory="src/pages/components-overview/tabs"
        link="https://mui.com/material-ui/react-tabs/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Stack spacing={1}>
              <Typography variant="h5">Basic</Typography>
              <BasicTabs />
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Stack spacing={1}>
              <Typography variant="h5">Color Tab with Disabled Tab + Scrollable Tabs</Typography>
              <ScrollableTabs />
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Stack spacing={1}>
              <Typography variant="h5">Icon Tabs</Typography>
              <IconTabs />
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Stack spacing={1}>
              <Typography variant="h5">Centered Tabs</Typography>
              <CenteredTabs />
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Stack spacing={1}>
              <Typography variant="h5">Vertical Tabs</Typography>
              <VerticalTabs />
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
