'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// project imports
import MainCard from 'components/MainCard';
import ReactDraft from 'sections/forms/plugins/ReactDraft';
import ReactQuill from 'sections/forms/plugins/ReactQuill';
import { ThemeDirection, ThemeMode } from 'config';

// ==============================|| PLUGINS - EDITOR ||============================== //

export default function Editor() {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={12}
        sx={{
          '& .rdw-editor-wrapper': {
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px',
            overflow: 'hidden',
            '& .rdw-editor-main': {
              px: 2,
              py: 0.5,
              border: 'none'
            },
            '& .rdw-editor-toolbar': {
              pt: 1.25,
              border: 'none',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'secondary.lighter',
              color: theme.palette.mode === ThemeMode.DARK ? 'secondary.lighter' : 'text.primary',
              '& .rdw-option-wrapper': {
                bgcolor: 'secondary.light',
                borderColor: 'divider'
              },
              '& .rdw-dropdown-wrapper': {
                bgcolor: 'secondary.light',
                borderColor: 'divider'
              }
            },
            ...(theme.direction === ThemeDirection.RTL && {
              '& .rdw-dropdown-carettoopen': {
                right: '10%',
                left: 'inherit'
              },
              '& .rdw-dropdown-carettoclose': {
                right: '10%',
                left: 'inherit'
              }
            }),
            ...(theme.palette.mode === ThemeMode.DARK && {
              '& .rdw-link-modal-btn': {
                color: 'common.black'
              },
              '& .rdw-image-modal-btn': {
                color: 'common.black'
              },
              '& .rdw-embedded-modal-btn': {
                color: 'common.black'
              }
            })
          }
        }}
      >
        <MainCard title="React Draft" sx={{ overflow: 'visible', '& .rdw-editor-wrapper': { overflow: 'visible' } }}>
          <ReactDraft />
        </MainCard>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          '& .quill': {
            bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.main' : 'secondary.lighter',
            borderRadius: '4px',
            '& .ql-toolbar': {
              bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : 'secondary.100',
              borderColor: 'divider',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px'
            },
            '& .ql-container': {
              bgcolor: theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'secondary.100',
              borderColor: `${theme.palette.divider} !important`,
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
              '& .ql-editor': {
                minHeight: 135
              }
            },
            ...(theme.direction === ThemeDirection.RTL && {
              '& .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg': {
                right: '0%',
                left: 'inherit'
              }
            })
          }
        }}
      >
        <MainCard title="React Quill">
          <ReactQuill />
        </MainCard>
      </Grid>
    </Grid>
  );
}
