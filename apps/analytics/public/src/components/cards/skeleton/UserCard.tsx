// material-ui
import Avatar from '@mui/material/Avatar';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// project import
import MainCard from 'components/MainCard';

// assets
import ContactsOutlined from '@ant-design/icons/ContactsOutlined';

// ===========================|| SKELETON - USER EMPTY CARD ||=========================== //

export default function UserCard() {
  return (
    <MainCard
      border={false}
      content={false}
      boxShadow
      sx={{ boxShadow: `rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px`, borderRadius: 2 }}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack flexDirection="row" alignItems="center">
              <Avatar>
                <ContactsOutlined style={{ visibility: 'inherit' }} />
              </Avatar>
              <Stack sx={{ width: '100%', pl: 2.5 }}>
                <Skeleton animation={false} height={20} width="80%" />
                <Skeleton animation={false} height={20} width="40%" />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Skeleton animation={false} height={20} width={45} />
            <Skeleton animation={false} height={20} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Skeleton animation={false} height={20} width={90} />
              <Skeleton animation={false} height={20} width={38} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Grid container spacing={1}>
                <Grid item>
                  <Skeleton animation={false} height={20} width={40} />
                </Grid>
                <Grid item>
                  <Skeleton animation={false} height={17} width={20} />
                </Grid>
              </Grid>
              <Skeleton animation={false} height={32} width={47} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
