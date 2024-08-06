'use client';

import { useState } from 'react';

// material-ui
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import AntAvatar from 'components/@extended/Avatar';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import MailOutlined from '@ant-design/icons/MailOutlined';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| COMPONENTS - BADGES ||============================== //

export default function ComponentBadge() {
  const [count, setCount] = useState(1);
  const [invisible, setInvisible] = useState(false);

  const handleBadgeVisibility = () => {
    setInvisible(!invisible);
  };

  return (
    <>
      <ComponentHeader
        title="Badge"
        caption="Badge generates a small badge to the top-right of its child(ren)."
        directory="src/pages/components-overview/badges"
        link="https://mui.com/material-ui/react-badge/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <MainCard title="Basic">
              <Grid container spacing={3}>
                <Grid item>
                  <Badge badgeContent={4} color="primary">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="secondary">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="success">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="warning">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="info">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="error">
                    <MailOutlined />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Light">
              <Grid container spacing={3}>
                <Grid item>
                  <Badge badgeContent={4} color="primary" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="secondary" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="success" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="warning" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="info" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="error" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Maximmum Value">
              <Grid container spacing={4}>
                <Grid item>
                  <Badge badgeContent={99} color="primary">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={100} color="secondary">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={1000} max={999} color="primary" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={99} color="secondary" variant="light">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent={99} color="error">
                    <MailOutlined />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Dot Badges">
              <Grid container spacing={3}>
                <Grid item>
                  <Badge color="primary" variant="dot">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="secondary" variant="dot">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge max={999} color="success" variant="dot">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="warning" variant="dot">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="info" variant="dot">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="error" variant="dot">
                    <Typography variant="h6">Typography</Typography>
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Alignment">
              <Grid container spacing={4}>
                <Grid item>
                  <Badge badgeContent={9} color="primary">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="primary" variant="dot">
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge
                    badgeContent={9}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                  >
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge
                    badgeContent={9}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left'
                    }}
                  >
                    <MailOutlined />
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge
                    badgeContent={99}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left'
                    }}
                  >
                    <MailOutlined />
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Overlap">
              <Grid container spacing={2}>
                <Grid item>
                  <Badge color="error" overlap="circular" variant="dot">
                    <AntAvatar alt="Basic">
                      <UserOutlined />
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="error" variant="dot">
                    <AntAvatar alt="Basic" variant="rounded" type="filled">
                      <UserOutlined />
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge color="error" variant="dot">
                    <AntAvatar alt="Basic" variant="square" type="outlined">
                      <UserOutlined />
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent=" " color="error" overlap="circular">
                    <AntAvatar alt="Basic" type="outlined">
                      U
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent=" " color="error">
                    <AntAvatar alt="Basic" variant="rounded" type="filled">
                      U
                    </AntAvatar>
                  </Badge>
                </Grid>
                <Grid item>
                  <Badge badgeContent=" " color="error">
                    <AntAvatar alt="Basic" variant="square" type="outlined">
                      U
                    </AntAvatar>
                  </Badge>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Visibility">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Badge color="primary" badgeContent={count}>
                      <MailOutlined />
                    </Badge>
                    <ButtonGroup>
                      <Button
                        aria-label="reduce"
                        onClick={() => {
                          setCount(Math.max(count - 1, 0));
                        }}
                      >
                        <MinusOutlined />
                      </Button>
                      <Button
                        aria-label="increase"
                        onClick={() => {
                          setCount(count + 1);
                        }}
                      >
                        <PlusOutlined />
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Badge color="primary" variant="dot" invisible={invisible}>
                      <MailOutlined />
                    </Badge>
                    <FormControlLabel
                      sx={{ color: 'text.primary' }}
                      control={<Switch checked={!invisible} onChange={handleBadgeVisibility} />}
                      label="Show Badge"
                      labelPlacement="start"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
