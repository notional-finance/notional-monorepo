import { Box, ThemeProvider } from '@mui/material';
import { DropdownButton } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { NAV_DROPDOWN, THEME_VARIANTS } from '@notional-finance/shared-config';
import { useLocation } from 'react-router-dom';
import { BarChartIcon } from '@notional-finance/icons';
import HighYield from '../high-yield/high-yield';
import LowRisk from '../low-risk/low-risk';
import { messages } from '../../messages';

export function InvestAndEarnDropdown() {
  const { pathname } = useLocation();
  const themeVariant = useThemeVariant();

  const flippedTheme =
    themeVariant === THEME_VARIANTS.DARK || pathname === '/'
      ? THEME_VARIANTS.LIGHT
      : THEME_VARIANTS.DARK;

  const theme = useNotionalTheme(flippedTheme);
  const tabOptions = [
    '/vaults',
    '/stake',
    '/unstake',
    '/liquidity-variable',
    '/liquidity-leveraged',
    '/lend-fixed',
    '/lend-variable',
    '/lend-leveraged',
  ];
  const currentTab = tabOptions.find((data) => {
    return pathname.includes(data) && !pathname.includes('portfolio')
      ? true
      : false;
  });

  return (
    <DropdownButton
      popupId="invest-and-earn"
      labelKey={messages[NAV_DROPDOWN.EARN_YIELD]}
      anchorPosition={{ top: 73, left: 0 }}
      activeTab={currentTab ? true : false}
      hideOnClick={false}
      sx={{
        textTransform: 'capitalize',
        fontWeight: 400,
        height: '100%',
        padding: '6px 15px',
      }}
      customPopOverStyles={{
        left: 0,
        right: 0,
        marginLeft: '5%',
        marginRight: 'auto',
        width: '950px',
        overflow: 'visible',
      }}
      icon={
        <BarChartIcon
          className="pie-chart-icon"
          sx={{ fontSize: '1.125rem', stroke: 'transparent', fill: 'white' }}
        />
      }
    >
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            minHeight: '450px',
          }}
        >
          <LowRisk />
          <HighYield />
        </Box>
        <Box
          sx={{
            background: theme.gradient.green,
            height: '1px',
            width: '100%',
          }}
        ></Box>
      </ThemeProvider>
    </DropdownButton>
  );
}

export default InvestAndEarnDropdown;
