// next
import Image from 'next/image';
import NextLink from 'next/link';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// project import
import Animation from './Animation';
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import SendOutlined from '@ant-design/icons/SendOutlined';
const imgdemo1 = '/assets/images/landing/img-demo1.jpg';
const imgdemo2 = '/assets/images/landing/img-demo2.jpg';
const imgdemo3 = '/assets/images/landing/img-demo3.jpg';

// ==============================|| LANDING - DEMO PAGE ||============================== //

export default function DemoBlock() {
  return (
    <Container>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid item xs={12}>
          <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Grid item sm={10} md={6}>
              <Grid container spacing={1} justifyContent="center">
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary">
                    Mantis for All
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    Complete Combo
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Wheather you are developer or designer, Mantis serve the need of all - No matter you are novice or expert
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <Animation
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Design Source File
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" color="secondary">
                    Check the live preview of Mantis figma design file. Figma file included in Plus and Extended License only.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'inline-block' }}>
                    <AnimateButton>
                      <Button
                        variant="outlined"
                        endIcon={<SendOutlined />}
                        sx={{ my: 2 }}
                        component={Link}
                        href="https://www.figma.com/file/NJGFukWMHgU0LVhS4qLP4A/Mantis?node-id=106412%3A169520"
                        target="_blank"
                      >
                        Preview Figma
                      </Button>
                    </AnimateButton>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative', width: `calc(100% + 24px)`, mb: '-30px !important' }}>
                    <Image src={imgdemo2} alt="feature" width={370} height={325} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Animation
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3, bgcolor: 'primary.lighter' }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Components
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" color="secondary">
                    Check the all components of Mantis in single place with search feature for easing your development while working.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'inline-block' }}>
                    <AnimateButton>
                      <NextLink href="/components-overview/buttons" passHref legacyBehavior>
                        <Button variant="contained" sx={{ my: 2 }} component={Link} target="_blank">
                          View All Components
                        </Button>
                      </NextLink>
                    </AnimateButton>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative', width: `calc(100% + 24px)`, mb: '-30px !important' }}>
                    <Image src={imgdemo1} alt="feature" width={370} height={325} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Animation
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Documentation
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" color="secondary">
                    From Quick start to detailed installation with super easy navigation for find out solution of your queries with complex
                    documentation guide.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'inline-block' }}>
                    <AnimateButton>
                      <Button
                        variant="outlined"
                        sx={{ my: 2 }}
                        component={Link}
                        href="https://codedthemes.gitbook.io/mantis/"
                        target="_blank"
                      >
                        Explore Documentation
                      </Button>
                    </AnimateButton>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative', width: `calc(100% + 24px)`, mb: '-30px !important' }}>
                    <Image src={imgdemo3} alt="feature" width={370} height={325} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
      </Grid>
    </Container>
  );
}
