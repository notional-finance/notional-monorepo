'use client';

import { useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';

// ==============================|| COMPONENTS - TEXT FEILD ||============================== //

interface State {
  password: string;
  showPassword: boolean;
}

export default function ComponentTextField() {
  const [values, setValues] = useState({
    password: '',
    showPassword: false
  });

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword
    });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <ComponentHeader
        title="Text Field"
        caption="Text fields let users enter and edit text."
        directory="src/pages/components-overview/textfield"
        link="https://mui.com/material-ui/react-text-field/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Stack spacing={3}>
              <MainCard title="Basic">
                <Stack spacing={2}>
                  <TextField id="outlined-basic" placeholder="Outlined" />
                  <TextField id="filled-basic" label="Filled" variant="filled" />
                  <TextField id="standard-basic" label="Standard" variant="standard" />
                </Stack>
              </MainCard>
              <MainCard title="Form Props">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <TextField required id="outlined-required" placeholder="Required *" defaultValue="Hello World" />
                      <TextField id="helper-text-basic" placeholder="Helper text" helperText="Helper text" />
                      <TextField id="outlined-number" placeholder="Number" type="number" />
                      <TextField
                        id="outlined-number"
                        defaultValue="Read Only"
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={values.showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange('password')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              color="secondary"
                            >
                              {values.showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <FormControl variant="standard">
                        <Stack spacing={3}>
                          <InputLabel shrink htmlFor="with-label-input">
                            With Label
                          </InputLabel>
                          <TextField id="with-label-input" placeholder="With Label" />
                        </Stack>
                      </FormControl>
                      <TextField id="disabled-basic" placeholder="Disabled" disabled />
                      <TextField id="filled-search" placeholder="Search" type="search" />
                    </Stack>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="With Icon">
                <Stack spacing={2}>
                  <OutlinedInput id="start-adornment-email" placeholder="Email / UserId" startAdornment={<MailOutlined />} />
                  <OutlinedInput
                    id="end-adornment-password"
                    type="password"
                    placeholder="Password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" edge="end" color="secondary">
                          <EyeInvisibleOutlined />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Stack>
              </MainCard>
              <MainCard title="Sizes">
                <Stack spacing={2}>
                  <TextField id="outlined-basic-small" placeholder="Small" size="small" />
                  <TextField id="outlined-basic-default" placeholder="Medium" />
                  <TextField
                    id="outlined-basic-custom"
                    placeholder="Custom"
                    sx={{
                      '& .MuiInputLabel-root': { fontSize: '1rem' },
                      '& .MuiOutlinedInput-root': { fontSize: '1rem' }
                    }}
                  />
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Stack spacing={3}>
              <MainCard title="Event">
                <TextField id="outlined-basic-auto" placeholder="Auto Focus" autoFocus />
              </MainCard>
              <MainCard title="Validation">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField error id="outlined-error" placeholder="Error" defaultValue="Hello World" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      error
                      id="outlined-error-helper-text"
                      placeholder="Error"
                      defaultValue="Hello World"
                      helperText="Incorrect entry."
                    />
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Multiline">
                <TextField
                  id="outlined-multiline-static"
                  fullWidth
                  placeholder="Multiline"
                  multiline
                  rows={5}
                  defaultValue="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text"
                />
              </MainCard>
              <MainCard title="Input Adornments">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <TextField
                        placeholder="Website URL"
                        id="url-start-adornment"
                        InputProps={{
                          startAdornment: 'https://'
                        }}
                      />
                      <TextField
                        placeholder="Website URL"
                        id="outlined-end-adornment"
                        InputProps={{
                          endAdornment: '.com'
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <OutlinedInput
                        id="text-adornment-password"
                        type="password"
                        placeholder="Password"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" edge="end" color="secondary">
                              <EyeInvisibleOutlined />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <TextField
                        placeholder="0.00"
                        id="outlined-start-adornment"
                        InputProps={{
                          startAdornment: '$'
                        }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Full Width">
                <TextField fullWidth id="outlined-basic-fullwidth" placeholder="Fullwidth" />
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
