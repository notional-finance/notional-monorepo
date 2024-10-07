// next
import Image from 'next/image';

// material-ui
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project import
import Avatar from 'components/@extended/Avatar';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';

// assets
const Target = '/assets/images/analytics/target.svg';

// ==============================|| LABELLED TASKS ||============================== //

export default function LabelledTasks() {
  return (
    <Grid item xs={12}>
      <MainCard sx={{ width: '100%' }}>
        <Grid container spacing={1.25}>
          <Grid item xs={6}>
            <Typography>Published Project</Typography>
          </Grid>
          <Grid item xs={6}>
            <LinearWithLabel value={30} color="primary" />
          </Grid>
          <Grid item xs={6}>
            <Typography>Completed Task</Typography>
          </Grid>
          <Grid item xs={6}>
            <LinearWithLabel value={90} color="success" />
          </Grid>
          <Grid item xs={6}>
            <Typography>Pending Task</Typography>
          </Grid>
          <Grid item xs={6}>
            <LinearWithLabel value={50} color="error" />
          </Grid>
          <Grid item xs={6}>
            <Typography>Issues</Typography>
          </Grid>
          <Grid item xs={6}>
            <LinearWithLabel value={55} color="warning" />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <List sx={{ pb: 0 }}>
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent' }}>
                    <Image alt="target" src={Target} width={40} height={40} style={{ maxWidth: '100%', height: 'auto' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Income Salaries & Budget"
                  secondary="All your income salaries and budget comes here, you can track them or manage them"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </MainCard>
    </Grid>
  );
}
