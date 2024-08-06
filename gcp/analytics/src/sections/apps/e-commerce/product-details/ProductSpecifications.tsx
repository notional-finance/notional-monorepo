// material-ui
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// ==============================|| PRODUCT DETAILS - SPECIFICATIONS ||============================== //

export default function ProductSpecifications() {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Typography variant="h5">Product Category</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Wearable Device Type:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Smart Band</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Compatible Devices:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Smartphones</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Ideal For:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Unisex</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Typography variant="h5">Manufacturer Details</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Brand:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Apple</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Model Series:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Watch SE</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Model Number:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>MYDT2HN/A</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
