import { AccountData } from '@notional-finance/sdk';
import { useAccount } from './use-account';

// See Documentation Here:
// https://docs.notional.finance/developer-documentation/off-chain/typescript-sdk-reference/risk-metrics#risk-ratios
export function useRiskRatios(_accountDataCopy?: AccountData) {
  const { accountDataCopy: a } = useAccount();
  const accountDataCopy = _accountDataCopy?.copy() || a;

  const { totalETHDebts, totalETHValue, loanToValue, haircutLoanToValue, maxLoanToValue } =
    accountDataCopy.loanToValueRatio();

  const collateralRatio = accountDataCopy.collateralRatio();
  const bufferedCollateralRatio = accountDataCopy.bufferedCollateralRatio();

  // Calculates the total amount of free collateral as a ratio of total net value
  const { netETHCollateralWithHaircut, netETHDebtWithBuffer, netUnderlyingAvailable } =
    accountDataCopy.getFreeCollateral();
  const netFC = netETHCollateralWithHaircut.sub(netETHDebtWithBuffer);
  const netValue = totalETHValue.sub(totalETHDebts);
  const fcToNetValue = !netValue.isZero()
    ? (netFC.scale(1e8, netValue).toNumber() / 1e8) * 100
    : null;
  const currentCollateral = Array.from(netUnderlyingAvailable.values()).filter((v) =>
    v.isPositive()
  );

  return {
    // All of these metrics are returned as positive floating point numbers
    // scaled by 100 (on the percentage scale). Collateral ratios are unbounded
    // where loan to value ratios are bounded between 0 and 100.
    collateralRatio,
    bufferedCollateralRatio,
    loanToValue,
    haircutLoanToValue,
    maxLoanToValue,
    // A typed big numbers in ETH terms
    totalETHDebts,
    totalETHValue,
    fcToNetValue,
    currentCollateral,
  };
}
