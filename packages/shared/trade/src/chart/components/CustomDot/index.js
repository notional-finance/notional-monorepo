/* eslint react/prop-types: 0 */
import React, { PureComponent } from 'react';
import { getStyles } from '@notional-finance/helpers';

class CustomDot extends PureComponent {
  render() {
    const { cx, cy, payload, selectedMaturity, height, onClick } = this.props;
    const isSelected = selectedMaturity === payload.maturity ? '-selected' : '';
    let verticalLine;
    if (isSelected) {
      // Add 8 to height to account for the dot offset
      verticalLine = (
        <line
          x1={cx}
          x2={cx}
          y1={0}
          y2={height + 8}
          stroke={getStyles('brightTurquoise')}
        />
      );
    }

    return (
      <g className="dot-group" onClick={() => onClick(payload.marketKey)}>
        {verticalLine}
        <circle
          className={`dot-border${isSelected}`}
          cx={cx}
          cy={cy}
          r="8"
          fill={getStyles('white')}
        />
        <circle
          className={`dot-interior${isSelected}`}
          cx={cx}
          cy={cy}
          r="6"
          fill={getStyles('primaryGreen')}
        />
      </g>
    );
  }
}

export default CustomDot;
