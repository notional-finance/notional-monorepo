import {
  useNotional,
  useAccount,
  useCurrencyData,
  useRiskRatios,
} from '@notional-finance/notionable-hooks';
import {
  TransactionData,
  TransactionFunction,
} from '@notional-finance/notionable';
import { AssetType, TypedBigNumber } from '@notional-finance/sdk';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { TradePropertyKeys } from '@notional-finance/trade';
import { useFormState, useQueryParams } from '@notional-finance/utils';
import {
  PORTFOLIO_ACTIONS,
  tradeDefaults,
} from '@notional-finance/shared-config';
import { useEffect } from 'react';

interface RedeemNTokenState {
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  selectedToken: string;
  netCashBalance: TypedBigNumber | undefined;
  netNTokenBalance: TypedBigNumber | undefined;
  noteIncentivesMinted: TypedBigNumber | undefined;
  redemptionFees: TypedBigNumber | undefined;
}

const initialRedeemNTokenState = {
  inputAmount: undefined,
  hasError: false,
  selectedToken: '',
  netCashBalance: undefined,
  netNTokenBalance: undefined,
  noteIncentivesMinted: undefined,
  redemptionFees: undefined,
};

export function useRedeemNToken(action: PORTFOLIO_ACTIONS) {
  const [state, updateRedeemNTokenState] = useFormState<RedeemNTokenState>(
    initialRedeemNTokenState
  );
  const { notional } = useNotional();
  const { address, accountDataCopy, balanceSummary, assetSummary } =
    useAccount();
  const {
    selectedToken,
    hasError,
    inputAmount,
    netNTokenBalance,
    noteIncentivesMinted,
    redemptionFees,
  } = state;
  const { assetKey } = useQueryParams();
  const isDeleverage = action === PORTFOLIO_ACTIONS.DELEVERAGE && assetKey;
  const selectedAsset = isDeleverage ? assetSummary.get(assetKey) : undefined;
  const {
    id: currencyId,
    nTokenSymbol,
    assetSymbol,
  } = useCurrencyData(selectedAsset?.symbol || selectedToken);

  let availableTokens: string[] = [];
  if (isDeleverage && nTokenSymbol) {
    availableTokens = [nTokenSymbol];
  } else {
    availableTokens = Array.from(balanceSummary.values())
      .filter((b) => b.nTokenBalance?.isPositive() && !!b.nTokenSymbol)
      .map((b) => b.nTokenSymbol!);
  }

  useEffect(() => {
    // The selected token must be the nTokenSymbol
    if (
      isDeleverage &&
      selectedAsset &&
      nTokenSymbol &&
      selectedToken !== nTokenSymbol
    )
      updateRedeemNTokenState({ selectedToken: nTokenSymbol });
  }, [
    isDeleverage,
    selectedAsset,
    nTokenSymbol,
    selectedToken,
    updateRedeemNTokenState,
  ]);

  let cashFromRedemption: TypedBigNumber | undefined;
  let lendfCashAmount: TypedBigNumber | undefined;
  let redemptionRate: number | undefined;

  try {
    cashFromRedemption =
      currencyId && netNTokenBalance
        ? NTokenValue.getAssetFromRedeemNToken(
            currencyId,
            netNTokenBalance.neg()
          )
        : undefined;
  } catch {
    // If this errors then the account is unable to redeem any nTokens
  }
  const cashToPortfolio = cashFromRedemption?.toAssetCash();
  const redeemFees = redemptionFees?.toUnderlying();

  if (isDeleverage && selectedAsset?.market && cashFromRedemption) {
    try {
      lendfCashAmount = selectedAsset.market.getfCashAmountGivenCashAmount(
        cashFromRedemption.toUnderlying(true)
      );
      redemptionRate = selectedAsset.market.interestRate(
        lendfCashAmount,
        cashFromRedemption?.toUnderlying()
      );
    } catch {
      // If this throws an error then the user cannot lend the given fCash
      // amount to repay
    }
  }

  const canSubmit =
    hasError === false &&
    inputAmount?.isPositive() === true &&
    !!notional &&
    !!address &&
    !!currencyId &&
    !!cashFromRedemption;

  const {
    loanToValue: updatedLoanToValue,
    collateralRatio: updatedCollateralRatio,
  } = useRiskRatios(accountDataCopy);

  let transactionData: TransactionData | undefined;
  if (canSubmit) {
    accountDataCopy.updateBalance(
      currencyId,
      cashFromRedemption,
      netNTokenBalance
    );

    if (lendfCashAmount && selectedAsset) {
      accountDataCopy.updateAsset({
        currencyId: selectedAsset.currencyId,
        maturity: selectedAsset.maturity,
        assetType: AssetType.fCash,
        notional: lendfCashAmount,
        settlementDate: selectedAsset.maturity,
      });
    }

    let buildTransactionCall: TransactionFunction;
    if (isDeleverage && lendfCashAmount && redemptionRate) {
      const minLendSlippage = Math.max(
        redemptionRate - tradeDefaults.defaultAnnualizedSlippage,
        0
      );
      buildTransactionCall = {
        transactionFn: notional.deleverageNToken,
        // Set to sell token assets and accept residuals
        transactionArgs: [
          address,
          selectedAsset,
          inputAmount,
          lendfCashAmount,
          minLendSlippage,
        ],
      };
    } else {
      // If we are in deleverage but against an ifCash asset, then we will still just
      // go to redeem ntoken direct and leave the cash in the portfolio
      buildTransactionCall = {
        transactionFn: notional.redeemNTokenDirect,
        // Set to sell token assets and accept residuals
        transactionArgs: [address, currencyId, inputAmount, true, true],
      };
    }

    transactionData = {
      transactionHeader: '',
      buildTransactionCall,
      transactionProperties: {
        [TradePropertyKeys.nTokensRedeemed]: inputAmount,
        [TradePropertyKeys.amountToPortfolio]: cashToPortfolio?.toUnderlying(),
        [TradePropertyKeys.nTokenRedeemSlippage]: redeemFees,
        [TradePropertyKeys.incentivesMinted]: noteIncentivesMinted,
        [TradePropertyKeys.loanToValue]: updatedLoanToValue ?? undefined,
        [TradePropertyKeys.collateralRatio]:
          updatedCollateralRatio ?? undefined,
      },
    };
  }

  return {
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    transactionData,
    canSubmit,
    availableTokens,
    selectedToken,
    sidebarInfo: {
      [TradePropertyKeys.amountToPortfolio]:
        cashToPortfolio?.toUnderlying() ||
        (assetSymbol
          ? TypedBigNumber.fromBalance(0, assetSymbol, true).toUnderlying()
          : undefined),
      [TradePropertyKeys.nTokenRedeemSlippage]: redeemFees,
      [TradePropertyKeys.incentivesMinted]: noteIncentivesMinted,
    },
    updateRedeemNTokenState,
  };
}
