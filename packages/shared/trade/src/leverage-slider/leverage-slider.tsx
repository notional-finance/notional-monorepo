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
  bottomCaption?: JSX.Element;
}

export const LeverageSlider = ({
  inputLabel,
  errorMsg,
  infoMsg,
  cashBorrowed,
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
  // TODO: this needs to be borrow rate
  const topRightCaption = undefined;

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

  // Sets the initial default leverage ratio, the default leverage ratio for IncreaseVaultPosition
  // is equal to the exiting leverage ratio and causes a failure in convergence. So by default
  // we don't have it propagate a change into the store.
  useEffect(() => {
    if (!riskFactorLimit && defaultLeverageRatio !== undefined) {
      if (tradeType !== 'IncreaseVaultPosition') {
        updateState({
          riskFactorLimit: {
            riskFactor: 'leverageRatio',
            limit: defaultLeverageRatio,
          },
        });
      }
      setSliderInput(
        defaultLeverageRatio,
        tradeType !== 'IncreaseVaultPosition'
      );
    }
  }, [
    riskFactorLimit,
    defaultLeverageRatio,
    setSliderInput,
    updateState,
    tradeType,
  ]);

  return defaultLeverageRatio && maxLeverageRatio ? (
    <SliderInput
      ref={sliderInputRef}
      min={0}
      max={maxLeverageRatio}
      onChangeCommitted={onChangeCommitted}
      infoMsg={infoMsg}
      errorMsg={errorMsg}
      topRightCaption={topRightCaption}
      bottomCaption={bottomCaption}
      inputLabel={inputLabel}
      sliderLeverageInfo={{
        debtHeading: defineMessage({ defaultMessage: 'Borrow Amount' }),
        assetHeading: defineMessage({ defaultMessage: 'Asset Amount' }),
        debtValue: cashBorrowed
          ? cashBorrowed.toUnderlying().abs().toFloat()
          : debtBalance?.toUnderlying().abs().toFloat(),
        debtSuffix: ` ${zeroUnderlying?.symbol || ''}`,
        assetValue: collateralBalance?.toUnderlying().toFloat(),
        assetSuffix: ` ${zeroUnderlying?.symbol || ''}`,
      }}
    />
  ) : (
    <PageLoading />
  );
};
