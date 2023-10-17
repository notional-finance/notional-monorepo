import {
  CountUp,
  PageLoading,
  SliderInput,
  useSliderInputRef,
} from '@notional-finance/mui';
import { FormattedMessage, defineMessage } from 'react-intl';
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
      debtOptions,
      debt,
    },
    updateState,
  } = context;
  const { sliderInputRef, setSliderInput } = useSliderInputRef();
  const borrowRate = debtOptions?.find(
    (o) => o.token.id === debt?.id
  )?.interestRate;
  const topRightCaption =
    borrowRate !== undefined ? (
      <>
        <CountUp value={borrowRate} suffix={'%'} decimals={2} />
        &nbsp;
        {tradeType === 'WithdrawAndRepayVault' ? (
          <FormattedMessage defaultMessage={'Repay APY'} />
        ) : (
          <FormattedMessage defaultMessage={'Borrow APY'} />
        )}
      </>
    ) : undefined;

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

  useEffect(() => {
    // If the component is mounted and the ref does not match the defined limit, set it
    // to match the store. This happens because the slider initializes to a min value on
    // component mount.
    if (
      !!riskFactorLimit?.limit &&
      riskFactorLimit.limit !== sliderInputRef.current?.getInputValue()
    ) {
      setSliderInput(riskFactorLimit.limit as number, false);
    }
  });

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
        debtHeading:
          tradeType === 'WithdrawAndRepayVault'
            ? defineMessage({ defaultMessage: 'Debt Repaid' })
            : defineMessage({ defaultMessage: 'Borrow Amount' }),
        assetHeading:
          tradeType === 'WithdrawAndRepayVault'
            ? defineMessage({ defaultMessage: 'Assets Sold' })
            : defineMessage({ defaultMessage: 'Asset Amount' }),
        debtValue: cashBorrowed
          ? cashBorrowed.toUnderlying().abs().toFloat()
          : debtBalance?.toUnderlying().abs().toFloat(),
        debtSuffix: ` ${zeroUnderlying?.symbol || ''}`,
        assetValue: collateralBalance?.abs().toUnderlying().toFloat(),
        assetSuffix: ` ${zeroUnderlying?.symbol || ''}`,
      }}
    />
  ) : (
    <PageLoading />
  );
};
