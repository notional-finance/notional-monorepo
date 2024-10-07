// material-ui
import Avatar from '@mui/material/Avatar';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import Dot from 'components/@extended/Dot';

// assets
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';

const iconSX = { fontSize: '0.675rem' };

// ===========================|| DATA WIDGET - NEW CUSTOMERS CARD ||=========================== //

export default function NewCustomers() {
  return (
    <MainCard title="New Customers" content={false}>
      <SimpleBar sx={{ height: 334 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar1} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        Cheers!
                      </Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar2} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        stay hungry stay foolish!
                      </Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar3} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        Cheers!
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="secondary">
                          30 min ago
                        </Typography>
                        <ClockCircleOutlined style={iconSX} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar4} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        stay hungry stay foolish!
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="secondary">
                          10 min ago
                        </Typography>
                        <ClockCircleOutlined style={iconSX} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar5} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">Shirley Hoe</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        Cheers!
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="secondary">
                          30 min ago
                        </Typography>
                        <ClockCircleOutlined style={iconSX} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar1} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        Cheers!
                      </Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar2} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        stay hungry stay foolish!
                      </Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar3} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        Cheers!
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="secondary">
                          10 min ago
                        </Typography>
                        <ClockCircleOutlined style={iconSX} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar4} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        stay hungry stay foolish!
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="secondary">
                          10 min ago
                        </Typography>
                        <ClockCircleOutlined style={iconSX} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt="coverimage" src={Avatar5} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography variant="subtitle1">Shirley Hoe</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="caption" color="secondary">
                        Cheers!
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="secondary">
                          30 min ago
                        </Typography>
                        <ClockCircleOutlined style={iconSX} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </SimpleBar>
    </MainCard>
  );
}
