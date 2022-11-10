import { Box, ThemeProvider } from '@mui/material';
import { NAV_DROPDOWN, THEME_VARIANTS } from '@notional-finance/utils';
import { DropdownButton } from '@notional-finance/mui';
import WhatsUp from '../../whats-up/whats-up';
import ResourceContent from '../resource-content/resource-content';
import { useNotionalTheme } from '@notional-finance/styles';
import { ResourcesIcon } from '@notional-finance/icons';
import { messages } from '../../messages';

export function ResourcesDropdown() {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  return (
    <DropdownButton
      popupId="resources-dropdown"
      labelKey={messages[NAV_DROPDOWN.RESOURCES]}
      anchorPosition={{ top: 73, left: 0 }}
      transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      sx={{
        textTransform: 'capitalize',
        marginRight: '35px',
        fontWeight: 400,
        height: '100%',
      }}
      icon={<ResourcesIcon sx={{ color: 'red', fontSize: '1.125rem' }} />}
    >
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            width: '100vw',
            minHeight: '200px',
            background: theme.palette.background.default,
          }}
        >
          <WhatsUp />
          <ResourceContent />
        </Box>
      </ThemeProvider>
    </DropdownButton>
  );
}

export default ResourcesDropdown;
