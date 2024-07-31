import { useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';

// project import
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';

// types
import { I18n } from 'types/config';

// assets
import TranslationOutlined from '@ant-design/icons/TranslationOutlined';

// ==============================|| HEADER CONTENT - LOCALIZATION ||============================== //

export default function Localization() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const { mode, i18n, onChangeLocalization } = useConfig();

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListItemClick = (lang: I18n) => {
    onChangeLocalization(lang);
    setOpen(false);
  };

  const iconBackColorOpen = mode === ThemeMode.DARK ? 'background.default' : 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open localization"
        ref={anchorRef}
        aria-controls={open ? 'localization-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
      >
        <TranslationOutlined />
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom-start' : 'bottom'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? 0 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top-right' : 'top'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  component="nav"
                  sx={{
                    p: 0,
                    width: '100%',
                    minWidth: 200,
                    maxWidth: { xs: 250, md: 290 },
                    bgcolor: 'background.paper',
                    borderRadius: 0.5
                  }}
                >
                  <ListItemButton selected={i18n === 'en'} onClick={() => handleListItemClick('en')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="text.primary">English</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: '8px' }}>
                            (UK)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton selected={i18n === 'fr'} onClick={() => handleListItemClick('fr')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="text.primary">français</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: '8px' }}>
                            (French)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton selected={i18n === 'ro'} onClick={() => handleListItemClick('ro')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="text.primary">Română</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: '8px' }}>
                            (Romanian)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton selected={i18n === 'zh'} onClick={() => handleListItemClick('zh')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="text.primary">中国人</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: '8px' }}>
                            (Chinese)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
