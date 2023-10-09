/* eslint react/prop-types: 0 */
import { useTheme } from '@mui/material';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useIntl } from 'react-intl';

export const XAxisTick = (props) => {
  const theme = useTheme();
  const intl = useIntl();
  const {
    x,
    y,
    visibleTicksCount,
    payload: { index, value },
    xAxisTickFormat,
  } = props;

  let textAnchor = 'middle';
  console.log({ visibleTicksCount });
  console.log({ index });
  const xTranslateValue = visibleTicksCount - index === 1 ? x - 25 : x;
  console.log({ xTranslateValue });
  console.log({ x });
  if (index === 0) {
    textAnchor = 'start';
  } else if (visibleTicksCount === 2 && index === visibleTicksCount - 1) {
    textAnchor = 'end';
  }

  return (
    <g
      transform={`translate(${xTranslateValue},${y})`}
      fill={theme.palette.typography.light}
    >
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor={textAnchor}
        style={{ fontSize: '12px' }}
      >
        {xAxisTickFormat === 'date' && typeof value === 'number'
          ? intl.formatDate(value * 1000, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : ''}
        {xAxisTickFormat === 'percent' && typeof value === 'number'
          ? formatNumberAsPercent(value)
          : ''}
      </text>
    </g>
  );
};

export default XAxisTick;
