'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import BugFilled from '@ant-design/icons/BugFilled';
import BugTwoTone from '@ant-design/icons/BugTwoTone';
import CheckSquareFilled from '@ant-design/icons/CheckSquareFilled';
import CheckSquareTwoTone from '@ant-design/icons/CheckSquareTwoTone';
import DatabaseFilled from '@ant-design/icons/DatabaseFilled';
import DatabaseTwoTone from '@ant-design/icons/DatabaseTwoTone';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';
import InfoCircleFilled from '@ant-design/icons/InfoCircleFilled';
import QuestionCircleFilled from '@ant-design/icons/QuestionCircleFilled';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import QuestionCircleTwoTone from '@ant-design/icons/QuestionCircleTwoTone';
import WarningFilled from '@ant-design/icons/WarningFilled';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import WarningTwoTone from '@ant-design/icons/WarningTwoTone';

// ==============================|| COMPONENTS - ALERTS ||============================== //

export default function ComponentAlert() {
  const theme = useTheme();

  return (
    <>
      <ComponentHeader
        title="Alert"
        caption="An alert displays a short, important message in a way that attracts the user's attention without interrupting the user's task."
        directory="src/pages/components-overview/alert"
        link="https://mui.com/material-ui/react-alert/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <MainCard title="Basic">
                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert color="primary" icon={<QuestionCircleFilled />}>
                    Primary Text
                  </Alert>
                  <Alert color="secondary" icon={<DatabaseFilled />}>
                    Secondary Text
                  </Alert>
                  <Alert color="success" icon={<CheckSquareFilled />}>
                    Success Text
                  </Alert>
                  <Alert color="warning" icon={<WarningFilled />}>
                    Warning Text
                  </Alert>
                  <Alert color="info" icon={<InfoCircleFilled />}>
                    Info Text
                  </Alert>
                  <Alert color="error" icon={<BugFilled />}>
                    Error Text
                  </Alert>
                </Stack>
              </MainCard>
              <MainCard title="Actions">
                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert
                    variant="border"
                    color="success"
                    onClose={() => {}}
                    sx={{
                      '& .MuiIconButton-root:focus-visible': {
                        outline: `2px solid ${theme.palette.success.dark}`,
                        outlineOffset: 2
                      }
                    }}
                  >
                    Success Text
                  </Alert>
                  <Alert
                    variant="border"
                    color="warning"
                    icon={<WarningOutlined />}
                    action={
                      <Button color="warning" size="small">
                        Undo
                      </Button>
                    }
                  >
                    Warning Text
                  </Alert>
                  <Alert
                    variant="border"
                    color="primary"
                    icon={<QuestionCircleOutlined />}
                    action={
                      <Button variant="contained" size="small">
                        Continue
                      </Button>
                    }
                  >
                    Primary Text
                  </Alert>
                </Stack>
              </MainCard>
              <MainCard title="Filled">
                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert color="primary" variant="filled" icon={<QuestionCircleFilled />}>
                    Primary Text
                  </Alert>
                  <Alert color="secondary" variant="filled" icon={<DatabaseFilled />}>
                    Secondary Text
                  </Alert>
                  <Alert color="success" variant="filled" icon={<CheckSquareFilled />}>
                    Success Text
                  </Alert>
                  <Alert color="warning" variant="filled" icon={<WarningFilled />}>
                    Warning Text
                  </Alert>
                  <Alert color="info" variant="filled" icon={<InfoCircleFilled />}>
                    Info Text
                  </Alert>
                  <Alert color="error" variant="filled" icon={<BugFilled />}>
                    Error Text
                  </Alert>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <MainCard title="Description">
                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert color="primary" variant="border" icon={<QuestionCircleFilled />}>
                    <AlertTitle>Primary Text</AlertTitle>
                    <Typography variant="h6"> This is an primary alert.</Typography>
                  </Alert>
                  <Alert color="secondary" variant="border" icon={<DatabaseFilled />}>
                    <AlertTitle>Secondary Text</AlertTitle>
                    <Typography variant="h6"> This is an secondary alert.</Typography>
                  </Alert>
                  <Alert color="success" variant="border" icon={<CheckSquareFilled />}>
                    <AlertTitle>Success Text</AlertTitle>
                    <Typography variant="h6"> This is an success alert.</Typography>
                  </Alert>
                  <Alert color="warning" variant="border" icon={<WarningFilled />}>
                    <AlertTitle>Warning Text</AlertTitle>
                    <Typography variant="h6"> This is an warning alert.</Typography>
                  </Alert>
                  <Alert color="info" variant="border" icon={<InfoCircleFilled />}>
                    <AlertTitle>Info Text</AlertTitle>
                    <Typography variant="h6"> This is an info alert.</Typography>
                  </Alert>
                  <Alert color="error" variant="border" icon={<BugFilled />}>
                    <AlertTitle>Error Text</AlertTitle>
                    <Typography variant="h6"> This is an error alert.</Typography>
                  </Alert>
                </Stack>
              </MainCard>
              <MainCard title="Outlined">
                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert color="primary" variant="outlined" icon={<QuestionCircleTwoTone />}>
                    Primary Text
                  </Alert>
                  <Alert color="secondary" variant="outlined" icon={<DatabaseTwoTone twoToneColor={theme.palette.secondary.main} />}>
                    Secondary Text
                  </Alert>
                  <Alert color="success" variant="outlined" icon={<CheckSquareTwoTone twoToneColor={theme.palette.success.main} />}>
                    Success Text
                  </Alert>
                  <Alert color="warning" variant="outlined" icon={<WarningTwoTone twoToneColor={theme.palette.warning.main} />}>
                    Warning Text
                  </Alert>
                  <Alert color="info" variant="outlined" icon={<InfoCircleTwoTone twoToneColor={theme.palette.info.main} />}>
                    Info Text
                  </Alert>
                  <Alert color="error" variant="outlined" icon={<BugTwoTone twoToneColor={theme.palette.error.main} />}>
                    Error Text
                  </Alert>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
