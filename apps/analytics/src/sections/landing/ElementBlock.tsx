// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// third party
import { motion } from 'framer-motion';

// project import
import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
const imgelementmsg = 'assets/images/landing/img-element-msg.png';
const imgelementwidget = 'assets/images/landing/img-element-widget.png';

// ==============================|| LANDING - ELEMENT PAGE ||============================== //

export default function ElementBlock() {
  const theme = useTheme();
  const { mode, presetColor } = useConfig();

  const checkIcon = <CheckCircleOutlined style={{ color: theme.palette.primary.main, fontSize: '1.15rem' }} />;

  return (
    <Box
      sx={{
        overflowX: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '45%',
          bottom: 0,
          left: 0,
          bgcolor: mode === ThemeMode.DARK ? 'grey.100' : 'secondary.800',
          [theme.breakpoints.down('sm')]: { height: '60%' }
        },
        '@keyframes slideY': {
          '0%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(0px)'
          },
          '100%': {
            transform: 'translateY(0px)'
          },
          '25%': {
            transform: 'translateY(-20px)'
          },
          '75%': {
            transform: 'translateY(20px)'
          }
        }
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
              <Grid item sm={10} md={6}>
                <Grid container spacing={1} justifyContent="center">
                  <Grid item xs={12}>
                    <Typography variant="h2">
                      Create Beautiful Yet Powerful
                      <Box sx={{ display: 'block' }}>
                        <Box component="span" sx={{ mr: 1, color: 'primary.main' }}>
                          web apps
                        </Box>
                        with Mantis React
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      Create your powerful backend project using powerful design system of Mantis React Template.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
              >
                <CardMedia
                  component="img"
                  image={`/assets/images/landing/img-element-main-${presetColor}.png`}
                  sx={{ width: '100%', m: '0 auto' }}
                />
              </motion.div>
              <Box
                sx={{
                  width: 'auto',
                  position: 'absolute',
                  top: '3%',
                  right: '-17%',
                  animation: '10s slideY linear infinite',
                  animationDelay: '2s',
                  [theme.breakpoints.down('sm')]: { display: 'none' }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30,
                    delay: 0.4
                  }}
                >
                  <CardMedia
                    component="img"
                    image={imgelementmsg}
                    sx={{
                      width: 'auto',
                      position: 'absolute',
                      top: '3%',
                      right: '-17%',
                      [theme.breakpoints.down('sm')]: { display: 'none' }
                    }}
                  />
                </motion.div>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '-17%',
                  width: 'auto',
                  animation: '10s slideY linear infinite',
                  animationDelay: '2s',
                  [theme.breakpoints.down('sm')]: { display: 'none' }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
                >
                  <CardMedia
                    component="img"
                    image={imgelementwidget}
                    sx={{
                      width: 'auto',
                      position: 'absolute',
                      bottom: '20%',
                      left: '-17%',
                      [theme.breakpoints.down('sm')]: { display: 'none' }
                    }}
                  />
                </motion.div>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Auth Methods : JWT, Auth0, Firebase
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Internationalization Support
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Mock API
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Code Splitting
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      React Hooks
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Google Fonts
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      RTL Support
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Light/Dark, Semi Dark Support
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item>{checkIcon}</Grid>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body1" color="secondary">
                      Prettier Code Style
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
