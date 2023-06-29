import { useNotional } from '@notional-finance/notionable-hooks';
import {
  CollateralAction,
  CollateralActionType,
  TypedBigNumber,
} from '@notional-finance/sdk';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { useFormState } from '@notional-finance/utils';
import {
  convertRateToFloat,
  formatMaturity,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { tradeDefaults } from '@notional-finance/shared-config';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { tradeErrors } from '../tradeErrors';
import { MaturityData } from '@notional-finance/notionable';

interface CollateralSelectState {
  selectedCollateral: string;
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
}

const initialCollateralSelectState = {
  selectedCollateral: '',
  inputAmount: undefined,
  hasError: false,
};

interface CollateralOption {
  symbol: string;
  apy: number;
  apySuffix: string;
  collateralValue: number;
  optionType: CollateralActionType;
  marketKey?: string;
  minLendSlippage?: number;
  fCashAmount?: TypedBigNumber;
  tokenIcon: string;
}

export function useCollateralSelect(
  selectedToken: string,
  selectedBorrowMarketKey?: string | null
) {
  const [state, updateCollateralSelectState] =
    useFormState<CollateralSelectState>(initialCollateralSelectState);
  const { selectedCollateral, inputAmount, hasError } = state;
  const {
    id: currencyId,
    nTokenSymbol,
    assetSymbol,
    isUnderlying,
    underlyingSymbol,
  } = {
    id: undefined,
    nTokenSymbol: undefined,
    assetSymbol: undefined,
    isUnderlying: true,
    underlyingSymbol: undefined,
  };
  const { system } = useNotional();
  const maturityData = [] as MaturityData[];
  const inputUpToDate =
    inputAmount?.symbol === selectedToken || inputAmount === undefined;
  const collateralOptions: CollateralOption[] = [];
  const cashBalance = undefined as TypedBigNumber | undefined;

  if (assetSymbol && inputUpToDate && currencyId && system) {
    let annualSupplyRate = 0;
    try {
      annualSupplyRate = convertRateToFloat(
        system.getAnnualizedSupplyRate(currencyId).toNumber()
      );
    } catch {
      // Some currencies do not have an annualized supply rate, these will be shown as zero
    }

    collateralOptions.push({
      symbol: assetSymbol,
      apy: annualSupplyRate,
      apySuffix: 'Variable APY',
      collateralValue: inputAmount?.toFloat() || 0,
      optionType: CollateralActionType.ASSET_CASH,
      tokenIcon: assetSymbol,
    });
  }

  if (nTokenSymbol && currencyId && inputUpToDate) {
    const totalNTokenYield =
      NTokenValue.getNTokenBlendedYield(currencyId) +
      NTokenValue.getNTokenIncentiveYield(currencyId);

    const nTokenCollateralValueAssetCash = inputAmount
      ? NTokenValue.convertNTokenToInternalAsset(
          currencyId,
          NTokenValue.getNTokensToMint(
            currencyId,
            inputAmount.toAssetCash(true)
          ),
          true
        )
      : undefined;

    // Convert the collateral value to the selectedToken denomination
    const collateralValue = isUnderlying
      ? nTokenCollateralValueAssetCash?.toUnderlying()
      : nTokenCollateralValueAssetCash;

    collateralOptions.push({
      symbol: nTokenSymbol,
      apy: convertRateToFloat(totalNTokenYield),
      apySuffix: 'Variable APY',
      collateralValue: collateralValue?.toFloat() || 0,
      optionType: CollateralActionType.NTOKEN,
      tokenIcon: nTokenSymbol,
    });
  }

  if (maturityData && currencyId && system && inputUpToDate) {
    maturityData
      // Filter for only markets where the collateral size is sufficient and does not match
      // the borrow market (if set)
      .filter(
        (m) =>
          m.tradeRate !== undefined && m.fCashId !== selectedBorrowMarketKey
      )
      .forEach((m) => {
        const cashGroup = system.getCashGroup(currencyId);
        const market = system
          .getMarkets(currencyId)
          .find((_m) => _m.marketKey === m.fCashId);
        const fCashPV = m.fCashAmount
          ? cashGroup.getfCashPresentValueUnderlyingInternal(
              m.maturity,
              m.fCashAmount,
              true
            )
          : undefined;
        const collateralValue = isUnderlying
          ? fCashPV?.toUnderlying()
          : fCashPV;
        const minLendSlippage =
          m.fCashAmount && m.cashAmount && market
            ? Math.max(
                0,
                market.interestRate(m.fCashAmount, m.cashAmount) -
                  tradeDefaults.defaultAnnualizedSlippage
              )
            : undefined;

        collateralOptions.push({
          symbol: `${formatMaturity(m.maturity)} f${underlyingSymbol}`,
          apy: m.tradeRate || 0,
          apySuffix: 'Fixed APY',
          collateralValue: collateralValue?.toFloat() || 0,
          marketKey: m.fCashId,
          optionType: CollateralActionType.LEND_FCASH,
          minLendSlippage,
          fCashAmount: m.fCashAmount,
          tokenIcon: `f${underlyingSymbol}`,
        });
      });
  }

  const highestYieldOption = collateralOptions
    .slice()
    .sort((a, b) => b.apy - a.apy)
    .find((x) => !!x);

  // Ensure that the asset symbol is selected by default
  const selectedOptionKey =
    collateralOptions.find((c) => c.symbol === selectedCollateral)?.symbol ||
    assetSymbol;
  const selectedOption = collateralOptions.find(
    (c) => c.symbol === selectedOptionKey
  );
  const selectedOptionType = selectedOption?.optionType;
  const selectedMarketKey = selectedOption?.marketKey;
  const selectedMinSlippageRate = selectedOption?.minLendSlippage;
  const selectedfCashAmount = selectedOption?.fCashAmount;

  useEffect(() => {
    if (selectedOptionKey && selectedOptionKey !== selectedCollateral)
      updateCollateralSelectState({ selectedCollateral: selectedOptionKey });
  }, [selectedOptionKey, selectedCollateral, updateCollateralSelectState]);

  const collateralAction: CollateralAction | undefined = useMemo(() => {
    if (selectedOptionType === undefined || inputAmount === undefined)
      return undefined;
    return {
      type: selectedOptionType,
      marketKey: selectedMarketKey,
      amount: inputAmount,
      fCashAmount: selectedfCashAmount,
      minLendSlippage: selectedMinSlippageRate,
      withdrawCashOnLend: cashBalance?.isZero(), // only withdraw cash if there is no balance
    };
    // Disabling linter due to selectedfCashAmount key (which is checked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedOptionType,
    selectedMarketKey,
    inputAmount,
    selectedMinSlippageRate,
    selectedfCashAmount?.hashKey,
    cashBalance?.hashKey,
  ]);

  let warningMsg: React.ReactNode | undefined;
  if (cashBalance?.isNegative()) {
    warningMsg = (
      <FormattedMessage
        {...{
          ...tradeErrors.negativeCashWarningOnDeposit,
          values: {
            cashBalance: cashBalance.neg().toDisplayStringWithSymbol(),
          },
        }}
      />
    );
  }

  return {
    selectedToken,
    collateralOptions,
    selectedOptionKey,
    collateralAction,
    hasError,
    highestApyString: highestYieldOption
      ? `${formatNumberAsPercent(highestYieldOption.apy)} ${
          highestYieldOption.apySuffix
        }`
      : undefined,
    updateCollateralSelectState,
    warningMsg,
  };
}
