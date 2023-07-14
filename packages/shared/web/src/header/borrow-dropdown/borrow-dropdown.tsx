import { Box, ThemeProvider } from '@mui/material';
import { DropdownButton } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { NAV_DROPDOWN, THEME_VARIANTS } from '@notional-finance/shared-config';
import { BorrowSection } from './borrow-section';
import { useLocation } from 'react-router-dom';
import { CoinsIcon } from '@notional-finance/icons';
import { messages } from '../messages';

export function BorrowDropDown() {
  const { pathname } = useLocation();
  const { themeVariant } = useUserSettingsState();

  const flippedTheme =
    themeVariant === THEME_VARIANTS.DARK || pathname === '/'
      ? THEME_VARIANTS.LIGHT
      : THEME_VARIANTS.DARK;

  const theme = useNotionalTheme(flippedTheme);
  const tabOptions = ['/borrow-fixed', '/borrow-variable'];
  const currentTab = tabOptions.find((data) => {
    return pathname.includes(data) && !pathname.includes('portfolio')
      ? true
      : false;
  });

  return (
    <DropdownButton
      popupId="borrow"
      labelKey={messages[NAV_DROPDOWN.BORROW]}
      anchorPosition={{ top: 73, left: 0 }}
      activeTab={currentTab ? true : false}
      hideOnClick={false}
      useStroke={true}
      sx={{
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
        width: theme.spacing(82),
        overflow: 'visible',
      }}
      icon={<CoinsIcon sx={{ fill: 'transparent', fontSize: '1.125rem' }} />}
    >
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            minHeight: '450px',
          }}
        >
          <BorrowSection />
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

export default BorrowDropDown;
