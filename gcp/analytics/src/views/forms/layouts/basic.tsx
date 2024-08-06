// material-ui
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| LAYOUTS - BASIC ||============================== //

export default function Layouts() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <MainCard title="Simple Form Layout">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Name</InputLabel>
                <TextField fullWidth placeholder="Enter full name" />
              </Stack>
              <FormHelperText>Please enter your full name</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Email</InputLabel>
                <TextField fullWidth placeholder="Enter email" />
              </Stack>
              <FormHelperText>Please enter your Email</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Password</InputLabel>
                <TextField type="password" fullWidth placeholder="Enter Password" />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <InputLabel>Language</InputLabel>
              <FormGroup>
                <FormControlLabel control={<Checkbox defaultChecked />} label="English" />
                <FormControlLabel control={<Checkbox />} label="French" />
                <FormControlLabel control={<Checkbox />} label="Dutch" />
              </FormGroup>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard title="Horizontal Form Layout">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                A. Personal Info:
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel>Name</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter full name" />
                  <FormHelperText>Please enter your full name</FormHelperText>
                </Grid>
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel>Email</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter email" />
                  <FormHelperText>Please enter your Email</FormHelperText>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                B. Educational Info:
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel>Degree Name</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter Degree name" />
                  <FormHelperText>Please enter your Degree name</FormHelperText>
                </Grid>
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel>Passing Year</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter Passing Year" />
                  <FormHelperText>Please enter Passing Year</FormHelperText>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={{ xs: 0.5, sm: 2 }} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={3} lg={4}>
                      <InputLabel>Language</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={8}>
                      <FormControlLabel control={<Checkbox defaultChecked />} label="English" />
                      <FormControlLabel control={<Checkbox />} label="French" />
                      <FormControlLabel control={<Checkbox />} label="Dutch" />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard title="Control Divider">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Name</InputLabel>
                <TextField fullWidth placeholder="Enter full name" />
              </Stack>
              <FormHelperText>Please enter your full name</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Email</InputLabel>
                <TextField fullWidth placeholder="Enter email" />
              </Stack>
              <FormHelperText>Please enter your Email</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Password</InputLabel>
                <TextField type="password" fullWidth placeholder="Enter Password" />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>Language</InputLabel>
              <FormGroup>
                <FormControlLabel control={<Checkbox defaultChecked />} label="English" />
                <FormControlLabel control={<Checkbox />} label="French" />
                <FormControlLabel control={<Checkbox />} label="Dutch" />
              </FormGroup>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard title="Input Label Alignment">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                A. Personal Info:
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Name :</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter full name" />
                  <FormHelperText>Please enter your full name</FormHelperText>
                </Grid>
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Email :</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter email" />
                  <FormHelperText>Please enter your Email</FormHelperText>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                B. Educational Info:
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Degree Name :</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter Degree name" />
                  <FormHelperText>Please enter your Degree name</FormHelperText>
                </Grid>
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                  <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Passing Year :</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                  <TextField fullWidth placeholder="Enter Passing Year" />
                  <FormHelperText>Please enter Passing Year</FormHelperText>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={{ xs: 0.5, sm: 2 }} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={3} lg={4}>
                      <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Language :</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={8}>
                      <FormControlLabel control={<Checkbox defaultChecked />} label="English" />
                      <FormControlLabel control={<Checkbox />} label="French" />
                      <FormControlLabel control={<Checkbox />} label="Dutch" />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
