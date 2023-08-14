import NumberFormat from 'react-number-format';
import { Box, Input, styled, useTheme } from '@mui/material';
import { InputLabel } from '../input-label/input-label';
import { useCallback, useRef, useState } from 'react';
import SliderBasic from '../slider-basic/slider-basic';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Caption, LabelValue } from '../typography/typography';
import ErrorMessage from '../error-message/error-message';
import React from 'react';
import CountUp from '../count-up/count-up';

export interface SliderInputProps {
  min: number;
  max: number;
  onChangeCommitted: (value: number) => void;
  sliderStep?: number;
  displayStep?: number;
  errorMsg?: MessageDescriptor;
  infoMsg?: MessageDescriptor;
  inputLabel?: MessageDescriptor;
  topRightCaption?: JSX.Element;
  bottomCaption?: JSX.Element;
  sliderLeverageInfo?: {
    debtHeading: MessageDescriptor;
    assetHeading: MessageDescriptor;
    debtValue?: number;
    assetValue?: number;
    debtSuffix?: string;
    assetSuffix?: string;
  };
}

export interface SliderInputHandle {
  setInputOverride: (input: number, emitChange?: boolean) => void;
}

const Container = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  display: flex;
  height: ${theme.spacing(7)};
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
  max-width: 25%;
`
);

const LeverageInfoContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  padding-top: ${theme.spacing(1)};
  padding-bottom: ${theme.spacing(1)};
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

export const SliderInput = React.forwardRef<
  SliderInputHandle,
  SliderInputProps
>(
  (
    {
      min,
      max,
      onChangeCommitted,
      sliderStep = 0.1,
      displayStep = 0.01,
      errorMsg,
      infoMsg,
      inputLabel,
      topRightCaption,
      bottomCaption,
      sliderLeverageInfo,
    },
    ref
  ) => {
    const theme = useTheme();
    const [value, setValue] = useState(min);
    const [hasFocus, setHasFocus] = useState(false);
    const captionMsg = errorMsg || infoMsg;
    const isError = !!errorMsg;

    React.useImperativeHandle(ref, () => ({
      setInputOverride: (input: number, emitChange = true) => {
        // Only execute change commits greater than the step size
        // otherwise rounding errors will trigger changes
        if (Math.abs(input - value) > displayStep) {
          setValue(input);
          if (emitChange) onChangeCommitted(input);
        }
      },
    }));

    return (
      <Box>
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
              hasFocus ? theme.palette.info.main : theme.palette.borders.paper
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
              borderRight: `1px solid ${
                hasFocus ? theme.palette.info.main : theme.palette.borders.paper
              }`,
            }}
          >
            <Input
              value={value.toFixed(2)}
              disableUnderline
              endAdornment={'x'}
              onFocus={() => setHasFocus(true)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              inputComponent={NumberFormatter as any}
              onBlur={(event) => {
                try {
                  const value = Number(event.target.value);
                  setValue(value);
                  onChangeCommitted(value);
                } catch {
                  // On parsing error nothing changes
                }
                setHasFocus(false);
              }}
              sx={{
                input: {
                  textAlign: 'right',
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
          <SliderContainer>
            <SliderBasic
              min={min}
              max={max}
              step={sliderStep}
              value={value}
              disabled={false}
              onChange={(v) => {
                setValue(v);
                if (!hasFocus) setHasFocus(true);
              }}
              onChangeCommitted={(v) => {
                setValue(v);
                setHasFocus(false);
                // Use a setTimeout here before triggering onChangeCommit to ensure
                // that the slider animation completes before we trigger otherwise
                // it will look "jumpy" to the user
                setTimeout(() => {
                  onChangeCommitted(value);
                }, 100);
              }}
            />
          </SliderContainer>
        </Container>
        {sliderLeverageInfo && (
          <LeverageInfoContainer>
            <Box>
              <Caption>
                <FormattedMessage {...sliderLeverageInfo.assetHeading} />
              </Caption>
              <LabelValue>
                <CountUp
                  value={sliderLeverageInfo.assetValue}
                  suffix={sliderLeverageInfo.assetSuffix}
                />
              </LabelValue>
            </Box>
            <Box>
              <Caption>
                <FormattedMessage {...sliderLeverageInfo.debtHeading} />
              </Caption>
              <LabelValue>
                <CountUp
                  value={sliderLeverageInfo.debtValue}
                  suffix={sliderLeverageInfo.debtSuffix}
                />
              </LabelValue>
            </Box>
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
