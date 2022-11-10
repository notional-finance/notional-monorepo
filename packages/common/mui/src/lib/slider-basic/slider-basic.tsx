import { styled, Slider, useTheme, SxProps } from '@mui/material';

export interface CustomMark {
  value: number;
  label: string;
  color?: string;
}

export interface RailGradient {
  color: [number, number, number];
  value: number;
}

interface SliderBasicProps {
  marks?: CustomMark[];
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
  trackColor?: string;
  hideThumb?: boolean;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  railGradients?: RailGradient[];
  sx?: SxProps;
}

const SliderContainer = styled('div')`
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  margin-bottom: 16px;
`;

const StyledSlider = styled(Slider)(
  ({ theme, marks }) => `
  // This default margin on the MuiSlider is moved up to the slider container
  margin-bottom: 0px;

  .thumb-hidden {
    // Hidden when disabled
    display: none;
  }

  .MuiSlider-thumb {
    box-shadow: ${theme.shape.shadowStandard};
  }

  .mark {
    color: ${theme.palette.background.accentDefault};
    height: 9px;
    width: 9px;
    border-radius: 50%;
  }

  ${
    Array.isArray(marks) &&
    (marks as CustomMark[])
      .map(
        ({ color }, i) => `
      .mark[data-index='${i}'] {
        height: 18px;
        width: 7px;
        border-radius: 5px;
        color: ${color};
      }`
      )
      .join(' ')
  }

  .markLabel[data-index='1'] {
    margin-top: -36px;
  }

  .mark[data-index='1'] {
    color: ${theme.palette.typography.light};
  }

  .markActive {
    opacity: 1;
    background-color: currentColor;
  }

  .markLabel {
    font-size: ${theme.typography.caption.fontSize};
    color: ${theme.palette.typography.light};
    margin-left: 6px;
    font-family: inherit;
  }

  .markLabelActive {
    color: ${theme.palette.typography.light};
  }
`
);

export const SliderBasic = ({
  marks,
  min,
  max,
  step,
  value,
  disabled,
  trackColor,
  onChange,
  onChangeCommitted,
  onFocus,
  onBlur,
  railGradients,
  hideThumb,
  sx,
}: SliderBasicProps) => {
  const theme = useTheme();
  const getBoundedValue = (inputValue: number) => {
    if (!inputValue) return inputValue;
    // Bound value to min and max range
    return Math.min(Math.max(inputValue, min), max);
  };

  const avgTwoColors = (c1: number, c2: number, w1: number, w2: number) => {
    // eslint-disable-next-line no-mixed-operators
    return Math.round(c1 * w1 + c2 * w2);
  };

  const getMarkColor = (railGradients: RailGradient[], boundedValue: number) => {
    const normalizedValue = ((boundedValue - min) / max) * 100;
    const index = railGradients.findIndex(({ value: v }) => v > normalizedValue);
    if (index === -1) {
      // Above max value
      return railGradients[railGradients.length - 1].color;
    } else if (index === 0) {
      // Below min value
      return railGradients[0].color;
    }
    // Get the average color for the gradient
    const upper = railGradients[index];
    const lower = railGradients[index - 1];
    const length = upper.value - lower.value;
    const upperWeight = (normalizedValue - lower.value) / length;
    const lowerWeight = 1 - upperWeight;
    return [
      avgTwoColors(lower.color[0], upper.color[0], lowerWeight, upperWeight),
      avgTwoColors(lower.color[1], upper.color[1], lowerWeight, upperWeight),
      avgTwoColors(lower.color[2], upper.color[2], lowerWeight, upperWeight),
    ];
  };

  const boundedValue = getBoundedValue(value);
  const boundedMarks = marks?.map((m) => {
    const v = getBoundedValue(m.value);
    let color;
    if (m.color) {
      color = m.color;
    } else if (railGradients) {
      color = `rgba(${getMarkColor(railGradients, v).join(',')})`;
    } else {
      color = theme.palette.primary.light;
    }
    return {
      value: v,
      label: m.label,
      color,
    };
  });

  const formattedGradientBg = `linear-gradient(90deg, ${railGradients
    ?.map(({ color, value }) => `rgb(${color.join(',')}) ${value.toFixed(0)}%`)
    .join(',')})`;
  const currentGradient = railGradients && `rgba(${getMarkColor(railGradients, value).join(',')})`;

  return (
    <SliderContainer sx={{ ...sx }}>
      <StyledSlider
        classes={{
          root: 'slider',
          rail: 'rail',
          track: 'track',
          thumb: 'thumb',
          mark: 'mark',
          markActive: 'markActive',
          markLabel: 'markLabel',
          markLabelActive: 'markLabelActive',
        }}
        min={min}
        max={max}
        step={step}
        value={boundedValue}
        marks={boundedMarks}
        onChange={(_event, v) => onChange && onChange(v as number)}
        disabled={disabled}
        onChangeCommitted={(_, v) => onChangeCommitted && onChangeCommitted(v as number)}
        onFocus={onFocus}
        onBlur={onBlur}
        sx={{
          '.rail': {
            background: railGradients?.length ? formattedGradientBg : theme.palette.borders.default,
            opacity: 1,
            height: '8px',
          },
          '.track': {
            display: railGradients?.length ? 'none' : '',
            background: trackColor || theme.palette.primary.light,
            height: '8px',
            border: 'none',
          },
          '.MuiSlider-thumb': {
            height: railGradients?.length ? '20px' : '16px',
            width: railGradients?.length ? '20px' : '16px',
            background: theme.palette.common.black,
            visibility: hideThumb ? 'hidden' : 'visible',
            border: railGradients?.length
              ? `4px solid ${currentGradient}`
              : `3px solid ${trackColor || theme.palette.primary.light}`,
          },
        }}
      />
    </SliderContainer>
  );
};

export default SliderBasic;
