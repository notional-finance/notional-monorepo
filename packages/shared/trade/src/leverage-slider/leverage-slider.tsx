import { SliderInput, useSliderInputRef } from '@notional-finance/mui';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { useContext, useEffect } from 'react';
import { MessageDescriptor } from 'react-intl';

interface LeverageSliderProps {
  defaultLeverageRatio: number;
  maxLeverageRatio: number;
  context: BaseContext;
  inputLabel: MessageDescriptor;
  errorMsg?: MessageDescriptor;
  infoMsg?: MessageDescriptor;
  rightCaption?: JSX.Element;
  bottomCaption?: JSX.Element;
}

export const LeverageSlider = ({
  inputLabel,
  maxLeverageRatio,
  defaultLeverageRatio,
  errorMsg,
  infoMsg,
  rightCaption,
  bottomCaption,
  context,
}: LeverageSliderProps) => {
  const {
    state: { riskFactorLimit },
    updateState,
  } = useContext(context);
  const { sliderInputRef, setSliderInput } = useSliderInputRef();

  // Sets the initial default leverage ratio
  useEffect(() => {
    if (!riskFactorLimit) {
      updateState({
        riskFactorLimit: {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        },
      });
      setSliderInput(defaultLeverageRatio);
    }
  }, [riskFactorLimit, defaultLeverageRatio, setSliderInput, updateState]);

  return (
    <SliderInput
      ref={sliderInputRef}
      min={0}
      max={maxLeverageRatio}
      onChangeCommitted={(leverageRatio) =>
        updateState({
          riskFactorLimit: {
            riskFactor: 'leverageRatio',
            limit: leverageRatio,
          },
        })
      }
      infoMsg={infoMsg}
      errorMsg={errorMsg}
      rightCaption={rightCaption}
      bottomCaption={bottomCaption}
      inputLabel={inputLabel}
    />
  );
};
