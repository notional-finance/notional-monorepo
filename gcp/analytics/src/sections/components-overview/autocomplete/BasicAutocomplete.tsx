// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// project import
import MainCard from 'components/MainCard';
import data from 'data/movies';

// ==============================|| AUTOCOMPLETE - BASIC ||============================== //

export default function BasicAutocomplete() {
  return (
    <MainCard title="Basic" sx={{ overflow: 'visible' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Autocomplete
            fullWidth
            disablePortal
            id="basic-autocomplete-label"
            options={data}
            renderInput={(params) => <TextField {...params} label="Label" />}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Autocomplete
            fullWidth
            disablePortal
            id="basic-autocomplete"
            options={data}
            renderInput={(params) => <TextField {...params} placeholder="Placeholder" />}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
}
