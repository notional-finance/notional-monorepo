/* eslint react/prop-types: 0 */
import React from 'react';
import { useTheme } from '@mui/material';
import { formatNumber } from '@notional-finance/helpers';

export const YAxisTick = (props) => {
  const theme = useTheme();
  const { index, lines, payload } = props;
  const { value } = payload;
  const labelText = `${formatNumber(value, 1)}%`;
  return (
    <g>
      <text
        orientation="left"
        width="60"
        height="260"
        type="number"
        stroke="none"
        textAnchor="end"
        x="57"
        y={lines[index]}
        fill={theme.palette.typography.light}
      >
        <tspan x="57" dy="0.355em">
          {labelText}
        </tspan>
      </text>
    </g>
  );
};

export default YAxisTick;
