import {
  PageLoading,
  SliderInput,
  useSliderInputRef,
} from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useMemo } from 'react';
import { MessageDescriptor } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';

interface LeverageSliderProps {
  context: BaseTradeContext;
  inputLabel: MessageDescriptor;
  cashBorrowed?: TokenBalance;
  errorMsg?: MessageDescriptor;
  infoMsg?: MessageDescriptor;
  rightCaption?: JSX.Element;
  bottomCaption?: JSX.Element;
}

export const LeverageSlider = ({
  inputLabel,
  errorMsg,
  infoMsg,
  cashBorrowed,
  rightCaption,
  bottomCaption,
  context,
}: LeverageSliderProps) => {
  const {
    state: {
      riskFactorLimit,
      debtBalance,
      collateralBalance,
      deposit,
      maxLeverageRatio,
      defaultLeverageRatio,
      tradeType,
    },
    updateState,
  } = context;
  const { sliderInputRef, setSliderInput } = useSliderInputRef();

  // Used to set the context for the leverage ratio slider.
  const args: [number | undefined] | undefined = useMemo(
    () =>
      deposit &&
      (tradeType === 'LeveragedLend' || tradeType === 'LeveragedNToken')
        ? [deposit.currencyId]
        : undefined,
    [deposit, tradeType]
  );

  const zeroUnderlying = useMemo(() => {
    return deposit ? TokenBalance.zero(deposit) : undefined;
  }, [deposit]);

  const onChangeCommitted = useCallback(
    (leverageRatio: number) => {
      updateState({
        riskFactorLimit: {
          riskFactor: 'leverageRatio',
          limit: leverageRatio,
          args,
        },
      });
    },
    [updateState, args]
  );

  // Sets the initial default leverage ratio
  useEffect(() => {
    if (!riskFactorLimit && defaultLeverageRatio !== undefined) {
      updateState({
        riskFactorLimit: {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        },
      });
      setSliderInput(defaultLeverageRatio);
    }
  }, [riskFactorLimit, defaultLeverageRatio, setSliderInput, updateState]);

  return defaultLeverageRatio && maxLeverageRatio ? (
    <SliderInput
      ref={sliderInputRef}
      min={0}
      max={maxLeverageRatio}
      onChangeCommitted={onChangeCommitted}
      infoMsg={infoMsg}
      errorMsg={errorMsg}
      rightCaption={rightCaption}
      bottomCaption={bottomCaption}
      inputLabel={inputLabel}
      sliderLeverageInfo={{
        debtHeading: defineMessage({ defaultMessage: 'Borrow Amount' }),
        assetHeading: defineMessage({ defaultMessage: 'Asset Amount' }),
        debtValue: cashBorrowed
          ? cashBorrowed.toUnderlying().abs().toFloat()
          : debtBalance?.toUnderlying().abs().toFloat(),
        debtSuffix: ` ${zeroUnderlying?.symbol || ''}`,
        assetValue: collateralBalance?.toFloat(),
        assetSuffix: ` ${zeroUnderlying?.symbol || ''}`,
      }}
    />
  ) : (
    <PageLoading />
  );
};
