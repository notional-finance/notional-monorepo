/* eslint react/prop-types: 0 */
import React from 'react';

const SelectedDate = (x, y, theme) => {
  return (
    <svg
      width="88"
      height="48"
      viewBox="0 0 88 48"
      x={x}
      y={y}
      xmlns="http://www.w3.org/2000/svg"
      fill={theme.palette.background.paper}
    >
      <g filter="url(#filter0_d)" style={{ borderRadius: '16px' }}>
        <rect
          x="6"
          y="6"
          width="75"
          height="35"
          stroke={theme.palette.charts.main}
          rx="6"
        />
        <rect
          x="6"
          y="6"
          width="75"
          height="35"
          stroke={theme.palette.charts.main}
          rx="6"
        />
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
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const XAxisDateTick = (props) => {
  const { x, y, visibleTicksCount, payload, activeTimestamp, theme, intl } =
    props;
  const isActive = activeTimestamp === payload.value;

  let textAnchor = 'middle';
  let dx = 0;
  let mBoxDx = -44;
  if (payload.index === 0) {
    textAnchor = 'start';
    mBoxDx = -16;
  } else if (
    visibleTicksCount === 2 &&
    payload.index === visibleTicksCount - 1
  ) {
    textAnchor = 'end';
    dx = 12;
    mBoxDx = -60;
  }

  return (
    <g
      transform={`translate(${x},${y + 12})`}
      cursor={'pointer'}
      fill={theme.palette.typography.light}
    >
      {isActive ? SelectedDate(mBoxDx, -12, theme) : null}
      <text
        x={0}
        y={0}
        dy={16}
        dx={dx}
        textAnchor={textAnchor}
        style={{ fontSize: '12px' }}
        fill={isActive ? theme.palette.typography.main : ''}
      >
        {intl.formatDate(payload.value * 1000, {
          month: 'short',
          year: 'numeric',
        })}
      </text>
    </g>
  );
};

export default XAxisDateTick;
