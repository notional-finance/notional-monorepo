/* eslint react/prop-types: 0 */
import React, { PureComponent } from 'react';
import { formatNumber } from '@notional-finance/utils';

class YAxisTick extends PureComponent {
  render() {
    const { index, lines, payload } = this.props;
    const { value } = payload;
    const labelText = `${formatNumber(value, 1)}%`;
    return (
      <g className="y-axis-tick">
        <text
          className="y-axis-tick-value"
          orientation="left"
          width="60"
          height="260"
          type="number"
          stroke="none"
          fill="#666"
          textAnchor="end"
          x="57"
          y={lines[index]}
        >
          <tspan x="57" dy="0.355em">
            {labelText}
          </tspan>
        </text>
      </g>
    );
  }
}

export default YAxisTick;
