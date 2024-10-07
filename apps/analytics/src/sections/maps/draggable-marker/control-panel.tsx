import { memo } from 'react';

// material-ui
import Typography from '@mui/material/Typography';

// third-party
import { LngLat } from 'react-map-gl';

// project-import
import ControlPanelStyled from 'components/third-party/map/ControlPanelStyled';

const EVENT_LIST = ['onDragStart', 'onDrag', 'onDragEnd'] as const;

function round5(value: number) {
  return (Math.round(value * 1e5) / 1e5).toFixed(5);
}

type Props = {
  events: Record<string, LngLat>;
};

// ==============================|| CONTROL - DRAGGABLE MARKER ||============================== //

function ControlPanel({ events = {} }: Props) {
  return (
    <ControlPanelStyled>
      {EVENT_LIST.map((event) => {
        const lngLat = events[event];

        return (
          <div key={event}>
            <Typography variant="subtitle2">{event}:</Typography>

            {lngLat ? (
              <Typography variant="subtitle2">{`${round5(lngLat.lng)}, ${round5(lngLat.lat)}`}</Typography>
            ) : (
              <Typography variant="body2" component="em">
                -
              </Typography>
            )}
          </div>
        );
      })}
    </ControlPanelStyled>
  );
}

export default memo(ControlPanel);
