/* eslint react/prop-types: 0 */
import React, { PureComponent } from 'react';
import moment from 'moment';

class XAxisDateTick extends PureComponent {
  static selectedMaturityBox(x, y) {
    return (
      <svg
        width="88"
        height="48"
        viewBox="0 0 88 48"
        x={x}
        y={y}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d)">
          <rect x="6" y="6" width="76" height="36" fill="#EAFCFD" />
          <rect x="6.5" y="6.5" width="75" height="35" stroke="#13BBC2" />
        </g>
        <defs>
          <filter
            id="filter0_d"
            x="0"
            y="0"
            width="88"
            height="48"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.076 0 0 0 0 0.734396 0 0 0 0 0.76 0 0 0 0.7 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
    );
  }
  render() {
    const { x, y, visibleTicksCount, payload, selectedMaturity, onClick, marketData } = this.props;
    const maturityDate = moment.unix(payload.value).format('MMM YYYY');
    const isSelected = selectedMaturity === payload.value ? 'is-selected' : '';
    let textAnchor = 'middle';
    let dx = 0;
    let mBoxDx = -44;
    if (payload.index === 0) {
      textAnchor = 'start';
      mBoxDx = -16;
    } else if (visibleTicksCount === 2 && payload.index === visibleTicksCount - 1) {
      textAnchor = 'end';
      dx = 12;
      mBoxDx = -60;
    }

    return (
      <g
        transform={`translate(${x},${y + 12})`}
        onClick={() => {
          const market = marketData.find((m) => m.maturity === payload.value);
          if (market) onClick(market.marketKey);
        }}
      >
        {isSelected ? XAxisDateTick.selectedMaturityBox(mBoxDx, -12) : null}
        <text
          className={`x-axis-label ${isSelected}`}
          x={0}
          y={0}
          dy={16}
          dx={dx}
          textAnchor={textAnchor}
        >
          {maturityDate}
        </text>
      </g>
    );
  }
}

export default XAxisDateTick;
