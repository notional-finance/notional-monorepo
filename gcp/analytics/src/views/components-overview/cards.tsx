'use client';
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

import CardTabs from 'sections/components-overview/cards/CardTabs';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

const mediaImage = '/assets/images/component/card-media.png';

// ==============================|| COMPONENTS - CARD ||============================== //

export default function ComponentCard() {
  const theme = useTheme();

  const cardAction = (
    <ToggleButtonGroup
      fullWidth
      color="primary"
      exclusive
      aria-label="text alignment"
      size="small"
      sx={{
        p: 1,
        '& .MuiToggleButton-root': {
          borderRadius: 0,
          p: 0.75,
          '&:not(.Mui-selected)': {
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent'
          },
          '&:first-of-type': {
            borderLeftColor: 'transparent'
          },
          '&:last-of-type': {
            borderRightColor: 'transparent'
          },
          '&:hover': {
            bgcolor: 'transparent',
            color: 'primary.main'
          }
        }
      }}
    >
      <ToggleButton value="web" aria-label="web">
        <SettingOutlined />
      </ToggleButton>
      <ToggleButton value="android" aria-label="android">
        <EditOutlined />
      </ToggleButton>
      <ToggleButton value="ios" aria-label="ios">
        <EllipsisOutlined />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <>
      <ComponentHeader
        title="Card"
        caption="Cards contain content and actions about a single subject."
        directory="src/pages/components-overview/cards"
        link="https://mui.com/material-ui/react-card/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <MainCard title="Basic">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MainCard border={false} boxShadow shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
                    <Typography variant="h6">Card Subtitle</Typography>
                    <Typography variant="caption" color="text.secondary">
                      This is card description
                    </Typography>
                  </MainCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MainCard title="Card Title" border={false} boxShadow shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
                    <Typography variant="h6">Card Subtitle</Typography>
                    <Typography variant="caption" color="text.secondary">
                      This is card description
                    </Typography>
                  </MainCard>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Outlined">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MainCard sx={{ height: '100%' }}>
                    <Typography variant="h6">Card Subtitle</Typography>
                    <Typography variant="caption" color="text.secondary">
                      This is card description
                    </Typography>
                  </MainCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MainCard title="Card Title" sx={{ height: '100%' }}>
                    <Typography variant="h6">Card Subtitle</Typography>
                    <Typography variant="caption" color="text.secondary">
                      This is card description
                    </Typography>
                  </MainCard>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Action">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <MainCard
                    title="Card Title"
                    secondary={
                      <NextLink href="/" passHref legacyBehavior>
                        <Link color="primary">More</Link>
                      </NextLink>
                    }
                  >
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      Card Subtitle
                    </Typography>
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero dignissim.
                    </Typography>
                  </MainCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MainCard
                    title="Card Title"
                    secondary={
                      <IconButton size="small" color="secondary">
                        <MoreOutlined style={{ fontSize: '1.15rem' }} />
                      </IconButton>
                    }
                  >
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      Card Subtitle
                    </Typography>
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero dignissim, viverra augue eu, semper
                      ligula. Mauris purus sem.
                    </Typography>
                  </MainCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MainCard
                    title="Card Title"
                    secondary={
                      <IconButton size="small" color="secondary">
                        <MoreOutlined style={{ fontSize: '1.15rem' }} />
                      </IconButton>
                    }
                    content={false}
                  >
                    <CardContent>
                      <Typography variant="h5" color="text.secondary" gutterBottom>
                        Card Subtitle
                      </Typography>
                      <Typography variant="body1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                    </CardContent>
                    <Divider />
                    {cardAction}
                  </MainCard>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Complex Interaction">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <MainCard content={false}>
                    <CardTabs />
                  </MainCard>
                </Grid>
                <Grid item xs={12}>
                  <MainCard
                    title="Card Title"
                    divider={false}
                    content={false}
                    secondary={
                      <NextLink href="/" passHref legacyBehavior>
                        <Link color="primary">More</Link>
                      </NextLink>
                    }
                  >
                    <CardTabs activeTab={2} />
                  </MainCard>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Media">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={4}>
                  <MainCard content={false}>
                    <CardMedia component="img" image={mediaImage} alt="green iguana" />
                    <CardContent>
                      <Typography variant="h5" color="text.secondary" gutterBottom>
                        Card Subtitle
                      </Typography>
                      <Typography variant="body1">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero dignissim, viverra augue eu.
                      </Typography>
                    </CardContent>
                    <Divider />
                    {cardAction}
                  </MainCard>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <MainCard
                    title="Card Title"
                    secondary={
                      <IconButton size="small" color="secondary">
                        <MoreOutlined style={{ fontSize: '1.15rem' }} />
                      </IconButton>
                    }
                    content={false}
                  >
                    <CardMedia component="img" image={mediaImage} />
                    <CardContent>
                      <Typography variant="h5" color="text.secondary" gutterBottom>
                        Card Subtitle
                      </Typography>
                      <Typography variant="body1">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero dignissim, viverra augue eu,
                      </Typography>
                    </CardContent>
                  </MainCard>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <MainCard
                    title="Card Title"
                    secondary={
                      <IconButton size="small" color="secondary">
                        <MoreOutlined style={{ fontSize: '1.15rem' }} />
                      </IconButton>
                    }
                    content={false}
                  >
                    <CardMedia component="img" image={mediaImage} alt="green iguana" />
                    <CardContent>
                      <Typography variant="h5" color="text.secondary" gutterBottom>
                        Card Subtitle
                      </Typography>
                      <Typography variant="body1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                    </CardContent>
                    <Divider />
                    {cardAction}
                  </MainCard>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
