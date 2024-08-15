import { Box, ThemeProvider } from '@mui/material';
import { DropdownButton, Section } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { NAV_DROPDOWN, THEME_VARIANTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import { AnalyticsIcon } from '@notional-finance/icons';
import { useAnalyticsDropdown } from './use-analytics-dropdown';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';
import { useAppState } from '@notional-finance/notionable';

export function AnalyticsDropdown() {
  const { pathname } = useLocation();
  const { themeVariant } = useAppState();
  const { links } = useAnalyticsDropdown();

  const flippedTheme =
    themeVariant === THEME_VARIANTS.DARK || pathname === '/'
      ? THEME_VARIANTS.LIGHT
      : THEME_VARIANTS.DARK;

  const theme = useNotionalTheme(flippedTheme);
  const tabOptions = ['/vaults', '/stake', '/unstake', '/liquidity-variable'];
  const currentTab = tabOptions.find((data) => {
    return pathname.includes(data) && !pathname.includes('portfolio')
      ? true
      : false;
  });

  return (
    <DropdownButton
      popupId="analytics"
      labelKey={messages[NAV_DROPDOWN.ANALYTICS]}
      activeTab={currentTab ? true : false}
      anchorReference="anchorEl"
      hideOnClick={false}
      sx={{
        textTransform: 'capitalize',
        fontWeight: 400,
        height: '100%',
        padding: '6px 15px',
      }}
      customPopOverStyles={{
        right: 0,
        width: theme.spacing(82),
        overflow: 'visible',
        background: 'transparent',
        boxShadow: 'none',
      }}
      icon={<AnalyticsIcon sx={{ fontSize: '1.125rem' }} />}
    >
      <ThemeProvider theme={theme}>
        <Box sx={{ marginRight: '48px' }}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              minHeight: '450px',
              transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              boxShadow:
                '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
            }}
          >
            <Section
              heading={<FormattedMessage defaultMessage={'Analytics'} />}
              links={links}
              sx={{
                padding: '64px',
                paddingTop: '48px',
                whiteSpace: 'nowrap',
                background: theme.palette.background.default,
                '.section-link-container': {
                  marginRight: '0px',
                  zIndex: 0,
                },
                '.text-container': {
                  marginRight: '10px',
                },
                '.section-link-paper, .MuiPaper-root': {
                  '&:hover': {
                    transition: '.3s',
                    transform: 'scale(1.1)',
                    zIndex: 9,
                    background: theme.palette.background.default,
                    boxShadow:
                      '-2px 1px 24px rgba(135, 155, 215, 0.2), 0px 4px 16px rgba(121, 209, 213, 0.4)',
                  },
                },
              }}
            />
          </Box>
          <Box
            sx={{
              height: '1px',
              width: '100%',
            }}
          ></Box>
        </Box>
      </ThemeProvider>
    </DropdownButton>
  );
}

export default AnalyticsDropdown;
