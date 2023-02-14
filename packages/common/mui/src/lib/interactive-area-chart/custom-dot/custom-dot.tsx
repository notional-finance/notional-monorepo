/* eslint react/prop-types: 0 */
import React from 'react';
import { useTheme } from '@mui/material';

export const CustomDot = (props) => {
  const theme = useTheme();
  const { cx, cy, payload, activeTimestamp, height } = props;
  const isActive = activeTimestamp === payload.timestamp;

  return (
    <g>
      {isActive && (
        <line
          x1={cx}
          x2={cx}
          y1={0}
          y2={height}
          stroke={theme.palette.charts.main}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r="8"
        fill={
          isActive ? theme.palette.charts.accent : theme.palette.charts.main
        }
        filter={
          isActive
            ? `drop-shadow(0px 0px 5px ${theme.palette.charts.main})`
            : 'none'
        }
        style={{ background: 'red' }}
      />
      <circle cx={cx} cy={cy} r="6" fill={theme.palette.background.paper} />
    </g>
  );
};

export default CustomDot;
