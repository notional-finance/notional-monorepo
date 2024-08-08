'use client';

import { useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import LoadingButton from 'components/@extended/LoadingButton';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ToggleButtons from 'sections/components-overview/buttons/ToggleButtons';
import ButtonGroups from 'sections/components-overview/buttons/ButtonGroups';

// assets
import CameraFilled from '@ant-design/icons/CameraFilled';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DisconnectOutlined from '@ant-design/icons/DisconnectOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EnvironmentTwoTone from '@ant-design/icons/EnvironmentTwoTone';
import HomeFilled from '@ant-design/icons/HomeFilled';
import PlusCircleOutlined from '@ant-design/icons/PlusCircleOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import SmileFilled from '@ant-design/icons/SmileFilled';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// styles
const Input = styled('input')({
  display: 'none'
});
Input.displayName = 'Input';

// ==============================|| COMPOENETS - BUTTON ||============================== //

export default function Buttons() {
  const theme = useTheme();

  const [loading, setLoading] = useState({
    home: false,
    edit: false,
    address: false,
    add: false,
    submit: false,
    cancel: false
  });

  const loadingHandler = (state: string) => {
    setLoading({ ...loading, [state]: true });
    const timer = setTimeout(() => {
      setLoading({ ...loading, [state]: false });
    }, 1000);
    return () => clearTimeout(timer);
  };

  return (
    <>
      <ComponentHeader
        title="Buttons"
        caption="Buttons allow users to take actions, and make choices, with a single tap."
        directory="src/pages/components-overview/buttons"
        link="https://mui.com/material-ui/react-button/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <MainCard title="Basic Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="contained">Default</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Outlined Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="outlined">Default</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Dashed Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="dashed">Default</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="dashed" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="dashed" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="dashed" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="dashed" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="dashed" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Text Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button>Default</Button>
                  </Grid>
                  <Grid item>
                    <Button color="secondary">Secondary</Button>
                  </Grid>
                  <Grid item>
                    <Button color="info">Info</Button>
                  </Grid>
                  <Grid item>
                    <Button color="success">Success</Button>
                  </Grid>
                  <Grid item>
                    <Button color="warning">Warning</Button>
                  </Grid>
                  <Grid item>
                    <Button color="error">Error</Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Shadow Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="shadow">Default</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="shadow" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="shadow" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="shadow" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="shadow" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="shadow" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="With Icon">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="contained" startIcon={<HomeFilled />}>
                      Home
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="secondary" endIcon={<SmileFilled />}>
                      Profile
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="info" startIcon={<EnvironmentTwoTone twoToneColor={theme.palette.info.main} />}>
                      Address
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="success" startIcon={<PlusCircleOutlined />}>
                      Add
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="warning" endIcon={<SendOutlined />}>
                      Send
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button color="error" endIcon={<CloseOutlined />}>
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Button Size">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="contained" size="extraSmall">
                      Extra Small
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" size="small">
                      small
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained">Default</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" size="large">
                      Large
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Upload Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <label htmlFor="contained-button-file">
                      <Input accept="image/*" id="contained-button-file" multiple type="file" />
                      <Button variant="contained" component="span">
                        Upload
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <label htmlFor="icon-button-file">
                      <Input accept="image/*" id="icon-button-file" type="file" />
                      <IconButton variant="contained" shape="rounded" aria-label="upload picture" component="span">
                        <CameraFilled />
                      </IconButton>
                    </label>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Diabled Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Button disabled>Default</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" disabled>
                      Contained
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" disabled>
                      Outlined
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="dashed" color="success" disabled>
                      Dashed
                    </Button>
                  </Grid>
                  <Grid item>
                    <IconButton variant="contained" disabled>
                      <HomeFilled />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton variant="outlined" color="success" disabled>
                      <PlusCircleOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton variant="dashed" color="warning" disabled>
                      <SendOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton loading color="secondary">
                      <CloseOutlined />
                    </LoadingButton>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Block Level">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button variant="contained" fullWidth>
                      Primary
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="outlined" color="secondary" fullWidth>
                      Secondary
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <ToggleButtons />
              <ButtonGroups />
              <MainCard title="Fab">
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Fab color="primary" aria-label="add">
                      <PlusOutlined style={{ fontSize: '1.3rem' }} />
                    </Fab>
                  </Grid>
                  <Grid item>
                    <Fab color="info" aria-label="edit">
                      <EditOutlined style={{ fontSize: '1.3rem' }} />
                    </Fab>
                  </Grid>
                  <Grid item>
                    <Fab disabled aria-label="like">
                      <DisconnectOutlined style={{ fontSize: '1.3rem' }} />
                    </Fab>
                  </Grid>
                  <Grid item>
                    <Fab color="error" variant="extended">
                      Extended
                    </Fab>
                  </Grid>
                </Grid>
              </MainCard>

              <Typography variant="h5" sx={{ mt: 2 }}>
                Extended Button
              </Typography>
              <MainCard title="Icon Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <Tooltip title="Home">
                      <IconButton variant="contained">
                        <HomeFilled />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Profile">
                      <IconButton variant="contained" color="secondary">
                        <SmileFilled />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Address">
                      <IconButton variant="light" color="info">
                        <EnvironmentTwoTone twoToneColor={theme.palette.info.main} />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add">
                      <IconButton variant="outlined" color="success">
                        <PlusCircleOutlined />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Send">
                      <IconButton variant="dashed" color="warning">
                        <SendOutlined />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Delete">
                      <IconButton color="error">
                        <CloseOutlined />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item>
                    <Tooltip title="Home">
                      <IconButton shape="rounded" variant="contained">
                        <HomeFilled />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Profile">
                      <IconButton shape="rounded" variant="contained" color="secondary">
                        <SmileFilled />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Address">
                      <IconButton shape="rounded" variant="light" color="info">
                        <EnvironmentTwoTone twoToneColor={theme.palette.info.main} />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add">
                      <IconButton shape="rounded" variant="outlined" color="success">
                        <PlusCircleOutlined />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Send">
                      <IconButton shape="rounded" variant="dashed" color="warning">
                        <SendOutlined />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Delete">
                      <IconButton shape="rounded" color="error">
                        <CloseOutlined />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Loading Button">
                <Grid container spacing={2}>
                  <Grid item>
                    <LoadingButton loading variant="contained" loadingPosition="start" startIcon={<HomeFilled />}>
                      Home
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton loading color="secondary" variant="outlined" loadingPosition="end" endIcon={<SmileFilled />}>
                      Edit
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton loading color="info" variant="dashed" loadingIndicator="Loading...">
                      Address
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton loading color="success" variant="contained" shape="square">
                      <PlusCircleOutlined />
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton loading color="warning" variant="dashed" shape="rounded">
                      <SendOutlined />
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton loading color="error">
                      <CloseOutlined />
                    </LoadingButton>
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item>
                    <LoadingButton
                      loading={loading.home}
                      variant="contained"
                      loadingPosition="start"
                      startIcon={<HomeFilled />}
                      onClick={() => loadingHandler('home')}
                    >
                      Home
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton
                      loading={loading.edit}
                      color="secondary"
                      variant="outlined"
                      loadingPosition="end"
                      endIcon={<SmileFilled />}
                      onClick={() => loadingHandler('edit')}
                    >
                      Edit
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton
                      loading={loading.address}
                      color="info"
                      variant="dashed"
                      loadingIndicator="Loading..."
                      onClick={() => loadingHandler('address')}
                    >
                      Address
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add">
                      <span>
                        <LoadingButton
                          loading={loading.add}
                          color="success"
                          variant="contained"
                          shape="square"
                          onClick={() => loadingHandler('add')}
                        >
                          <PlusCircleOutlined />
                        </LoadingButton>
                      </span>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Send">
                      <span>
                        <LoadingButton
                          loading={loading.submit}
                          color="warning"
                          variant="dashed"
                          shape="rounded"
                          onClick={() => loadingHandler('submit')}
                        >
                          <SendOutlined />
                        </LoadingButton>
                      </span>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Cancel">
                      <span>
                        <LoadingButton loading={loading.cancel} color="error" onClick={() => loadingHandler('cancel')}>
                          <CloseOutlined />
                        </LoadingButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Animation">
                <Grid container spacing={2}>
                  <Grid item>
                    <AnimateButton>
                      <Button variant="contained">Default</Button>
                    </AnimateButton>
                  </Grid>
                  <Grid item>
                    <AnimateButton
                      scale={{
                        hover: 1.1,
                        tap: 0.9
                      }}
                    >
                      <Button variant="contained" color="info">
                        Scale
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid item>
                    <AnimateButton type="slide">
                      <Button variant="contained" color="success">
                        Slide
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid item>
                    <AnimateButton type="rotate">
                      <Tooltip title="Rotate">
                        <IconButton color="warning" variant="dashed" shape="rounded">
                          <SettingOutlined />
                        </IconButton>
                      </Tooltip>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
