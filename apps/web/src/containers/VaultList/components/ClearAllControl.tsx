import { alpha, Button as MuiButton, useTheme } from '@mui/material';

export const ClearAllControl = () => {
  const theme = useTheme();

  return (
    <MuiButton
      disableRipple
      sx={{
        height: theme.spacing(5.5),
        minWidth: 0,
        padding: theme.spacing(0, 2.5),
        borderRadius: theme.shape.borderRadius(),
        border: 'none',
        boxShadow: 'none',
        backgroundColor: theme.palette.common.white,
        color: theme.palette.typography.light,
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '20px',
        textTransform: 'none',
        transition: 'all .2s ease-in-out',
        '&:hover': {
          border: 'none',
          boxShadow: 'none',
          color: theme.palette.primary.light,
          backgroundColor: alpha(theme.palette.primary.light, 0.2),
        },
      }}
    >
      Clear All
    </MuiButton>
  );
};
