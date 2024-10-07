// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';
import Avatar from 'components/@extended/Avatar';
import { ThemeMode } from 'config';

// types
import { KanbanComment, KanbanProfile } from 'types/kanban';

interface Props {
  comment: KanbanComment;
  profile: KanbanProfile;
}

// ==============================|| KANBAN BOARD - ITEM COMMENT ||============================== //

export default function ItemComment({ comment, profile }: Props) {
  const theme = useTheme();

  return (
    <MainCard content={false} sx={{ bgcolor: theme.palette.mode === ThemeMode.DARK ? 'grey.100' : 'grey.50', p: 1.5, mt: 1.25 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container wrap="nowrap" alignItems="center" spacing={1}>
            <Grid item>
              <Avatar
                sx={{ width: 24, height: 24 }}
                size="sm"
                alt="User 1"
                src={profile && profile.avatar && `/assets/images/users/${profile.avatar}`}
              />
            </Grid>
            <Grid item xs zeroMinWidth>
              <Grid container alignItems="center" spacing={1} justifyContent="space-between">
                <Grid item>
                  <Typography variant="subtitle1">{profile.name}</Typography>
                </Grid>
                <Grid item>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Dot size={6} sx={{ mt: -0.25 }} color="secondary" />
                    <Typography variant="caption" color="secondary">
                      {profile.time}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ '&.MuiGrid-root': { pt: 1.5 } }}>
          <Typography variant="body2">{comment?.comment}</Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}
