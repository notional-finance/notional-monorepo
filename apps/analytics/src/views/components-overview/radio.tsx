// material-ui
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Grid from '@mui/material/Grid';

// project import
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// ==============================|| COMPONENTS - RADIO ||============================== //

export default function ComponentRadio() {
  return (
    <>
      <ComponentHeader
        title="Radio"
        caption="Radio buttons allow the user to select one option from a set."
        directory="src/pages/components-overview/radio"
        link="https://mui.com/material-ui/react-radio-button/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <MainCard title="Basic">
              <FormControl component="fieldset">
                <RadioGroup aria-label="gender" defaultValue="male" name="radio-buttons-group" row>
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="other" control={<Radio disabled />} label="Other" />
                </RadioGroup>
              </FormControl>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Size">
              <FormControl component="fieldset">
                <RadioGroup aria-label="size" defaultValue="small" name="size" row>
                  <FormControlLabel value="small" control={<Radio />} label="Default" />
                  <FormControlLabel value="medium" control={<Radio className="size-medium" />} label="Medium" />
                  <FormControlLabel value="large" control={<Radio className="size-large" />} label="Large" />
                </RadioGroup>
              </FormControl>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Colors">
              <FormControl component="fieldset">
                <RadioGroup aria-label="size" defaultValue="success" name="colors" row>
                  <FormControlLabel value="primary" control={<Radio />} label="Primary" />
                  <FormControlLabel value="secondary" control={<Radio color="secondary" />} label="Secondary" />
                  <FormControlLabel value="success" control={<Radio color="success" />} label="Success" />
                  <FormControlLabel value="warning" control={<Radio color="warning" />} label="Warning" />
                  <FormControlLabel value="info" control={<Radio color="info" />} label="Info" />
                  <FormControlLabel value="error" control={<Radio color="error" />} label="Error" />
                </RadioGroup>
              </FormControl>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Label Placement">
              <FormControl component="fieldset">
                <RadioGroup row aria-label="position" name="position" defaultValue="top">
                  <FormControlLabel value="top" control={<Radio />} label="Top" labelPlacement="top" />
                  <FormControlLabel value="start" control={<Radio />} label="Start" labelPlacement="start" sx={{ mr: 1 }} />
                  <FormControlLabel value="bottom" control={<Radio />} label="Bottom" labelPlacement="bottom" />
                  <FormControlLabel value="end" control={<Radio />} label="End" sx={{ ml: 1 }} />
                </RadioGroup>
              </FormControl>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
