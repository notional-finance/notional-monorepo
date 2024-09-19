// material-ui
import Grid from '@mui/material/Grid';

// project import
import ExpandingTable from 'sections/tables/react-table/ExpandingTable';
import ExpandingDetails from 'sections/tables/react-table/ExpandingDetails';
import ExpandingSubTable from 'sections/tables/react-table/ExpandingSubTable';

// ==============================|| REACT TABLE - EXPANDING ||============================== //

export default function Expanding() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ExpandingTable />
      </Grid>
      <Grid item xs={12}>
        <ExpandingDetails />
      </Grid>
      <Grid item xs={12}>
        <ExpandingSubTable />
      </Grid>
    </Grid>
  );
}
