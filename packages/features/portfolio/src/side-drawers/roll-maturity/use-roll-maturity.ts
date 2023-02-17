import { useAccount, useNotional } from '@notional-finance/notionable-hooks';
import { AssetType, TypedBigNumber } from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { TradePropertyKeys, TransactionData } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import { LEND_BORROW, tradeDefaults } from '@notional-finance/shared-config';
import { convertRateToFloat } from '@notional-finance/helpers';

interface RollMaturityState {
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  selectedMarketKey: string;
  partialRoll: boolean;
}

const initialRollMaturityState = {
  inputAmount: undefined,
  hasError: false,
  selectedMarketKey: '',
  partialRoll: false,
};

export function useRollMaturity(assetKey: string | undefined) {
  const [rollMaturityState, updateRollMaturityState] =
    useFormState<RollMaturityState>(initialRollMaturityState);
  const { inputAmount, hasError, selectedMarketKey, partialRoll } =
    rollMaturityState;
  const { notional } = useNotional();
  const { address, accountDataCopy, assetSummary } = useAccount();

  const selectedAsset = assetKey ? assetSummary.get(assetKey) : undefined;
  const selectedToken = selectedAsset?.underlyingSymbol;
  const lendOrBorrow = selectedAsset?.fCash?.notional.isPositive()
    ? LEND_BORROW.LEND
    : LEND_BORROW.BORROW;
  const rollfCashAmount =
    lendOrBorrow === LEND_BORROW.LEND
      ? inputAmount ?? selectedAsset?.fCash?.notional
      : // Flip the input amount sign when borrowing
        inputAmount?.neg() ?? selectedAsset?.fCash?.notional;

  const rollFactors =
    selectedAsset && rollfCashAmount
      ? selectedAsset.getRollFactors(rollfCashAmount)
      : [];
  const maturityData = rollFactors.map(({ tradeRate, market }) => {
    return {
      marketKey: market.marketKey,
      maturity: market.maturity,
      tradeRate: tradeRate ? convertRateToFloat(tradeRate) : undefined,
      tradeRateString: tradeRate ? Market.formatInterestRate(tradeRate) : '',
      hasLiquidity: market.hasLiquidity,
    };
  });

  const selectedRollFactors = rollFactors.find(
    ({ market }) => market.marketKey === selectedMarketKey
  );
  const canSubmit =
    hasError === false &&
    !!selectedRollFactors &&
    !!selectedRollFactors.newfCash &&
    !!selectedAsset &&
    !!rollfCashAmount &&
    !!notional &&
    !!address;

  let transactionData: TransactionData | undefined = undefined;
  if (canSubmit) {
    // Removes the fCash rolled
    accountDataCopy.updateAsset({
      currencyId: selectedAsset.currencyId,
      maturity: selectedAsset.maturity,
      assetType: AssetType.fCash,
      notional: rollfCashAmount.neg(),
      settlementDate: selectedAsset.maturity,
    });

    accountDataCopy.updateAsset({
      currencyId: selectedAsset.currencyId,
      maturity: selectedRollFactors.market.maturity,
      assetType: AssetType.fCash,
      notional: selectedRollFactors.newfCash,
      settlementDate: selectedRollFactors.market.maturity,
    });

    const buildTransactionCall = {
      transactionFn:
        lendOrBorrow === LEND_BORROW.BORROW
          ? notional.rollBorrow
          : notional.rollLend,
      transactionArgs: [
        address,
        selectedAsset.fCash,
        rollfCashAmount,
        selectedRollFactors.market.marketIndex,
        (tradeDefaults.defaultAnnualizedSlippage / 2) * -1, // minLendSlippageTolerance,
        tradeDefaults.defaultAnnualizedSlippage / 2, // minBorrowSlippageTolerance,
      ],
    };

    transactionData = {
      buildTransactionCall,
      transactionHeader: '',
      transactionProperties: {
        [TradePropertyKeys.newMaturity]: selectedRollFactors.market.maturity,
        [TradePropertyKeys.newfCashAmount]: selectedRollFactors.newfCash,
        [TradePropertyKeys.apy]: selectedRollFactors.tradeRate,
      },
    };
  }

  return {
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    transactionData,
    canSubmit,
    selectedMarketKey,
    maturityData,
    selectedToken,
    lendOrBorrow,
    partialRoll,
    updateRollMaturityState,
  };
}
