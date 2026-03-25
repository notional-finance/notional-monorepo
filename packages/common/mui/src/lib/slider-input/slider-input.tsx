import NumberFormat from 'react-number-format';
import {
  alpha,
  Box,
  Divider,
  Input,
  Slider,
  styled,
  useTheme,
} from '@mui/material';
import { InputLabel } from '../input-label/input-label';
import { useCallback, useRef, useState } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Caption } from '../typography/typography';
import ErrorMessage from '../error-message/error-message';
import { InfoTooltip } from '../info-tooltip/info-tooltip';
import React from 'react';
import CountUp from '../count-up/count-up';
import { colors } from '@notional-finance/styles';
import { Mark } from '@mui/base';
import SliderBasic from '../slider-basic/slider-basic';

export interface SliderInputProps {
  min: number;
  max: number;
  onChangeCommitted: (value: number) => void;
  isRangeSlider?: boolean;
  sliderStep?: number;
  displayStep?: number;
  errorMsg?: MessageDescriptor;
  infoMsg?: MessageDescriptor;
  inputLabel?: MessageDescriptor;
  disableBelowBaseValue?: boolean;
  baseValue: number | undefined;
  topRightCaption?: JSX.Element;
  bottomCaption?: JSX.Element;
  sliderLeverageInfo?: {
    caption: React.ReactNode;
    value: number | React.ReactNode;
    suffix?: string;
    toolTipText?: React.ReactNode;
    toolTipTitle?: React.ReactNode;
  }[];
}

export interface SliderInputHandle {
  setInputOverride: (input: number, emitChange?: boolean) => void;
  getInputValue: () => number;
}

export const SLIDER_STEP_SIZE = 0.1;

const Container = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  display: flex;
  height: ${theme.spacing(8)};
  background-color: ${theme.palette.background.default};
`
);

const SliderContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  margin-left: ${theme.spacing(2)};
  margin-right: ${theme.spacing(2)};
`
);

const ValueContainer = styled(Box)(
  ({ theme }) => `
  padding-left: ${theme.spacing(2)};
  padding-right: ${theme.spacing(2)};
  max-width: ${theme.spacing(16)};
  flex: 0 0 auto;

  ${theme.breakpoints.down('sm')} {
    padding-left: ${theme.spacing(1.5)};
    padding-right: ${theme.spacing(1.5)};
    max-width: ${theme.spacing(11)};
  }
`
);

const LeverageInfoContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  display: block;
  padding: ${theme.spacing(2, 2, 1, 2)};
  text-align: center;
  background: ${theme.palette.background.default};
  border-bottom-left-radius: ${theme.shape.borderRadius()};
  border-bottom-right-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  border-top: unset;
`
);

const NumberFormatter = React.forwardRef<NumberFormat<string>>((props, ref) => {
  return (
    <NumberFormat
      {...props}
      type="text"
      getInputRef={ref}
      allowNegative={false}
      isNumericString
      fixedDecimalScale
      decimalScale={2}
    />
  );
});

export const useSliderInputRef = () => {
  const sliderInputRef = useRef<SliderInputHandle>(null);
  const isInputRefDefined = !!sliderInputRef.current;
  const setSliderInput = useCallback(
    (input: number, emitChange = true) => {
      sliderInputRef.current?.setInputOverride(input, emitChange);
    },
    // isInputRefDefined must be in the dependencies otherwise the useCallback will not
    // properly trigger to generate a new function when the input ref becomes defined
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sliderInputRef, isInputRefDefined]
  );

  return { setSliderInput, sliderInputRef };
};

interface RangeSliderProps {
  min: number;
  max: number;
  disableBelowBaseValue?: boolean;
  baseValue: number;
  currentValue: number;
  onChange: (value: number) => void;
  onChangeCommitted: (value: number) => void;
}

const RangeSlider = ({
  min,
  max,
  disableBelowBaseValue,
  baseValue,
  currentValue,
  onChange,
  onChangeCommitted,
}: RangeSliderProps) => {
  const theme = useTheme();
  const marks = Array.from({ length: 10 }, (_, i) => {
    const value = ((max - min) * i) / 9 + min;
    const color =
      disableBelowBaseValue && value < baseValue
        ? colors.darkGrey
        : // Leverage range
        baseValue <= value && value <= currentValue
        ? theme.palette.primary.light
        : // Deleveraging range
        currentValue <= value && value <= baseValue
        ? theme.palette.primary.dark
        : theme.palette.borders.paper;
    return {
      value,
      label: '',
      color,
    };
  });
  const railBackground = disableBelowBaseValue
    ? `linear-gradient(90deg, ${[
        `rgb(143,155,179) 0%`,
        `rgb(143,155,179) ${Math.floor((baseValue / max) * 100)}%`,
        `rgba(230,234,235, 0.5) ${Math.floor((baseValue / max) * 100)}%`,
        `rgba(230,234,235, 0.5) 100%`,
      ].join(',')})`
    : alpha(theme.palette.borders.default, 0.5);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
      }}
    >
      <StyledSlider
        sx={{
          '& .MuiSlider-track': {
            border: 'none',
            height: '4px',
            background:
              currentValue <= baseValue
                ? theme.palette.primary.dark
                : theme.palette.primary.light,
          },
          '& .MuiSlider-rail': {
            opacity: 1,
            height: '4px',
            border: 'none',
            background: railBackground,
            boxShadow: 'inset 0px 0px 4px -2px #000',
          },
          '& .MuiSlider-thumb': {
            height: theme.spacing(2),
            width: theme.spacing(2),
            background: theme.palette.borders.paper,
            visibility: 'visible',
            border: `3px solid ${
              currentValue < baseValue
                ? theme.palette.primary.dark
                : theme.palette.primary.light
            }`,
            boxShadow: theme.shape.shadowStandard,
          },
          [`& .MuiSlider-thumb[data-index="${
            baseValue < currentValue ? 0 : 1
          }"]`]: {
            visibility: 'hidden',
          },
          '& .MuiSlider-mark': {
            height: theme.spacing(1.5),
            width: theme.spacing(0.5),
            borderRadius: theme.spacing(0.5),
          },
        }}
        min={min}
        max={max}
        step={SLIDER_STEP_SIZE}
        marks={marks}
        // The base value is always the first value in the array, and we hide the thumb,
        // this allows us to get a relative range for the track color
        value={[baseValue, currentValue]}
        onChange={(_, value) => {
          if (value[0] === baseValue) {
            onChange(value[1]);
          } else if (value[1] === baseValue) {
            onChange(value[0]);
          } else if (value[0] === currentValue) {
            onChange(value[1]);
          } else if (value[1] === currentValue) {
            onChange(value[0]);
          }
        }}
        onChangeCommitted={(_, value) => {
          if (value[0] === baseValue) {
            onChangeCommitted(value[1]);
          } else if (value[1] === baseValue) {
            onChangeCommitted(value[0]);
          } else if (value[0] === currentValue) {
            onChangeCommitted(value[1]);
          } else if (value[1] === currentValue) {
            onChangeCommitted(value[0]);
          }
        }}
      />
    </Box>
  );
};

const StyledSlider = styled(Slider)(
  ({ marks }) => `
  ${
    Array.isArray(marks) &&
    (marks as (Mark & { color: string })[])
      .map(
        (mark, i) => `
      .MuiSlider-mark[data-index='${i}'] {
        height: 12px;
        width: 4px;
        border-radius: 5px;
        color: ${mark.color};
        background-color: ${mark.color};
      }`
      )
      .join(' ')
  }
  `
);

export const SliderInput = React.forwardRef<
  SliderInputHandle,
  SliderInputProps
>(
  (
    {
      min,
      max,
      onChangeCommitted,
      displayStep = 0.01,
      errorMsg,
      isRangeSlider,
      infoMsg,
      inputLabel,
      disableBelowBaseValue,
      baseValue = min,
      topRightCaption,
      bottomCaption,
      sliderLeverageInfo,
    },
    ref
  ) => {
    const theme = useTheme();
    const [value, _setValue] = useState(min);
    const [hasFocusOnValueInput, setHasFocusOnValueInput] = useState(false);
    const captionMsg = errorMsg || infoMsg;
    const isError = !!errorMsg;
    const setValue = useCallback(
      (input: number) => {
        if (disableBelowBaseValue && input < baseValue) {
          _setValue(baseValue);
          return baseValue;
        }
        _setValue(input);
        return input;
      },
      [disableBelowBaseValue, baseValue]
    );

    React.useImperativeHandle(ref, () => ({
      setInputOverride: (input: number, emitChange = true) => {
        // Only execute change commits greater than the step size
        // otherwise rounding errors will trigger changes
        if (Math.abs(input - value) > displayStep) {
          const newValue = setValue(input);
          if (emitChange) onChangeCommitted(newValue);
        }
      },
      getInputValue: () => {
        return value;
      },
    }));
    const onSliderChange = (v: number) => {
      setValue(v);
      if (!hasFocusOnValueInput) setHasFocusOnValueInput(true);
    };
    const onSliderChangeCommitted = (v: number) => {
      const newValue = setValue(v);
      setHasFocusOnValueInput(false);
      // Use a setTimeout here before triggering onChangeCommit to ensure
      // that the slider animation completes before we trigger otherwise
      // it will look "jumpy" to the user
      setTimeout(() => {
        onChangeCommitted(newValue);
      }, 100);
    };

    return (
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <InputLabel inputLabel={inputLabel} />
          <Caption>{topRightCaption}</Caption>
        </Box>

        <Container
          sx={{
            border: `1px solid ${
              hasFocusOnValueInput
                ? theme.palette.info.main
                : theme.palette.borders.paper
            }`,
            borderBottomLeftRadius: sliderLeverageInfo
              ? 'unset'
              : theme.shape.borderRadius(),
            borderBottomRightRadius: sliderLeverageInfo
              ? 'unset'
              : theme.shape.borderRadius(),
          }}
        >
          <ValueContainer
            sx={{
              display: 'flex',
            }}
          >
            <Input
              value={value.toFixed(2)}
              disableUnderline
              endAdornment={'x'}
              onFocus={() => setHasFocusOnValueInput(true)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              inputComponent={NumberFormatter as any}
              onBlur={(event) => {
                try {
                  const value = Number(event.target.value);
                  const newValue = setValue(value);
                  onChangeCommitted(newValue);
                } catch {
                  // On parsing error nothing changes
                }
                setHasFocusOnValueInput(false);
              }}
              sx={{
                input: {
                  textAlign: 'right',
                  width: '4ch',
                },
                color: theme.palette.typography.main,
                fontSize: {
                  xs: theme.typography.h4.fontSize,
                  sm: theme.typography.h4.fontSize,
                  md: theme.typography.h3.fontSize,
                },
                fontWeight: theme.typography.fontWeightMedium,
                marginBottom: theme.spacing(0),
              }}
            />
          </ValueContainer>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(1),
              marginLeft: theme.spacing(-0.5),
              borderRightWidth: '1px',
              borderColor: theme.palette.borders.paper,
            }}
          />
          <SliderContainer>
            {isRangeSlider ? (
              <RangeSlider
                min={min}
                max={max}
                disableBelowBaseValue={disableBelowBaseValue}
                baseValue={baseValue}
                currentValue={value}
                onChange={onSliderChange}
                onChangeCommitted={onSliderChangeCommitted}
              />
            ) : (
              <SliderBasic
                min={min}
                max={max}
                step={SLIDER_STEP_SIZE}
                value={value}
                marks={Array.from({ length: 10 }, (_, i) => ({
                  value: ((max - min) * i) / 9 + min,
                  label: '',
                  color:
                    ((max - min) * i) / 9 + min <= value
                      ? theme.palette.secondary.light
                      : theme.palette.borders.paper,
                }))}
                showMinMax={false}
                showThumb
                disabled={false}
                onChange={onSliderChange}
                onChangeCommitted={onSliderChangeCommitted}
              />
            )}
          </SliderContainer>
        </Container>
        {sliderLeverageInfo && (
          <LeverageInfoContainer>
            {sliderLeverageInfo.map(
              ({ caption, value, suffix, toolTipTitle, toolTipText }) => (
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: theme.spacing(1),
                    justifyContent: 'space-between',
                    alignContent: 'baseline',
                  }}
                >
                  <Caption sx={{ display: 'flex' }}>
                    {caption}
                    {toolTipTitle && toolTipText && (
                      <InfoTooltip
                        iconColor={theme.palette.typography.accent}
                        iconSize={theme.spacing(2)}
                        sx={{
                          marginLeft: theme.spacing(1),
                        }}
                        ToolTipComp={() => (
                          <Box sx={{ color: 'black' }}>
                            <Caption
                              sx={{
                                color: theme.palette.typography.main,
                                fontWeight: '600',
                                marginBottom: theme.spacing(2),
                              }}
                            >
                              {toolTipTitle}
                            </Caption>
                            <Caption>{toolTipText}</Caption>
                          </Box>
                        )}
                      />
                    )}
                  </Caption>
                  <Caption main fontWeight="medium">
                    {typeof value === 'number' ? (
                      <CountUp value={value} suffix={suffix} decimals={4} />
                    ) : (
                      value
                    )}
                  </Caption>
                </Box>
              )
            )}
          </LeverageInfoContainer>
        )}
        <Caption sx={{ marginTop: theme.spacing(1.5) }}>
          {bottomCaption}
        </Caption>
        <ErrorMessage
          variant={isError ? 'error' : 'warning'}
          message={captionMsg && <FormattedMessage {...captionMsg} />}
        />
      </Box>
    );
  }
);
