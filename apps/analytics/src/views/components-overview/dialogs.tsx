// material-ui
import Grid from '@mui/material/Grid';

// project import
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

import SimpleDialog from 'sections/components-overview/dialogs/SimpleDialog';
import AlertDialog from 'sections/components-overview/dialogs/AlertDialog';
import FormDialog from 'sections/components-overview/dialogs/FormDialog';
import TransitionsDialog from 'sections/components-overview/dialogs/TransitionsDialog';
import CustomizedDialog from 'sections/components-overview/dialogs/CustomizedDialog';
import FullScreenDialog from 'sections/components-overview/dialogs/FullScreenDialog';
import SizesDialog from 'sections/components-overview/dialogs/SizesDialog';
import ResponsiveDialog from 'sections/components-overview/dialogs/ResponsiveDialog';
import DraggableDialog from 'sections/components-overview/dialogs/DraggableDialog';
import ScrollDialog from 'sections/components-overview/dialogs/ScrollDialog';
import ConfirmationDialog from 'sections/components-overview/dialogs/ConfirmationDialog';

// ==============================|| COMPONENTS - DIALOGS ||============================== //

export default function Dialogs() {
  return (
    <>
      <ComponentHeader
        title="Dialog"
        caption="Dialogs inform users about a task and can contain critical information, require decisions, or involve multiple tasks."
        directory="src/pages/components-overview/dialogs"
        link="https://mui.com/material-ui/react-dialog/"
      />
      <ComponentWrapper sx={{ '& .MuiCardContent-root': { textAlign: 'center' } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Basic">
              <SimpleDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Alert">
              <AlertDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Form">
              <FormDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Transitions">
              <TransitionsDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Customized">
              <CustomizedDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Full Screen">
              <FullScreenDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Sizes">
              <SizesDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Responsive">
              <ResponsiveDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Draggable">
              <DraggableDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Scrolling">
              <ScrollDialog />
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <MainCard title="Confirmation">
              <ConfirmationDialog />
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
