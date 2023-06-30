import { useAccount } from '@notional-finance/notionable-hooks';
import { AssetType, TypedBigNumber } from '@notional-finance/sdk';
import { CashOrFCash } from '@notional-finance/trade';

export function useRemoveAsset(
  assetKey: string | undefined,
  cashOrfCash: CashOrFCash,
  netCashAmount: TypedBigNumber | undefined,
  netfCashAmount: TypedBigNumber | undefined
) {
  const { address, accountDataCopy, assetSummary } = useAccount();
  const selectedAsset = assetKey ? assetSummary.get(assetKey) : undefined;
  const defaultSelectedToken = selectedAsset?.underlyingSymbol;
  const cashBalance = undefined as TypedBigNumber | undefined;

  const availableTokens: string[] = [];
  if (cashOrfCash === 'fCash' && selectedAsset) {
    // On fCash input, only the underlying is available
    availableTokens.push(selectedAsset.underlyingSymbol);
  } else if (selectedAsset) {
    // On Cash input, both asset and underlying are available
    availableTokens.push(selectedAsset.underlyingSymbol);
    if (selectedAsset.underlyingSymbol !== selectedAsset.symbol) {
      availableTokens.push(selectedAsset.symbol);
    }
  }

  const market = selectedAsset?.market;
  const tradedRate = market
    ? netfCashAmount && netCashAmount && !netCashAmount.isZero()
      ? market.interestRate(netfCashAmount, netCashAmount)
      : market.marketAnnualizedRate()
    : undefined;

  if (selectedAsset && netfCashAmount) {
    accountDataCopy.updateAsset({
      currencyId: selectedAsset.currencyId,
      maturity: selectedAsset.maturity,
      assetType: AssetType.fCash,
      notional: netfCashAmount,
      settlementDate: selectedAsset.maturity,
    });
  }

  return {
    market,
    address,
    updatedAccountData: accountDataCopy,
    selectedAsset,
    availableTokens,
    defaultSelectedToken,
    cashBalance,
    tradedRate,
  };
}
