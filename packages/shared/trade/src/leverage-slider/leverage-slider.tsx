import {
  CountUp,
  PageLoading,
  SliderInput,
  useSliderInputRef,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useCallback, useEffect } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

interface LeverageSliderProps {
  inputLabel: MessageDescriptor;
  errorMsg?: MessageDescriptor;
  infoMsg?: MessageDescriptor;
  allowDeleverage?: boolean;
}

export const LeverageSlider = observer(
  ({ inputLabel, errorMsg, infoMsg, allowDeleverage }: LeverageSliderProps) => {
    const trade = useCurrentTradeContext();
    const debtBalance = trade?.debtBalance;
    const maxLeverageRatio = trade?.maxLeverageRatio;
    const minLeverageRatio = trade?.minLeverageRatio;
    const defaultLeverageRatio = trade?.defaultLeverageRatio;
    const leverageRatio = trade?.leverageRatio;
    const { sliderInputRef, setSliderInput } = useSliderInputRef();
    const isDeleverage = debtBalance?.isPositive();
    const debtBalanceUnderlying = debtBalance?.toUnderlying();
    const canSubmit = trade?.canSubmit();

    const topRightCaption =
      debtBalanceUnderlying !== undefined ? (
        <>
          {isDeleverage ? (
            <FormattedMessage defaultMessage={'Repay Amount:'} />
          ) : (
            <FormattedMessage defaultMessage={'Borrow Amount:'} />
          )}
          &nbsp;
          <CountUp
            value={debtBalanceUnderlying.abs().toFloat()}
            suffix={` ${debtBalanceUnderlying.symbol || ''}`}
            decimals={4}
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

    let bottomCaption: React.ReactNode | undefined = undefined;
    const isAdjust = trade?.tradeType === 'AdjustVaultLeverage';
    if (!allowDeleverage && isAdjust) {
      bottomCaption = (
        <FormattedMessage
          defaultMessage={
            'No instant withdrawal, you can only increase your leverage. Initiate smart withdraw or repay debt to deleverage.'
          }
        />
      );
    } else if (isDeleverage && isAdjust && canSubmit) {
      bottomCaption = (
        <FormattedMessage
          defaultMessage={
            'Reducing leverage: transaction will sell your collateral to repay your borrow.'
          }
        />
      );
    }

    return maxLeverageRatio ? (
      <SliderInput
        ref={sliderInputRef}
        min={minLeverageRatio || 0}
        // Reduce the max leverage a bit so that we don't go over the limit
        max={maxLeverageRatio * 0.98}
        isRangeSlider={trade?.tradeType === 'AdjustVaultLeverage'}
        onChangeCommitted={onChangeCommitted}
        infoMsg={infoMsg}
        errorMsg={errorMsg}
        disableBelowBaseValue={allowDeleverage === false}
        baseValue={defaultLeverageRatio}
        topRightCaption={topRightCaption}
        bottomCaption={bottomCaption}
        inputLabel={inputLabel}
      />
    ) : (
      <PageLoading />
    );
  }
);
