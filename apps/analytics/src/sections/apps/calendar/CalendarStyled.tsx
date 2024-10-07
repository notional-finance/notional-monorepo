// material-ui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project-import
import { ThemeDirection } from 'config';

// ==============================|| CALENDAR - STYLED ||============================== //

const ExperimentalStyled = styled(Box)(({ theme }) => ({
  width: 'calc(100% + 2px)',
  marginLeft: -1,
  marginBottom: '-50px',

  // hide license message
  '& .fc-license-message': {
    display: 'none'
  },
  '& .fc .fc-daygrid .fc-scroller-liquid-absolute': {
    overflow: 'hidden !important'
  },

  // basic style
  '& .fc': {
    '--fc-bg-event-opacity': 1,
    '--fc-border-color': theme.palette.divider,
    '--fc-daygrid-event-dot-width': '10px',
    '--fc-today-bg-color': theme.palette.primary.lighter,
    '--fc-list-event-dot-width': '10px',
    '--fc-event-border-color': theme.palette.primary.dark,
    '--fc-now-indicator-color': theme.palette.error.main,
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    fontFamily: theme.typography.fontFamily
  },

  // date text
  '& .fc .fc-daygrid-day-top': {
    display: 'grid',
    '& .fc-daygrid-day-number': {
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 12
    }
  },

  // weekday
  '& .fc .fc-col-header-cell': {
    background: theme.palette.grey[100]
  },

  '& .fc .fc-col-header-cell-cushion': {
    color: theme.palette.grey[900],
    padding: 16
  },

  // events
  '& .fc-direction-ltr .fc-daygrid-event.fc-event-end, .fc-direction-rtl .fc-daygrid-event.fc-event-start': {
    marginLeft: 4,
    marginBottom: 6,
    borderRadius: 4,
    background: theme.palette.primary.main,
    border: 'none'
  },

  '& .fc-h-event .fc-event-main': {
    padding: 4,
    paddingLeft: 8
  },

  // popover when multiple events
  '& .fc .fc-more-popover': {
    border: 'none',
    borderRadius: 6,
    zIndex: 1200
  },

  '& .fc .fc-more-popover .fc-popover-body': {
    background: theme.palette.secondary.lighter,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },

  '& .fc .fc-popover-header': {
    padding: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    background: theme.palette.secondary.light,
    color: theme.palette.text.primary
  },

  // agenda view
  '& .fc-theme-standard .fc-list-day-cushion': {
    background: theme.palette.secondary.lighter
  },

  '& .fc .fc-day': {
    cursor: 'pointer'
  },

  '& .fc .fc-timeGridDay-view .fc-timegrid-slot': {
    background: theme.palette.background.paper
  },

  '& .fc .fc-timegrid-slot': {
    cursor: 'pointer'
  },

  '& .fc .fc-list-event:hover td': {
    cursor: 'pointer',
    background: theme.palette.secondary.lighter
  },

  '& .fc-timegrid-event-harness-inset .fc-timegrid-event, .fc-timegrid-event.fc-event-mirror, .fc-timegrid-more-link': {
    padding: 8,
    margin: 2
  },
  ...(theme.direction === ThemeDirection.RTL && { overflow: 'hidden', paddingTop: '8px' })
}));

export default ExperimentalStyled;
