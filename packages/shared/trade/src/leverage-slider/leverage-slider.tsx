import {
  CountUp,
  PageLoading,
  SliderInput,
  SliderInputProps,
  useSliderInputRef,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useCallback, useEffect, useMemo } from 'react';
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
  additionalSliderInfo?: SliderInputProps['sliderLeverageInfo'];
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
    additionalSliderInfo = [],
    onChange,
  }: LeverageSliderProps) => {
    const trade = useCurrentTradeContext();
    const debtBalance = trade?.debtBalance;
    const collateralBalance = trade?.collateralBalance;
    const maxLeverageRatio = trade?.maxLeverageRatio;
    const minLeverageRatio = trade?.minLeverageRatio;
    const { debt, collateral, deposit } = trade?.selectedTokens ?? {};
    const { debt: debtOptions, collateral: collateralOptions } =
      trade?.computedOptions ?? {};
    const leverageRatio = trade?.leverageRatio;

    const { sliderInputRef, setSliderInput } = useSliderInputRef();
    const borrowRate = trade?.hasSwappedTokens()
      ? collateralOptions?.find((o) => o.token.id === collateral?.id)
          ?.interestRate
      : debtOptions?.find((o) => o.token.id === debt?.id)?.interestRate;
    const topRightCaption =
      borrowRate !== undefined ? (
        <>
          <CountUp value={borrowRate} suffix={'%'} decimals={2} />
          &nbsp;
          {isDeleverage ? (
            <FormattedMessage defaultMessage={'Repay APY'} />
          ) : (
            <FormattedMessage defaultMessage={'Borrow APY'} />
          )}
        </>
      ) : undefined;

    const zeroUnderlying = useMemo(() => {
      return deposit ? TokenBalance.zero(deposit) : undefined;
    }, [deposit]);

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

    const sliderLeverageInfo = [
      {
        caption: isDeleverage ? (
          <FormattedMessage defaultMessage={'Debt Repaid'} />
        ) : (
          <FormattedMessage defaultMessage={'Borrow Amount'} />
        ),
        value: cashBorrowed
          ? cashBorrowed.toUnderlying().abs().toFloat()
          : debtBalance?.toUnderlying().abs().toFloat() ||
            `- ${zeroUnderlying?.symbol || ''}`,
        suffix: ` ${zeroUnderlying?.symbol || ''}`,
      },
      {
        caption: isDeleverage ? (
          <FormattedMessage defaultMessage={'Assets Sold'} />
        ) : (
          <FormattedMessage defaultMessage={'Asset Amount'} />
        ),
        value:
          collateralBalance?.abs().toUnderlying().toFloat() ||
          `- ${zeroUnderlying?.symbol || ''}`,
        suffix: ` ${zeroUnderlying?.symbol || ''}`,
      },
      ...additionalSliderInfo,
    ];

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
        sliderLeverageInfo={sliderLeverageInfo}
      />
    ) : (
      <PageLoading />
    );
  }
);
