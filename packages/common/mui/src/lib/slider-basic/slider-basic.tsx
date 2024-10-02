import { styled, Slider, useTheme, SxProps, Box } from '@mui/material';

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
  showThumb?: boolean;
  showMinMax?: boolean;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  railGradients?: RailGradient[];
  sx?: SxProps;
  showHFColors?: boolean;
}

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
  showThumb = false,
  showMinMax,
  sx,
  showHFColors,
}: SliderBasicProps) => {
  const theme = useTheme();
  const getBoundedValue = (inputValue: number) => {
    if (!inputValue) return inputValue;
    // Bound value to min and max range
    return Math.min(Math.max(inputValue, min), max);
  };

  const avgTwoColors = (c1: number, c2: number, w1: number, w2: number) => {
     
    return Math.round(c1 * w1 + c2 * w2);
  };

  const getMarkColor = (
    railGradients: RailGradient[],
    boundedValue: number
  ) => {
    const normalizedValue = ((boundedValue - min) / max) * 100;
    const index = railGradients.findIndex(
      ({ value: v }) => v > normalizedValue
    );
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

  const getHealthFactorGradients = () => {
    let healthFactorGradient = '';
    if (value <= 1.25) {
      healthFactorGradient = `rgb(255,61,113)`;
    } else if (value > 1.25 && value <= 2.5) {
      healthFactorGradient =
        'linear-gradient(90deg, rgb(255,61,113) 25%, rgb(249, 223, 61) 50%)';
    } else if (value > 2.5 && value <= 5) {
      healthFactorGradient =
        'linear-gradient(90deg, rgb(255,61,113) 25%, rgb(249, 233, 61) 50%, rgb(52,223,58) 100%)';
    }
    return healthFactorGradient;
  };
  const healthFactorGradient = getHealthFactorGradients();

  const formattedGradientBg = `linear-gradient(90deg, ${railGradients
    ?.map(({ color, value }) => `rgb(${color.join(',')}) ${value.toFixed(0)}%`)
    .join(',')})`;

  // NOTE: Leaving this incase we ever want to have a gradient colored thumb again
  // const currentGradient =
  //   railGradients && `rgba(${getMarkColor(railGradients, value).join(',')})`;

  return (
    <SliderContainer
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        ...sx,
      }}
    >
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
        onChangeCommitted={(_, v) =>
          onChangeCommitted && onChangeCommitted(v as number)
        }
        onFocus={onFocus}
        onBlur={onBlur}
        sx={{
          '& .MuiSlider-track': {
            border: 'none',
            height: '8px',
            background: showHFColors
              ? healthFactorGradient
              : railGradients?.length
              ? formattedGradientBg
              : trackColor
              ? trackColor
              : theme.palette.secondary.light,
          },
          '& .MuiSlider-rail': {
            opacity: 0.5,
            height: '8px',
            border: 'none',
            background: theme.palette.borders.default,
            boxShadow: 'inset 0px 0px 4px -2px #000',
          },
          '.MuiSlider-thumb': {
            height: '16px',
            width: '16px',
            background: theme.palette.common.black,
            visibility: showThumb ? 'visible' : 'hidden',
            border: `3px solid ${theme.palette.secondary.light}`,
          },
        }}
      />
      {showMinMax && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: `-${theme.spacing(2)}`,
          }}
        >
          <LeverageValue>{min.toFixed(2)}x</LeverageValue>
          <LeverageValue sx={{ textAlign: 'right' }}>
            {max.toFixed(2)}x
          </LeverageValue>
        </Box>
      )}
    </SliderContainer>
  );
};

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

const LeverageValue = styled(Box)(
  ({ theme }) => `
  width: 100%;
  font-size: 10px;
  color: ${theme.palette.typography.light};
`
);

export default SliderBasic;
