'use client';

import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';

// project import
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// ==============================|| COMPONENTS - CHECKBOX ||============================== //

export default function ComponentCheckbox() {
  const [checked, setChecked] = useState([true, false]);

  const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([event.target.checked, event.target.checked]);
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([event.target.checked, checked[1]]);
  };

  const handleChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([checked[0], event.target.checked]);
  };

  const children = (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      <FormControlLabel label="Child 1" control={<Checkbox checked={checked[0]} onChange={handleChange2} />} />
      <FormControlLabel label="Child 2" control={<Checkbox checked={checked[1]} onChange={handleChange3} />} />
    </Box>
  );
  return (
    <>
      <ComponentHeader
        title="Checkbox"
        caption="Checkboxes allow the user to select one or more items from a set."
        directory="src/pages/components-overview/checkbox"
        link="https://mui.com/material-ui/react-checkbox/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <MainCard title="Basic">
              <Checkbox />
              <Checkbox defaultChecked />
              <Checkbox defaultChecked />
              <Checkbox defaultChecked disabled />
              <Checkbox disabled />
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Colors">
              <Checkbox />
              <Checkbox defaultChecked color="secondary" />
              <Checkbox defaultChecked color="success" />
              <Checkbox defaultChecked color="warning" />
              <Checkbox defaultChecked color="info" />
              <Checkbox defaultChecked color="error" />
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Size">
              <Checkbox defaultChecked />
              <Checkbox defaultChecked className="size-medium" />
              <Checkbox defaultChecked className="size-large" />
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Label Placement">
              <FormControl component="fieldset">
                <FormGroup aria-label="position" row>
                  <FormControlLabel value="top" control={<Checkbox />} label="Top" labelPlacement="top" />
                  <FormControlLabel
                    value="start"
                    control={<Checkbox defaultChecked />}
                    label="Start"
                    labelPlacement="start"
                    sx={{ mr: 1 }}
                  />
                  <FormControlLabel value="bottom" control={<Checkbox />} label="Bottom" labelPlacement="bottom" />
                  <FormControlLabel value="end" control={<Checkbox defaultChecked />} label="End" labelPlacement="end" sx={{ ml: 1 }} />
                </FormGroup>
              </FormControl>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Indeterminate">
              <>
                <FormControlLabel
                  label="Parent"
                  control={
                    <Checkbox checked={checked[0] && checked[1]} indeterminate={checked[0] !== checked[1]} onChange={handleChange1} />
                  }
                />
                {children}
              </>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
