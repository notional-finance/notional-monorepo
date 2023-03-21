import { Box, ThemeProvider } from '@mui/material';
import { NAV_DROPDOWN, THEME_VARIANTS } from '@notional-finance/shared-config';
import { DropdownButton } from '@notional-finance/mui';
// import WhatsUp from '../../whats-up/whats-up';
import ResourceContent from '../resource-content/resource-content';
import { useNotionalTheme } from '@notional-finance/styles';
import { DocsIcon } from '@notional-finance/icons';
import { messages } from '../../messages';

export function ResourcesDropdown() {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  return (
    <DropdownButton
      popupId="resources-dropdown"
      labelKey={messages[NAV_DROPDOWN.RESOURCES]}
      anchorPosition={{ top: 73, left: 0 }}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorReference="none"
      sx={{
        textTransform: 'capitalize',
        marginRight: '35px',
        fontWeight: 400,
        height: '100%',
      }}
      customPopOverStyles={{
        top: '73px',
        right: 0,
      }}
      icon={<DocsIcon sx={{ fontSize: '1.7rem !important' }} />}
    >
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            width: theme.spacing(148),
            minHeight: '200px',
            background: theme.palette.background.default,
          }}
        >
          <ResourceContent />
        </Box>
      </ThemeProvider>
    </DropdownButton>
  );
}

export default ResourcesDropdown;
