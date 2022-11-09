import { Box, ThemeProvider } from '@mui/material';
import { DropdownButton } from '@notional-finance/mui';
import { NAV_DROPDOWN, THEME_VARIANTS } from '@notional-finance/utils';
import WhatsUp from '../../whats-up/whats-up';
import AboutContent from '../about-content/about-content';
import { useNotionalTheme } from '@notional-finance/styles';
import { DocsIcon } from '@notional-finance/icons';
import { messages } from '../../messages';

export function AboutDropdown() {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  return (
    <DropdownButton
      popupId="about-dropdown"
      labelKey={messages[NAV_DROPDOWN.ABOUT]}
      anchorPosition={{ top: 73, left: 0 }}
      sx={{
        textTransform: 'capitalize',
        marginRight: '17px',
        fontWeight: 400,
        height: '100%',
      }}
      icon={
        <DocsIcon
          className="color-fill"
          sx={{ fontSize: '1.5rem !important', stroke: 'transparent', fill: 'red' }}
        />
      }
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
          <AboutContent />
        </Box>
      </ThemeProvider>
    </DropdownButton>
  );
}

export default AboutDropdown;
