import { Box, ThemeProvider } from '@mui/material';
import { DropdownButton } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useAppState } from '@notional-finance/notionable-hooks';
import { NAV_DROPDOWN, THEME_VARIANTS, PRODUCTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import { LightningOutlineIcon } from '@notional-finance/icons';
import LeverageSection from './leverage-section';
import { messages } from '../messages';

export function LeverageDropdown() {
  const { pathname } = useLocation();
  const { themeVariant } = useAppState();

  const flippedTheme =
    themeVariant === THEME_VARIANTS.DARK || pathname === '/'
      ? THEME_VARIANTS.LIGHT
      : THEME_VARIANTS.DARK;

  const theme = useNotionalTheme(flippedTheme);
  const tabOptions = [
    PRODUCTS.LEVERAGED_PENDLE,
    PRODUCTS.LEVERAGED_POINTS_FARMING,
    PRODUCTS.LEVERAGED_YIELD_FARMING,
    PRODUCTS.LIQUIDITY_LEVERAGED,
  ];
  const currentTab = tabOptions.find((data) => {
    return pathname.includes(data) && !pathname.includes('portfolio')
      ? true
      : false;
  });

  return (
    <DropdownButton
      popupId="leverage"
      labelKey={messages[NAV_DROPDOWN.LEVERAGE]}
      anchorReference="anchorEl"
      activeTab={currentTab ? true : false}
      hideOnClick={false}
      sx={{
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
        fontWeight: 400,
        height: '100%',
        padding: '6px 15px',
      }}
      customPopOverStyles={{
        left: 0,
        right: 0,
        marginLeft: '15%',
        marginRight: 'auto',
        width: theme.spacing(78),
        overflow: 'visible',
      }}
      icon={<LightningOutlineIcon sx={{ fontSize: '1.125rem' }} />}
    >
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            minHeight: '450px',
          }}
        >
          <LeverageSection />
        </Box>
        <Box
          sx={{
            background: theme.gradient.green,
            height: '1px',
            width: '100%',
          }}
        />
      </ThemeProvider>
    </DropdownButton>
  );
}

export default LeverageDropdown;
