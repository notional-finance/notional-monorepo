'use client';

import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// select project-budget
const currencies = [
  {
    value: '1',
    label: 'Below $1000'
  },
  {
    value: '2',
    label: '$1000 - $5000'
  },
  {
    value: '3',
    label: 'Not specified'
  }
];

// select company-size
const sizes = [
  {
    value: '1',
    label: '1 - 5'
  },
  {
    value: '2',
    label: '5 - 10'
  },
  {
    value: '3',
    label: '10+'
  }
];

// ==============================|| CONTACT US - FORM ||============================== //

export default function ContactForm() {
  const [budget, setBudget] = useState(1);
  const handleProjectBudget = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBudget(Number(event.target?.value!));
  };

  const [size, setSize] = useState(1);
  const handleCompanySize = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSize(Number(event.target?.value!));
  };

  return (
    <Box sx={{ p: { xs: 2.5, sm: 0 } }}>
      <Grid container spacing={5} justifyContent="center">
        <Grid item xs={12} sm={10} lg={9}>
          <Stack alignItems="center" justifyContent="center" spacing={2}>
            <Typography color="primary">Get In touch</Typography>
            <Typography align="center" variant="h2">
              Lorem isume dolor elits.
            </Typography>
            <Typography variant="caption" align="center" color="text.secondary" sx={{ maxWidth: '355px' }}>
              The starting point for your next project based on easy-to-customize Material-UI © helps you build apps faster and better.
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={10} lg={9}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="text" placeholder="Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="text" placeholder="Company Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="email" placeholder="Email Address" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" placeholder="Phone Number" inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth placeholder="Company Size" value={size} onChange={handleCompanySize}>
                {sizes.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth placeholder="Project Budget" value={budget} onChange={handleProjectBudget}>
                {currencies.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} placeholder="Message" />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={10} lg={9}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1 }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Stack direction="row" alignItems="center" sx={{ ml: -1 }}>
              <Checkbox sx={{ '& .css-1vjb4cj': { borderRadius: '2px' } }} defaultChecked />
              <Typography>
                By submitting this, you agree to the{' '}
                <Typography sx={{ cursor: 'pointer' }} component="span" color="primary.main">
                  Privacy Policy
                </Typography>{' '}
                and{' '}
                <Typography sx={{ cursor: 'pointer' }} component="span" color="primary.main">
                  Cookie Policy
                </Typography>{' '}
              </Typography>
            </Stack>
            <Button variant="contained" sx={{ ml: { xs: 0 } }}>
              Submit Now
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
