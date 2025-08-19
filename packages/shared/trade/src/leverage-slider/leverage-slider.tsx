import {
  CountUp,
  PageLoading,
  SliderInput,
  useSliderInputRef,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useCallback, useEffect } from 'react';
import { MessageDescriptor } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

interface LeverageSliderProps {
  inputLabel: MessageDescriptor;
  cashBorrowed?: TokenBalance;
  errorMsg?: MessageDescriptor;
  infoMsg?: MessageDescriptor;
  bottomCaption?: JSX.Element;
  isDeleverage?: boolean;
  showMinMax?: boolean;
  onChange?: (leverageRatio: number) => void;
}

export const LeverageSlider = observer(
  ({
    inputLabel,
    errorMsg,
    infoMsg,
    cashBorrowed,
    bottomCaption,
    isDeleverage,
    showMinMax,
    onChange,
  }: LeverageSliderProps) => {
    const trade = useCurrentTradeContext();
    const debtBalance = trade?.debtBalance;
    const maxLeverageRatio = trade?.maxLeverageRatio;
    const minLeverageRatio = trade?.minLeverageRatio;
    const leverageRatio = trade?.leverageRatio;
    const { sliderInputRef, setSliderInput } = useSliderInputRef();

    const borrowOrRepayAmount = cashBorrowed
      ? cashBorrowed.toUnderlying().abs()
      : debtBalance?.toUnderlying().abs();

    const topRightCaption =
      borrowOrRepayAmount !== undefined ? (
        <>
          {isDeleverage ? (
            <FormattedMessage defaultMessage={'Repay Amount:'} />
          ) : (
            <FormattedMessage defaultMessage={'Borrow Amount:'} />
          )}
          &nbsp;
          <CountUp
            value={borrowOrRepayAmount.abs().toFloat()}
            suffix={` ${borrowOrRepayAmount.symbol || ''}`}
            decimals={2}
          />
        </>
      ) : undefined;

    const onChangeCommitted = useCallback(
      (leverageRatio: number) => {
        if (!isFinite(leverageRatio)) return;

        trade?.setLeverageRatio(leverageRatio);
      },
      [trade]
    );

    useEffect(() => {
      // If the component is mounted and the ref does not match the defined limit, set it
      // to match the store. This happens because the slider initializes to a min value on
      // component mount.
      if (
        !!leverageRatio &&
        leverageRatio !== sliderInputRef.current?.getInputValue()
      ) {
        setSliderInput(leverageRatio, false);
      }
    });

    return maxLeverageRatio ? (
      <SliderInput
        ref={sliderInputRef}
        min={minLeverageRatio || 0}
        max={maxLeverageRatio}
        onChangeCommitted={onChange || onChangeCommitted}
        infoMsg={infoMsg}
        errorMsg={errorMsg}
        showMinMax={showMinMax}
        topRightCaption={topRightCaption}
        bottomCaption={bottomCaption}
        inputLabel={inputLabel}
      />
    ) : (
      <PageLoading />
    );
  }
);
