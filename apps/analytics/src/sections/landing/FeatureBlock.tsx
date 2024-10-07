// next
import Image from 'next/image';

// material-ui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import Animation from './Animation';

// assets
const imgfeature1 = '/assets/images/landing/img-feature1.svg';
const imgfeature2 = '/assets/images/landing/img-feature2.svg';
const imgfeature3 = '/assets/images/landing/img-feature3.svg';

// ==============================|| LANDING - FEATURE PAGE ||============================== //

export default function FeatureBlock() {
  return (
    <Container>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid item xs={12}>
          <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Grid item sm={10} md={6}>
              <Grid container spacing={1} justifyContent="center">
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary">
                    Mantis nailed it!
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    Why Mantis?
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Customize everything with the Mantis React Material-UI Dashboard Template built with latest MUI v5 component library
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Animation
            variants={{
              hidden: { opacity: 0, translateY: 550 },
              visible: { opacity: 1, translateY: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Image src={imgfeature1} alt="feature" width={48} height={48} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    Professional Design
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" color="secondary">
                    Mantis has fully professional grade user interface for any kind of backend project.
                  </Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Animation
            variants={{
              hidden: { opacity: 0, translateY: 550 },
              visible: { opacity: 1, translateY: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Image src={imgfeature2} alt="feature" width={48} height={48} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    Flexible Solution
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" color="secondary">
                    Highly flexible to work around using Mantis React Template.
                  </Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Animation
            variants={{
              hidden: { opacity: 0, translateY: 550 },
              visible: { opacity: 1, translateY: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Image src={imgfeature3} alt="feature" width={48} height={48} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    Effective Documentation
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" color="secondary">
                    Need help? Check out the detailed Documentation guide.
                  </Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
      </Grid>
    </Container>
  );
}
