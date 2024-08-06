// material-ui
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';

// project import
import MainCard from 'components/MainCard';

// ==============================|| BUTTON GROUPS ||============================== //

export default function ButtonGroups() {
  const buttons = [<Button key="one">One</Button>, <Button key="two">Two</Button>, <Button key="three">Three</Button>];

  return (
    <MainCard title="Button Group">
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <ButtonGroup disableElevation variant="contained" aria-label="outlined primary button group">
            {buttons}
          </ButtonGroup>
        </Grid>
        <Grid item>
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            {buttons}
          </ButtonGroup>
        </Grid>
        <Grid item>
          <ButtonGroup variant="text" aria-label="text button group">
            {buttons}
          </ButtonGroup>
        </Grid>
        <Grid item>
          <ButtonGroup color="warning" aria-label="medium secondary button group">
            {buttons}
          </ButtonGroup>
        </Grid>
        <Grid item>
          <ButtonGroup orientation="vertical" aria-label="vertical outlined button group">
            {buttons}
          </ButtonGroup>
        </Grid>
      </Grid>
    </MainCard>
  );
}
