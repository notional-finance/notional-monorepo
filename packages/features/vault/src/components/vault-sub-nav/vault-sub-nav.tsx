import { styled, Box, useTheme } from '@mui/material';
import { Label } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/shared-config';

const subNavData = [
  {
    label: 'Overview',
    link: '',
  },
  {
    label: 'Market Returns',
    link: '',
  },
  {
    label: 'Yield Drivers',
    link: '',
  },
  {
    label: 'Strategy Yields',
    link: '',
  },
  {
    label: 'Back to top',
    link: '',
  },
  {
    label: 'Full Documentation',
    link: '',
  },
];

export const VaultSubNav = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100%',
        height: '70px',
        top: '74px',
        position: 'fixed',
        zIndex: 1,
        display: 'flex',
        background: theme.palette.background.accentDefault,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          margin: theme.spacing(0, 8),
        }}
      >
        {subNavData.map(({ label }) => {
          return <NavItem>{label}</NavItem>;
        })}
      </Box>
      <Box sx={{ width: '543px' }}></Box>
    </Box>
  );
};

export const NavItem = styled(Label)(
  ({ theme }) => `
  cursor: pointer;
  display: flex;
  flex: 1;
  align-items: center;
  color: ${theme.palette.typography.contrastText};
  justify-content: center;
`
);
