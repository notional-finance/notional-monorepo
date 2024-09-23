'use client';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { DataCardMiddleware } from 'types/org-chart';

// assets
import FacebookFilled from '@ant-design/icons/FacebookFilled';
import LinkedinFilled from '@ant-design/icons/LinkedinFilled';
import TwitterSquareFilled from '@ant-design/icons/TwitterSquareFilled';

// ==============================|| ORGANIZATION CHART - DATACARD||============================== //

export default function DataCard({ name, role, avatar, linkedin, facebook, skype, root }: DataCardMiddleware) {
  const theme = useTheme();

  const linkHandler = (link: string) => {
    if (typeof window !== 'undefined') window.open(link);
  };

  return (
    <MainCard
      sx={{
        bgcolor: root ? alpha(theme.palette.primary.lighter, 0.6) : alpha(theme.palette.secondary.lighter, 0.4),
        border: '1px solid',
        borderColor: root ? 'primary.light' : 'secondary.light',
        width: 'max-content',
        m: '0px auto',
        p: 1.5,
        direction: 'ltr'
      }}
      border={false}
      content={false}
    >
      <Stack direction="row" spacing={2}>
        <Avatar sx={{ mt: 0.3 }} src={avatar} size="sm" />
        <Stack spacing={1.5}>
          <Stack alignItems="flex-start">
            <Typography variant="subtitle1" color={root ? 'primary.main' : 'text.primary'}>
              {name}
            </Typography>
            {!root && (
              <Chip
                label={role}
                sx={{ fontSize: '0.675rem', '& .MuiChip-label': { px: 0.75 }, width: 'max-content' }}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {root && (
              <Typography color="primary.darker" variant="caption">
                {role}
              </Typography>
            )}
          </Stack>
          <Stack spacing={0} direction="row">
            <IconButton color="secondary" onClick={() => linkHandler(linkedin)} size="small" sx={{ color: 'secondary.600' }}>
              <LinkedinFilled style={{ fontSize: '1.15rem' }} />
            </IconButton>
            <IconButton color="primary" onClick={() => linkHandler(facebook)} size="small" sx={{ color: 'primary.600' }}>
              <FacebookFilled style={{ fontSize: '1.15rem' }} />
            </IconButton>
            <IconButton color="info" onClick={() => linkHandler(skype)} size="small">
              <TwitterSquareFilled style={{ fontSize: '1.15rem' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
